from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import httpx
import json
from app.database import get_db
from app.models import Order, Payment, PaymentStatus
from app.schemas import PaymentResponse, BkashPaymentCreate
from app.utils import get_current_user_required
from app.config import settings

router = APIRouter(prefix="/payments", tags=["Payments"])

# bKash Token storage (in production, use Redis or database)
bkash_token_cache = {}

async def get_bkash_token():
    """Get bKash access token."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.bkash_base_url}/tokenized/checkout/token/grant",
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
                "username": settings.bkash_username,
                "password": settings.bkash_password
            },
            json={
                "app_key": settings.bkash_app_key,
                "app_secret": settings.bkash_app_secret
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get("id_token")
        return None

@router.post("/bkash/create")
async def create_bkash_payment(
    payment_data: BkashPaymentCreate,
    current_user = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Create bKash payment."""
    order = db.query(Order).filter(
        Order.id == payment_data.order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.payment_status == PaymentStatus.COMPLETED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order already paid"
        )
    
    # Get bKash token
    token = await get_bkash_token()
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to connect to bKash"
        )
    
    # Create payment request
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.bkash_base_url}/tokenized/checkout/create",
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": token,
                "X-APP-Key": settings.bkash_app_key
            },
            json={
                "mode": "0011",
                "payerReference": str(current_user.id),
                "callbackURL": f"{settings.api_url}/api/v1/payments/bkash/callback",
                "merchantAssociationInfo": "",
                "amount": str(order.total),
                "currency": "BDT",
                "intent": "sale",
                "merchantInvoiceNumber": order.order_number
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Create payment record
            payment = Payment(
                order_id=order.id,
                payment_method="bkash",
                amount=order.total,
                status=PaymentStatus.PENDING.value,
                payment_data=json.dumps(data)
            )
            db.add(payment)
            db.commit()
            
            return {
                "bkashURL": data.get("bkashURL"),
                "paymentID": data.get("paymentID"),
                "statusCode": data.get("statusCode"),
                "statusMessage": data.get("statusMessage")
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create bKash payment"
            )

@router.post("/bkash/callback")
async def bkash_callback(
    paymentID: str,
    status_param: str,
    db: Session = Depends(get_db)
):
    """Handle bKash payment callback."""
    if status_param == "success":
        # Execute payment
        token = await get_bkash_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.bkash_base_url}/tokenized/checkout/execute",
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": token,
                    "X-APP-Key": settings.bkash_app_key
                },
                json={"paymentID": paymentID}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("statusCode") == "0000":
                    # Update payment and order
                    payment = db.query(Payment).filter(
                        Payment.payment_data.contains(paymentID)
                    ).first()
                    
                    if payment:
                        payment.status = PaymentStatus.COMPLETED.value
                        payment.transaction_id = data.get("trxID")
                        payment.payment_data = json.dumps(data)
                        
                        order = db.query(Order).filter(Order.id == payment.order_id).first()
                        if order:
                            order.payment_status = PaymentStatus.COMPLETED.value
                            order.status = "confirmed"
                        
                        db.commit()
                        
                        return {"success": True, "message": "Payment successful"}
    
    return {"success": False, "message": "Payment failed or cancelled"}

@router.post("/card/create")
async def create_card_payment(
    order_id: int,
    current_user = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Create card payment (Stripe integration placeholder)."""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # In production, integrate with Stripe
    # For now, mark as simulated payment
    payment = Payment(
        order_id=order.id,
        payment_method="card",
        amount=order.total,
        status=PaymentStatus.PENDING.value
    )
    db.add(payment)
    db.commit()
    
    return {
        "message": "Card payment initiated",
        "payment_id": payment.id,
        "amount": order.total
    }

@router.post("/cod/confirm")
async def confirm_cod_payment(
    order_id: int,
    current_user = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Confirm Cash on Delivery order."""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Create pending payment for COD
    payment = Payment(
        order_id=order.id,
        payment_method="cod",
        amount=order.total,
        status=PaymentStatus.PENDING.value  # Pending until delivery
    )
    db.add(payment)
    
    order.status = "confirmed"
    db.commit()
    
    return {
        "message": "Order confirmed for Cash on Delivery",
        "order_number": order.order_number
    }

@router.get("/{order_id}", response_model=PaymentResponse)
async def get_payment(
    order_id: int,
    current_user = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Get payment details for an order."""
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    payment = db.query(Payment).filter(Payment.order_id == order_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return payment
