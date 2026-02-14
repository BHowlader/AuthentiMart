from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from app.database import get_db
from app.models import NewsletterSubscriber, User
from app.schemas import NewsletterSubscribe, NewsletterSubscriberResponse
from app.utils import get_current_user, get_current_admin
from app.services.email import email_service

router = APIRouter(prefix="/newsletter", tags=["Newsletter"])


@router.post("/subscribe")
async def subscribe_newsletter(
    data: NewsletterSubscribe,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Subscribe to newsletter"""
    # Check if already subscribed
    existing = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.email == data.email
    ).first()

    if existing:
        if existing.is_active:
            return {"message": "You're already subscribed!"}
        else:
            # Reactivate subscription
            existing.is_active = True
            existing.unsubscribed_at = None
            existing.subscribed_at = datetime.utcnow()
            db.commit()
            return {"message": "Welcome back! Your subscription has been reactivated."}

    # Create new subscription
    subscriber = NewsletterSubscriber(
        email=data.email,
        name=data.name or (current_user.name if current_user else None),
        user_id=current_user.id if current_user else None,
        source=data.source
    )

    db.add(subscriber)
    db.commit()

    # Send confirmation email
    email_service.send_newsletter_confirmation(data.email, data.name)

    return {"message": "Successfully subscribed to our newsletter!"}


@router.post("/unsubscribe")
async def unsubscribe_newsletter(
    email: str,
    db: Session = Depends(get_db)
):
    """Unsubscribe from newsletter"""
    subscriber = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.email == email
    ).first()

    if not subscriber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found in our newsletter list"
        )

    if not subscriber.is_active:
        return {"message": "You're already unsubscribed"}

    subscriber.is_active = False
    subscriber.unsubscribed_at = datetime.utcnow()
    db.commit()

    return {"message": "You've been successfully unsubscribed"}


# Admin endpoints
@router.get("/admin/subscribers", response_model=List[NewsletterSubscriberResponse])
async def get_subscribers(
    page: int = 1,
    limit: int = 50,
    is_active: bool = True,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Get all newsletter subscribers (Admin only)"""
    query = db.query(NewsletterSubscriber)

    if is_active is not None:
        query = query.filter(NewsletterSubscriber.is_active == is_active)

    total = query.count()
    subscribers = query.order_by(NewsletterSubscriber.subscribed_at.desc()) \
        .offset((page - 1) * limit).limit(limit).all()

    return {
        "subscribers": subscribers,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.get("/admin/subscribers/export")
async def export_subscribers(
    is_active: bool = True,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Export newsletter subscribers (Admin only)"""
    query = db.query(NewsletterSubscriber)

    if is_active is not None:
        query = query.filter(NewsletterSubscriber.is_active == is_active)

    subscribers = query.all()

    # Return CSV-ready data
    data = []
    for sub in subscribers:
        data.append({
            "email": sub.email,
            "name": sub.name or "",
            "subscribed_at": sub.subscribed_at.isoformat() if sub.subscribed_at else "",
            "source": sub.source
        })

    return {"subscribers": data, "count": len(data)}
