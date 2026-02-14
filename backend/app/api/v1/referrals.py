from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List
import secrets
import string
from app.database import get_db
from app.models import Referral, User, PointsTransaction
from app.schemas import (
    ReferralInvite,
    ReferralCodeResponse,
    ReferralStatsResponse,
    ReferralResponse
)
from app.utils import get_current_user_required, get_current_admin
from app.services.email import email_service
from app.config import settings

router = APIRouter(prefix="/referrals", tags=["Referral Program"])


def generate_referral_code(length: int = 8) -> str:
    """Generate a unique referral code"""
    chars = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))


@router.get("/my-code", response_model=ReferralCodeResponse)
async def get_my_referral_code(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get or generate user's referral code"""
    if not current_user.referral_code:
        # Generate new code
        while True:
            code = generate_referral_code()
            existing = db.query(User).filter(User.referral_code == code).first()
            if not existing:
                break

        current_user.referral_code = code
        db.commit()

    return {
        "referral_code": current_user.referral_code,
        "referral_url": f"{settings.app_url}/register?ref={current_user.referral_code}"
    }


@router.get("/stats", response_model=ReferralStatsResponse)
async def get_referral_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get user's referral statistics"""
    referrals = db.query(Referral).filter(
        Referral.referrer_id == current_user.id
    ).all()

    total = len(referrals)
    successful = len([r for r in referrals if r.status == "rewarded"])
    pending = len([r for r in referrals if r.status in ["pending", "registered"]])
    total_points = sum(r.referrer_reward_points for r in referrals if r.status == "rewarded")

    return {
        "total_referrals": total,
        "successful_referrals": successful,
        "pending_referrals": pending,
        "total_points_earned": total_points
    }


@router.get("/history", response_model=List[ReferralResponse])
async def get_referral_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get user's referral history"""
    referrals = db.query(Referral).filter(
        Referral.referrer_id == current_user.id
    ).order_by(Referral.created_at.desc()).all()

    return referrals


@router.post("/invite")
async def send_referral_invite(
    data: ReferralInvite,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Send referral invite email"""
    # Check if already referred
    existing = db.query(Referral).filter(
        Referral.referrer_id == current_user.id,
        Referral.referred_email == data.email
    ).first()

    if existing:
        return {"message": "You've already invited this email address"}

    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered"
        )

    # Ensure user has a referral code
    if not current_user.referral_code:
        while True:
            code = generate_referral_code()
            existing_code = db.query(User).filter(User.referral_code == code).first()
            if not existing_code:
                break
        current_user.referral_code = code
        db.commit()

    # Create referral record
    referral = Referral(
        referrer_id=current_user.id,
        referred_email=data.email,
        referral_code=current_user.referral_code,
        status="pending"
    )

    db.add(referral)
    db.commit()

    # Send invite email
    email_service.send_referral_invite(
        referrer_name=current_user.name,
        referrer_email=current_user.email,
        invite_email=data.email,
        referral_code=current_user.referral_code
    )

    return {"message": f"Invitation sent to {data.email}"}


@router.get("/validate/{code}")
async def validate_referral_code(
    code: str,
    db: Session = Depends(get_db)
):
    """Validate a referral code"""
    user = db.query(User).filter(
        User.referral_code == code,
        User.is_active == True
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid referral code"
        )

    return {
        "valid": True,
        "referrer_name": user.name.split()[0] if user.name else "A friend",
        "reward_points": settings.referral_reward_points
    }


# Admin endpoints
@router.get("/admin/stats")
async def get_admin_referral_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Get overall referral statistics (Admin only)"""
    total_referrals = db.query(func.count(Referral.id)).scalar()
    successful = db.query(func.count(Referral.id)).filter(
        Referral.status == "rewarded"
    ).scalar()
    pending = db.query(func.count(Referral.id)).filter(
        Referral.status.in_(["pending", "registered"])
    ).scalar()

    total_points_awarded = db.query(func.sum(Referral.referrer_reward_points)).filter(
        Referral.status == "rewarded"
    ).scalar() or 0

    # Top referrers
    top_referrers = db.query(
        User.id,
        User.name,
        User.email,
        func.count(Referral.id).label("referral_count")
    ).join(
        Referral, User.id == Referral.referrer_id
    ).filter(
        Referral.status == "rewarded"
    ).group_by(User.id).order_by(
        func.count(Referral.id).desc()
    ).limit(10).all()

    return {
        "total_referrals": total_referrals,
        "successful_referrals": successful,
        "pending_referrals": pending,
        "total_points_awarded": int(total_points_awarded),
        "conversion_rate": (successful / total_referrals * 100) if total_referrals > 0 else 0,
        "top_referrers": [
            {"id": r.id, "name": r.name, "email": r.email, "count": r.referral_count}
            for r in top_referrers
        ]
    }
