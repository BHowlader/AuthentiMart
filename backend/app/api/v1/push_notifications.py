from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import PushSubscription, User
from app.schemas import PushSubscriptionCreate, PushSubscriptionResponse
from app.utils import get_current_user, get_current_admin
from app.config import settings

router = APIRouter(prefix="/push", tags=["Push Notifications"])


@router.get("/vapid-key")
async def get_vapid_public_key():
    """Get the VAPID public key for push subscription"""
    if not settings.vapid_public_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Push notifications are not configured"
        )

    return {"publicKey": settings.vapid_public_key}


@router.post("/subscribe")
async def subscribe_push(
    data: PushSubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Subscribe to push notifications"""
    # Check for existing subscription with same endpoint
    existing = db.query(PushSubscription).filter(
        PushSubscription.endpoint == data.endpoint
    ).first()

    if existing:
        # Update existing subscription
        existing.p256dh_key = data.p256dh_key
        existing.auth_key = data.auth_key
        existing.user_id = current_user.id if current_user else None
        existing.is_active = True
        db.commit()
        return {"message": "Subscription updated"}

    # Create new subscription
    subscription = PushSubscription(
        user_id=current_user.id if current_user else None,
        endpoint=data.endpoint,
        p256dh_key=data.p256dh_key,
        auth_key=data.auth_key
    )

    db.add(subscription)
    db.commit()

    return {"message": "Successfully subscribed to push notifications"}


@router.delete("/unsubscribe")
async def unsubscribe_push(
    endpoint: str,
    db: Session = Depends(get_db)
):
    """Unsubscribe from push notifications"""
    subscription = db.query(PushSubscription).filter(
        PushSubscription.endpoint == endpoint
    ).first()

    if subscription:
        subscription.is_active = False
        db.commit()

    return {"message": "Unsubscribed from push notifications"}


@router.get("/status")
async def get_push_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's push subscription status"""
    if not current_user:
        return {"subscribed": False}

    subscription = db.query(PushSubscription).filter(
        PushSubscription.user_id == current_user.id,
        PushSubscription.is_active == True
    ).first()

    return {"subscribed": subscription is not None}


# Admin endpoints
@router.get("/admin/subscriptions")
async def get_all_subscriptions(
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Get all push subscriptions (Admin only)"""
    from sqlalchemy import func

    total = db.query(func.count(PushSubscription.id)).filter(
        PushSubscription.is_active == True
    ).scalar()

    subscriptions = db.query(PushSubscription).filter(
        PushSubscription.is_active == True
    ).order_by(
        PushSubscription.created_at.desc()
    ).offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
        "subscriptions": [
            {
                "id": s.id,
                "user_id": s.user_id,
                "user_email": s.user.email if s.user else None,
                "created_at": s.created_at
            }
            for s in subscriptions
        ]
    }


@router.post("/admin/send")
async def send_push_notification(
    title: str,
    body: str,
    url: str = None,
    user_ids: List[int] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Send push notification (Admin only)"""
    try:
        from pywebpush import webpush, WebPushException
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Push notification library not installed"
        )

    if not settings.vapid_private_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Push notifications are not configured"
        )

    # Get subscriptions
    query = db.query(PushSubscription).filter(PushSubscription.is_active == True)

    if user_ids:
        query = query.filter(PushSubscription.user_id.in_(user_ids))

    subscriptions = query.all()

    if not subscriptions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscriptions found"
        )

    import json
    payload = json.dumps({
        "title": title,
        "body": body,
        "url": url or settings.app_url,
        "icon": f"{settings.app_url}/favicon.ico"
    })

    success_count = 0
    failed_count = 0

    for sub in subscriptions:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {
                        "p256dh": sub.p256dh_key,
                        "auth": sub.auth_key
                    }
                },
                data=payload,
                vapid_private_key=settings.vapid_private_key,
                vapid_claims={
                    "sub": f"mailto:{settings.vapid_email}"
                }
            )
            success_count += 1
        except WebPushException as e:
            failed_count += 1
            # Deactivate invalid subscriptions
            if e.response and e.response.status_code in [404, 410]:
                sub.is_active = False

    db.commit()

    return {
        "message": f"Sent to {success_count} subscribers",
        "success": success_count,
        "failed": failed_count
    }
