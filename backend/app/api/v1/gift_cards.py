from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import secrets
import string
from app.database import get_db
from app.models import GiftCard, GiftCardTransaction, User
from app.schemas import (
    GiftCardPurchase,
    GiftCardResponse,
    GiftCardTransactionResponse
)
from app.utils import get_current_user, get_current_user_required, get_current_admin
from app.services.email import email_service

router = APIRouter(prefix="/gift-cards", tags=["Gift Cards"])


def generate_gift_card_code() -> str:
    """Generate a unique gift card code"""
    chars = string.ascii_uppercase + string.digits
    return '-'.join(''.join(secrets.choice(chars) for _ in range(4)) for _ in range(4))


@router.post("/purchase", response_model=GiftCardResponse)
async def purchase_gift_card(
    data: GiftCardPurchase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Purchase a gift card"""
    # Generate unique code
    while True:
        code = generate_gift_card_code()
        existing = db.query(GiftCard).filter(GiftCard.code == code).first()
        if not existing:
            break

    # Create gift card
    gift_card = GiftCard(
        code=code,
        initial_balance=data.amount,
        current_balance=data.amount,
        purchaser_id=current_user.id if current_user else None,
        recipient_email=data.recipient_email,
        recipient_name=data.recipient_name,
        personal_message=data.personal_message,
        expires_at=datetime.utcnow() + timedelta(days=365)  # 1 year validity
    )

    db.add(gift_card)
    db.commit()
    db.refresh(gift_card)

    # Create purchase transaction
    transaction = GiftCardTransaction(
        gift_card_id=gift_card.id,
        amount=data.amount,
        transaction_type="purchase"
    )
    db.add(transaction)
    db.commit()

    # Send email to recipient if provided
    if data.recipient_email:
        sender_name = current_user.name if current_user else "Someone"
        email_service.send_gift_card(gift_card, sender_name)

    return gift_card


@router.get("/check/{code}")
async def check_gift_card_balance(
    code: str,
    db: Session = Depends(get_db)
):
    """Check gift card balance"""
    gift_card = db.query(GiftCard).filter(
        GiftCard.code == code.upper()
    ).first()

    if not gift_card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gift card not found"
        )

    if not gift_card.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This gift card has been deactivated"
        )

    if gift_card.expires_at and gift_card.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This gift card has expired"
        )

    return {
        "code": gift_card.code,
        "current_balance": gift_card.current_balance,
        "expires_at": gift_card.expires_at,
        "is_valid": True
    }


@router.post("/validate")
async def validate_gift_card(
    code: str,
    amount: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Validate gift card for checkout"""
    gift_card = db.query(GiftCard).filter(
        GiftCard.code == code.upper()
    ).first()

    if not gift_card:
        return {"valid": False, "message": "Gift card not found"}

    if not gift_card.is_active:
        return {"valid": False, "message": "This gift card has been deactivated"}

    if gift_card.expires_at and gift_card.expires_at < datetime.utcnow():
        return {"valid": False, "message": "This gift card has expired"}

    if gift_card.current_balance <= 0:
        return {"valid": False, "message": "This gift card has no remaining balance"}

    # Calculate usable amount
    usable_amount = min(gift_card.current_balance, amount) if amount else gift_card.current_balance

    return {
        "valid": True,
        "gift_card_id": gift_card.id,
        "code": gift_card.code,
        "current_balance": gift_card.current_balance,
        "usable_amount": usable_amount,
        "message": f"Gift card valid. You can use up to ৳{usable_amount:.2f}"
    }


@router.get("/my-cards", response_model=List[GiftCardResponse])
async def get_my_gift_cards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get gift cards purchased by user"""
    gift_cards = db.query(GiftCard).filter(
        GiftCard.purchaser_id == current_user.id
    ).order_by(GiftCard.created_at.desc()).all()

    return gift_cards


@router.get("/my-cards/{card_id}/transactions", response_model=List[GiftCardTransactionResponse])
async def get_gift_card_transactions(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get transactions for a gift card"""
    gift_card = db.query(GiftCard).filter(
        GiftCard.id == card_id,
        GiftCard.purchaser_id == current_user.id
    ).first()

    if not gift_card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gift card not found"
        )

    transactions = db.query(GiftCardTransaction).filter(
        GiftCardTransaction.gift_card_id == card_id
    ).order_by(GiftCardTransaction.created_at.desc()).all()

    return transactions


# Admin endpoints
@router.get("/admin", response_model=List[GiftCardResponse])
async def get_all_gift_cards(
    page: int = 1,
    limit: int = 50,
    is_active: bool = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Get all gift cards (Admin only)"""
    query = db.query(GiftCard)

    if is_active is not None:
        query = query.filter(GiftCard.is_active == is_active)

    total = query.count()
    gift_cards = query.order_by(GiftCard.created_at.desc()) \
        .offset((page - 1) * limit).limit(limit).all()

    return {
        "gift_cards": gift_cards,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.put("/admin/{card_id}/deactivate")
async def deactivate_gift_card(
    card_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Deactivate a gift card (Admin only)"""
    gift_card = db.query(GiftCard).filter(GiftCard.id == card_id).first()

    if not gift_card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gift card not found"
        )

    gift_card.is_active = False
    db.commit()

    return {"message": "Gift card deactivated"}


@router.get("/admin/stats")
async def get_gift_card_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Get gift card statistics (Admin only)"""
    from sqlalchemy import func

    total_cards = db.query(func.count(GiftCard.id)).scalar()
    active_cards = db.query(func.count(GiftCard.id)).filter(
        GiftCard.is_active == True,
        GiftCard.current_balance > 0
    ).scalar()

    total_sold = db.query(func.sum(GiftCard.initial_balance)).scalar() or 0
    total_redeemed = total_sold - (db.query(func.sum(GiftCard.current_balance)).scalar() or 0)
    outstanding_balance = db.query(func.sum(GiftCard.current_balance)).filter(
        GiftCard.is_active == True
    ).scalar() or 0

    return {
        "total_cards": total_cards,
        "active_cards": active_cards,
        "total_sold": total_sold,
        "total_redeemed": total_redeemed,
        "outstanding_balance": outstanding_balance
    }
