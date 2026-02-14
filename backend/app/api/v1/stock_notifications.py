from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import StockNotification, Product, User
from app.schemas import StockNotificationCreate, StockNotificationResponse
from app.utils import get_current_user, get_current_user_required

router = APIRouter(prefix="/stock-notifications", tags=["Stock Notifications"])


@router.post("")
async def subscribe_stock_notification(
    data: StockNotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Subscribe to back-in-stock notification"""
    # Verify product exists
    product = db.query(Product).filter(
        Product.id == data.product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check if product is actually out of stock
    if product.stock > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is currently in stock"
        )

    # Get email
    email = data.email
    if current_user:
        email = email or current_user.email
    elif not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required for guest users"
        )

    # Check for existing subscription
    existing = db.query(StockNotification).filter(
        StockNotification.email == email,
        StockNotification.product_id == data.product_id,
        StockNotification.is_notified == False
    ).first()

    if existing:
        return {"message": "You're already subscribed to notifications for this product"}

    # Create subscription
    notification = StockNotification(
        user_id=current_user.id if current_user else None,
        email=email,
        product_id=data.product_id
    )

    db.add(notification)
    db.commit()

    return {"message": "You'll be notified when this product is back in stock!"}


@router.get("", response_model=List[StockNotificationResponse])
async def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get user's stock notification subscriptions"""
    notifications = db.query(StockNotification).filter(
        StockNotification.user_id == current_user.id,
        StockNotification.is_notified == False
    ).all()

    result = []
    for notif in notifications:
        product = notif.product
        if product:
            primary_image = next((img for img in product.images if img.is_primary), None)
            result.append({
                "id": notif.id,
                "email": notif.email,
                "product_id": notif.product_id,
                "is_notified": notif.is_notified,
                "created_at": notif.created_at,
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "slug": product.slug,
                    "price": product.price,
                    "stock": product.stock,
                    "image": primary_image.url if primary_image else (product.images[0].url if product.images else None)
                }
            })

    return result


@router.delete("/{notification_id}")
async def unsubscribe_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Unsubscribe from a stock notification"""
    notification = db.query(StockNotification).filter(
        StockNotification.id == notification_id,
        StockNotification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    db.delete(notification)
    db.commit()

    return {"message": "Unsubscribed successfully"}
