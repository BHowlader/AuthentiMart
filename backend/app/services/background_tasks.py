"""
Background task scheduler for autonomous order management.

This module handles:
- Polling courier APIs for status updates
- Auto-cancelling unpaid orders after timeout
- Auto-assigning couriers to confirmed orders
"""

import asyncio
from datetime import datetime, timedelta
from typing import List
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Order, OrderStatus, PaymentStatus, OrderTracking, Product
from app.config import settings
from app.services.courier import get_courier_service, get_default_courier


scheduler = AsyncIOScheduler()


def get_db():
    """Get a database session for background tasks."""
    db = SessionLocal()
    try:
        return db
    finally:
        pass  # Don't close here, caller will close


async def poll_courier_statuses():
    """
    Poll courier APIs for status updates on shipped orders.
    This runs periodically as a fallback for webhooks.
    """
    db = SessionLocal()
    try:
        # Get all orders that are shipped but not yet delivered/cancelled
        orders = db.query(Order).filter(
            Order.status == OrderStatus.SHIPPED.value,
            Order.courier_tracking_id.isnot(None),
            Order.courier_name.isnot(None)
        ).all()

        if not orders:
            return

        # Group orders by courier provider for efficiency
        orders_by_courier = {}
        for order in orders:
            courier_name = order.courier_name.lower()
            if courier_name not in orders_by_courier:
                orders_by_courier[courier_name] = []
            orders_by_courier[courier_name].append(order)

        # Poll each courier
        for courier_name, courier_orders in orders_by_courier.items():
            try:
                courier_service = get_courier_service(courier_name)
                tracking_ids = [o.courier_tracking_id for o in courier_orders]

                # Get bulk status
                statuses = await courier_service.get_bulk_status(tracking_ids)

                # Update orders based on status
                for status_data in statuses:
                    if not status_data.get("success"):
                        continue

                    tracking_id = status_data.get("tracking_id")
                    internal_status = status_data.get("internal_status")

                    # Find the order
                    order = next(
                        (o for o in courier_orders if o.courier_tracking_id == tracking_id),
                        None
                    )

                    if order and internal_status and internal_status != order.status:
                        old_status = order.status
                        order.status = internal_status

                        # If delivered and COD, mark payment as completed
                        if internal_status == OrderStatus.DELIVERED.value:
                            if order.payment_method == "cod":
                                order.payment_status = PaymentStatus.COMPLETED.value

                        # Add tracking entry
                        tracking = OrderTracking(
                            order_id=order.id,
                            status=internal_status.replace("_", " ").title(),
                            description=f"Auto-updated from {courier_name}: {status_data.get('status')}"
                        )
                        db.add(tracking)

                        print(f"[Background] Order {order.order_number}: {old_status} -> {internal_status}")

                db.commit()

            except Exception as e:
                print(f"[Background] Error polling {courier_name}: {e}")
                continue

    except Exception as e:
        print(f"[Background] Error in poll_courier_statuses: {e}")
    finally:
        db.close()


async def cancel_unpaid_orders():
    """
    Auto-cancel orders that haven't been paid within the timeout period.
    Only applies to non-COD orders that are still pending.
    """
    db = SessionLocal()
    try:
        timeout_threshold = datetime.utcnow() - timedelta(hours=settings.payment_timeout_hours)

        # Find unpaid, non-COD orders past the timeout
        orders = db.query(Order).filter(
            Order.status == OrderStatus.PENDING.value,
            Order.payment_status == PaymentStatus.PENDING.value,
            Order.payment_method != "cod",  # COD orders don't need upfront payment
            Order.created_at < timeout_threshold
        ).all()

        for order in orders:
            # Restore stock
            for item in order.items:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if product:
                    product.stock += item.quantity

            # Cancel the order
            order.status = OrderStatus.CANCELLED.value

            # Add tracking entry
            tracking = OrderTracking(
                order_id=order.id,
                status="Cancelled",
                description=f"Auto-cancelled: Payment not received within {settings.payment_timeout_hours} hours"
            )
            db.add(tracking)

            print(f"[Background] Auto-cancelled unpaid order: {order.order_number}")

        if orders:
            db.commit()

    except Exception as e:
        print(f"[Background] Error in cancel_unpaid_orders: {e}")
    finally:
        db.close()


async def auto_assign_courier_to_confirmed():
    """
    Auto-assign default courier to confirmed orders that don't have a courier yet.
    This automates the shipping process.
    """
    if not settings.auto_assign_courier:
        return

    db = SessionLocal()
    try:
        # Find confirmed orders without courier assignment
        orders = db.query(Order).filter(
            Order.status == OrderStatus.CONFIRMED.value,
            Order.courier_name.is_(None),
            Order.courier_tracking_id.is_(None)
        ).all()

        if not orders:
            return

        courier_service = get_default_courier()

        for order in orders:
            try:
                # Prepare order data for courier
                order_details = {
                    "order_number": order.order_number,
                    "recipient_name": order.shipping_name,
                    "recipient_phone": order.shipping_phone,
                    "recipient_address": order.shipping_address,
                    "recipient_city": order.shipping_city,
                    "amount_to_collect": order.total if order.payment_method == "cod" else 0,
                    "notes": order.notes or "",
                    "item_count": len(order.items),
                    "description": f"Order #{order.order_number}"
                }

                # Create order in courier system
                result = await courier_service.create_order(order_details)

                if result.get("success"):
                    # Update order with courier info
                    order.courier_name = settings.default_courier
                    order.courier_tracking_id = result.get("consignment_id")
                    order.status = OrderStatus.SHIPPED.value

                    # Add tracking entry
                    tracking = OrderTracking(
                        order_id=order.id,
                        status="Shipped",
                        description=f"Auto-assigned to {settings.default_courier}. Tracking: {order.courier_tracking_id}"
                    )
                    db.add(tracking)

                    print(f"[Background] Auto-assigned courier for order: {order.order_number}")

            except Exception as e:
                print(f"[Background] Error assigning courier to {order.order_number}: {e}")
                continue

        db.commit()

    except Exception as e:
        print(f"[Background] Error in auto_assign_courier: {e}")
    finally:
        db.close()


def start_scheduler():
    """Start the background task scheduler."""
    # Poll courier statuses every X minutes
    scheduler.add_job(
        poll_courier_statuses,
        IntervalTrigger(minutes=settings.status_poll_interval_minutes),
        id="poll_courier_statuses",
        name="Poll courier APIs for status updates",
        replace_existing=True
    )

    # Check for unpaid orders every hour
    scheduler.add_job(
        cancel_unpaid_orders,
        IntervalTrigger(hours=1),
        id="cancel_unpaid_orders",
        name="Cancel unpaid orders after timeout",
        replace_existing=True
    )

    # Auto-assign couriers every 5 minutes
    scheduler.add_job(
        auto_assign_courier_to_confirmed,
        IntervalTrigger(minutes=5),
        id="auto_assign_courier",
        name="Auto-assign courier to confirmed orders",
        replace_existing=True
    )

    scheduler.start()
    print("[Scheduler] Background task scheduler started")


def stop_scheduler():
    """Stop the background task scheduler."""
    if scheduler.running:
        scheduler.shutdown()
        print("[Scheduler] Background task scheduler stopped")
