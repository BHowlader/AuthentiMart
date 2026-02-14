from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
from app.database import get_db
from app.models import PointsTransaction, PointsSettings, User
from app.schemas import (
    PointsBalanceResponse,
    PointsTransactionResponse,
    PointsRedeemRequest,
    PointsRedeemResponse,
    PointsSettingsResponse,
    PointsSettingsUpdate
)
from app.utils import get_current_user_required, get_current_admin
from app.config import settings

router = APIRouter(prefix="/points", tags=["Loyalty Points"])


def get_or_create_settings(db: Session) -> PointsSettings:
    """Get or create default points settings"""
    settings_obj = db.query(PointsSettings).first()
    if not settings_obj:
        settings_obj = PointsSettings(
            points_per_taka=settings.default_points_per_taka,
            taka_per_point=settings.default_taka_per_point
        )
        db.add(settings_obj)
        db.commit()
        db.refresh(settings_obj)
    return settings_obj


@router.get("/balance", response_model=PointsBalanceResponse)
async def get_points_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get user's points balance"""
    # Calculate pending expiry (within 30 days)
    thirty_days_from_now = datetime.utcnow() + timedelta(days=30)

    expiring_points = db.query(func.sum(PointsTransaction.points)).filter(
        PointsTransaction.user_id == current_user.id,
        PointsTransaction.points > 0,
        PointsTransaction.expires_at != None,
        PointsTransaction.expires_at <= thirty_days_from_now,
        PointsTransaction.expires_at > datetime.utcnow()
    ).scalar() or 0

    # Get next expiry date
    next_expiry = db.query(PointsTransaction.expires_at).filter(
        PointsTransaction.user_id == current_user.id,
        PointsTransaction.points > 0,
        PointsTransaction.expires_at != None,
        PointsTransaction.expires_at > datetime.utcnow()
    ).order_by(PointsTransaction.expires_at.asc()).first()

    return {
        "balance": current_user.points_balance,
        "pending_expiry": int(expiring_points),
        "next_expiry_date": next_expiry[0] if next_expiry else None
    }


@router.get("/history", response_model=List[PointsTransactionResponse])
async def get_points_history(
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get user's points transaction history"""
    transactions = db.query(PointsTransaction).filter(
        PointsTransaction.user_id == current_user.id
    ).order_by(
        PointsTransaction.created_at.desc()
    ).offset((page - 1) * limit).limit(limit).all()

    return transactions


@router.post("/calculate")
async def calculate_points(
    subtotal: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Calculate points to be earned for an order"""
    points_settings = get_or_create_settings(db)

    if not points_settings.is_active:
        return {"points_to_earn": 0, "message": "Points program is currently inactive"}

    points_to_earn = int(subtotal * points_settings.points_per_taka)

    return {
        "points_to_earn": points_to_earn,
        "subtotal": subtotal,
        "points_per_taka": points_settings.points_per_taka
    }


@router.post("/validate-redemption", response_model=PointsRedeemResponse)
async def validate_points_redemption(
    data: PointsRedeemRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Validate if points can be redeemed"""
    points_settings = get_or_create_settings(db)

    if not points_settings.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Points program is currently inactive"
        )

    # Check minimum points
    if data.points < points_settings.min_redeem_points:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum {points_settings.min_redeem_points} points required for redemption"
        )

    # Check user has enough points
    if data.points > current_user.points_balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient points. You have {current_user.points_balance} points"
        )

    # Calculate discount
    discount_amount = data.points * points_settings.taka_per_point

    # Check max redemption percentage
    max_discount = data.order_subtotal * points_settings.max_redeem_percentage
    if discount_amount > max_discount:
        discount_amount = max_discount
        points_used = int(discount_amount / points_settings.taka_per_point)
    else:
        points_used = data.points

    return {
        "points_used": points_used,
        "discount_amount": discount_amount,
        "remaining_balance": current_user.points_balance - points_used
    }


# Admin endpoints
@router.get("/admin/settings", response_model=PointsSettingsResponse)
async def get_points_settings(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Get points settings (Admin only)"""
    return get_or_create_settings(db)


@router.put("/admin/settings", response_model=PointsSettingsResponse)
async def update_points_settings(
    data: PointsSettingsUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update points settings (Admin only)"""
    points_settings = get_or_create_settings(db)

    for field, value in data.dict(exclude_unset=True).items():
        setattr(points_settings, field, value)

    db.commit()
    db.refresh(points_settings)

    return points_settings


@router.get("/admin/stats")
async def get_points_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Get points program statistics (Admin only)"""
    # Total points in circulation
    total_balance = db.query(func.sum(User.points_balance)).scalar() or 0

    # Points earned (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    points_earned = db.query(func.sum(PointsTransaction.points)).filter(
        PointsTransaction.points > 0,
        PointsTransaction.created_at >= thirty_days_ago
    ).scalar() or 0

    # Points redeemed (last 30 days)
    points_redeemed = db.query(func.sum(PointsTransaction.points)).filter(
        PointsTransaction.points < 0,
        PointsTransaction.created_at >= thirty_days_ago
    ).scalar() or 0

    # Users with points
    users_with_points = db.query(func.count(User.id)).filter(
        User.points_balance > 0
    ).scalar() or 0

    return {
        "total_points_in_circulation": int(total_balance),
        "points_earned_30d": int(points_earned),
        "points_redeemed_30d": abs(int(points_redeemed)),
        "users_with_points": users_with_points,
        "estimated_liability": total_balance * (settings.default_taka_per_point)
    }
