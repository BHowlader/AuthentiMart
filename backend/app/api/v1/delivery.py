from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import json

from app.database import get_db
from app.models import Order, User, OrderStatus, OrderTracking, PaymentStatus
from app.schemas import OrderResponse, CourierAssign
from app.utils import get_current_admin
from app.services.courier import get_courier_service

router = APIRouter(prefix="/delivery", tags=["Delivery"])


@router.post("/{order_number}/assign-courier", response_model=OrderResponse)
async def assign_courier(
    order_number: str,
    courier_data: CourierAssign,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Assign an order to a 3rd party courier like Pathao or Steadfast."""
    order = db.query(Order).filter(Order.order_number == order_number).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Only confirmed/processing orders can be sent to courier
    if order.status not in [OrderStatus.CONFIRMED.value, OrderStatus.PROCESSING.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must be Confirmed or Processing to assign courier"
        )

    try:
        # Initialize the correct courier service
        courier_service = get_courier_service(courier_data.courier_name)

        # Prepare order data for the courier API
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

        # Update local order with courier info
        order.courier_name = courier_data.courier_name
        order.courier_tracking_id = result.get("consignment_id")
        order.status = OrderStatus.SHIPPED.value

        # Add tracking entry
        tracking = OrderTracking(
            order_id=order.id,
            status="Shipped",
            description=f"Handed over to {courier_data.courier_name}. Tracking ID: {order.courier_tracking_id}"
        )
        db.add(tracking)

        db.commit()
        db.refresh(order)
        return order

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Courier API Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order with courier provider"
        )


@router.post("/webhook/{provider_name}")
async def courier_webhook(
    provider_name: str,
    request: Request,
    x_webhook_signature: Optional[str] = Header(None, alias="X-Webhook-Signature"),
    x_signature: Optional[str] = Header(None, alias="X-Signature"),
    db: Session = Depends(get_db)
):
    """
    Webhook endpoint to receive status updates from Courier APIs.
    This would be configured in the courier's dashboard.

    Security: Verifies webhook signature to prevent spoofing.
    """
    # Get raw body for signature verification
    body = await request.body()

    # Get the signature from headers (different couriers use different header names)
    signature = x_webhook_signature or x_signature or ""

    # Verify webhook signature
    try:
        courier_service = get_courier_service(provider_name)
        if not courier_service.verify_webhook(body, signature):
            print(f"[Webhook] Invalid signature for {provider_name}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook signature"
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown courier provider: {provider_name}"
        )

    # Parse the payload
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )

    # Extract tracking ID (different couriers use different field names)
    tracking_id = (
        payload.get("consignment_id") or
        payload.get("tracking_id") or
        payload.get("invoice") or
        payload.get("merchant_order_id")
    )
    courier_status = payload.get("status") or payload.get("delivery_status") or ""

    if not tracking_id:
        return {"status": "ignored", "reason": "no_tracking_id"}

    # Find the order by courier tracking ID
    order = db.query(Order).filter(Order.courier_tracking_id == tracking_id).first()

    # If not found by tracking ID, try by order number
    if not order:
        order = db.query(Order).filter(Order.order_number == tracking_id).first()

    if not order:
        print(f"[Webhook] Order not found for tracking_id: {tracking_id}")
        return {"status": "ignored", "reason": "order_not_found"}

    # Map courier status to internal status using the courier service
    internal_status = courier_service.map_status(courier_status)
    description = f"Update from {provider_name}: {courier_status}"

    # Only update if status actually changed
    if internal_status and internal_status != order.status:
        old_status = order.status
        order.status = internal_status

        # If delivered and COD, mark payment as completed
        if internal_status == OrderStatus.DELIVERED.value:
            if order.payment_method == "cod":
                order.payment_status = PaymentStatus.COMPLETED.value
                description += " - Payment collected"

        # Add tracking entry
        tracking = OrderTracking(
            order_id=order.id,
            status=internal_status.replace("_", " ").title(),
            description=description
        )
        db.add(tracking)
        db.commit()

        print(f"[Webhook] Order {order.order_number}: {old_status} -> {internal_status}")

    return {"status": "success", "order_number": order.order_number}


@router.get("/{order_number}/track")
async def track_order(
    order_number: str,
    db: Session = Depends(get_db)
):
    """
    Get real-time tracking status from the courier API.
    """
    order = db.query(Order).filter(Order.order_number == order_number).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    if not order.courier_name or not order.courier_tracking_id:
        return {
            "order_number": order.order_number,
            "status": order.status,
            "courier": None,
            "tracking": [
                {
                    "status": t.status,
                    "description": t.description,
                    "created_at": t.created_at.isoformat() if t.created_at else None
                }
                for t in order.tracking
            ]
        }

    # Get live status from courier
    try:
        courier_service = get_courier_service(order.courier_name)
        live_status = await courier_service.get_status(order.courier_tracking_id)

        return {
            "order_number": order.order_number,
            "status": order.status,
            "courier": {
                "name": order.courier_name,
                "tracking_id": order.courier_tracking_id,
                "live_status": live_status.get("status") if live_status.get("success") else None
            },
            "tracking": [
                {
                    "status": t.status,
                    "description": t.description,
                    "created_at": t.created_at.isoformat() if t.created_at else None
                }
                for t in order.tracking
            ]
        }
    except Exception as e:
        print(f"Error fetching live tracking: {e}")
        return {
            "order_number": order.order_number,
            "status": order.status,
            "courier": {
                "name": order.courier_name,
                "tracking_id": order.courier_tracking_id,
                "live_status": None
            },
            "tracking": [
                {
                    "status": t.status,
                    "description": t.description,
                    "created_at": t.created_at.isoformat() if t.created_at else None
                }
                for t in order.tracking
            ]
        }
