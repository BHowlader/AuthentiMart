from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import Order, User, OrderStatus, OrderTracking, PaymentStatus
from app.schemas import OrderListResponse, OrderResponse, CourierAssign
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
            "amount_to_collect": order.total if order.payment_method == "cod" else 0,
            # Add other necessary fields
        }
        
        # Create order in courier system
        result = courier_service.create_order(order_details)
        
        # Update local order with courier info
        order.courier_name = courier_data.courier_name
        order.courier_tracking_id = result.get("consignment_id")
        order.status = OrderStatus.SHIPPED.value # Mark as shipped/processing
        
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
    payload: dict,
    db: Session = Depends(get_db)
):
    """
    Webhook endpoint to receive status updates from Courier APIs.
    This would be configured in the courier's dashboard.
    """
    # Logic depends heavily on the specific provider's payload structure
    # This is a generic skeletal implementation
    
    tracking_id = payload.get("consignment_id") or payload.get("tracking_id")
    new_status = payload.get("status")
    
    if not tracking_id:
        return {"status": "ignored", "reason": "no_tracking_id"}
        
    order = db.query(Order).filter(Order.courier_tracking_id == tracking_id).first()
    
    if not order:
        return {"status": "ignored", "reason": "order_not_found"}
    
    # Map courier status to internal status
    internal_status = None
    description = f"Update from {provider_name}: {new_status}"
    
    if new_status.lower() in ["delivered", "success"]:
        internal_status = OrderStatus.DELIVERED.value
        if order.payment_method == "cod":
            order.payment_status = PaymentStatus.COMPLETED
            
    elif new_status.lower() in ["cancelled", "returned"]:
        internal_status = OrderStatus.CANCELLED.value
        
    elif new_status.lower() in ["picked_up", "in_transit"]:
        internal_status = OrderStatus.SHIPPED.value
        
    if internal_status and internal_status != order.status:
        order.status = internal_status
        
        db.add(OrderTracking(
            order_id=order.id,
            status=internal_status.replace("_", " ").title(),
            description=description
        ))
        db.commit()
        
    return {"status": "success"}
