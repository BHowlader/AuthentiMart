from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timezone
from app.database import get_db
from app.models import Voucher, VoucherUsage, User
from app.schemas import (
    VoucherCreate,
    VoucherUpdate,
    VoucherResponse,
    VoucherValidateRequest,
    VoucherValidateResponse,
)
from app.utils import get_current_user_required, get_current_admin

router = APIRouter(prefix="/vouchers", tags=["Vouchers"])


def calculate_discount(voucher: Voucher, subtotal: float) -> float:
    """Calculate the discount amount based on voucher type"""
    if voucher.discount_type == "percentage":
        discount = subtotal * (voucher.discount_value / 100)
        # Apply max discount cap if set
        if voucher.max_discount_amount and discount > voucher.max_discount_amount:
            discount = voucher.max_discount_amount
    else:  # fixed
        discount = voucher.discount_value

    # Discount cannot exceed subtotal
    return min(discount, subtotal)


def validate_voucher(
    db: Session,
    voucher: Voucher,
    user_id: int,
    subtotal: float
) -> tuple[bool, str]:
    """Validate if a voucher can be used by a user"""
    now = datetime.now(timezone.utc)

    # Check if voucher is active
    if not voucher.is_active:
        return False, "This voucher is no longer active"

    # Check date validity
    if voucher.start_date and voucher.start_date > now:
        return False, "This voucher is not yet valid"

    if voucher.end_date and voucher.end_date < now:
        return False, "This voucher has expired"

    # Check minimum order amount
    if subtotal < voucher.min_order_amount:
        return False, f"Minimum order amount is ৳{voucher.min_order_amount:.0f}"

    # Check total usage limit
    if voucher.usage_limit and voucher.usage_count >= voucher.usage_limit:
        return False, "This voucher has reached its usage limit"

    # Check per-user limit
    user_usage_count = db.query(func.count(VoucherUsage.id)).filter(
        VoucherUsage.voucher_id == voucher.id,
        VoucherUsage.user_id == user_id
    ).scalar()

    if user_usage_count >= voucher.per_user_limit:
        return False, "You have already used this voucher"

    return True, "Voucher is valid"


@router.post("/validate", response_model=VoucherValidateResponse)
async def validate_voucher_code(
    request: VoucherValidateRequest,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Validate a voucher code and calculate discount"""
    voucher = db.query(Voucher).filter(
        Voucher.code == request.code.upper()
    ).first()

    if not voucher:
        return VoucherValidateResponse(
            valid=False,
            discount_amount=0,
            message="Invalid voucher code"
        )

    is_valid, message = validate_voucher(
        db, voucher, current_user.id, request.subtotal
    )

    if not is_valid:
        return VoucherValidateResponse(
            valid=False,
            discount_amount=0,
            message=message
        )

    discount_amount = calculate_discount(voucher, request.subtotal)

    return VoucherValidateResponse(
        valid=True,
        voucher=VoucherResponse(
            id=voucher.id,
            code=voucher.code,
            name=voucher.name,
            description=voucher.description,
            discount_type=voucher.discount_type,
            discount_value=voucher.discount_value,
            min_order_amount=voucher.min_order_amount,
            max_discount_amount=voucher.max_discount_amount,
            usage_limit=voucher.usage_limit,
            per_user_limit=voucher.per_user_limit,
            start_date=voucher.start_date,
            end_date=voucher.end_date,
            usage_count=voucher.usage_count,
            is_active=voucher.is_active,
            created_at=voucher.created_at
        ),
        discount_amount=discount_amount,
        message=f"You save ৳{discount_amount:.0f}!"
    )


# ============================================
# ADMIN ENDPOINTS
# ============================================

@router.get("", response_model=List[VoucherResponse])
async def get_vouchers(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Get all vouchers (Admin only)"""
    query = db.query(Voucher)

    if not include_inactive:
        query = query.filter(Voucher.is_active == True)

    vouchers = query.order_by(Voucher.created_at.desc()).all()
    return vouchers


@router.get("/{voucher_id}", response_model=VoucherResponse)
async def get_voucher(
    voucher_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Get voucher by ID (Admin only)"""
    voucher = db.query(Voucher).filter(Voucher.id == voucher_id).first()

    if not voucher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voucher not found"
        )

    return voucher


@router.post("", response_model=VoucherResponse)
async def create_voucher(
    voucher_data: VoucherCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Create a new voucher (Admin only)"""
    # Check if code already exists
    existing = db.query(Voucher).filter(
        Voucher.code == voucher_data.code.upper()
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Voucher code already exists"
        )

    # Validate dates if both are provided
    if voucher_data.start_date and voucher_data.end_date:
        if voucher_data.end_date <= voucher_data.start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End date must be after start date"
            )

    voucher = Voucher(
        code=voucher_data.code.upper(),
        name=voucher_data.name,
        description=voucher_data.description,
        discount_type=voucher_data.discount_type.value,
        discount_value=voucher_data.discount_value,
        min_order_amount=voucher_data.min_order_amount,
        max_discount_amount=voucher_data.max_discount_amount,
        usage_limit=voucher_data.usage_limit,
        per_user_limit=voucher_data.per_user_limit,
        start_date=voucher_data.start_date,
        end_date=voucher_data.end_date,
    )

    db.add(voucher)
    db.commit()
    db.refresh(voucher)

    return voucher


@router.put("/{voucher_id}", response_model=VoucherResponse)
async def update_voucher(
    voucher_id: int,
    voucher_data: VoucherUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Update a voucher (Admin only)"""
    voucher = db.query(Voucher).filter(Voucher.id == voucher_id).first()

    if not voucher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voucher not found"
        )

    # Update fields
    update_data = voucher_data.model_dump(exclude_unset=True)

    # Convert enum to string if present
    if "discount_type" in update_data and update_data["discount_type"]:
        update_data["discount_type"] = update_data["discount_type"].value

    for field, value in update_data.items():
        setattr(voucher, field, value)

    db.commit()
    db.refresh(voucher)

    return voucher


@router.delete("/{voucher_id}")
async def delete_voucher(
    voucher_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Delete a voucher (Admin only)"""
    voucher = db.query(Voucher).filter(Voucher.id == voucher_id).first()

    if not voucher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voucher not found"
        )

    # Soft delete
    voucher.is_active = False
    db.commit()

    return {"message": "Voucher deleted successfully"}


@router.get("/{voucher_id}/usage")
async def get_voucher_usage(
    voucher_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Get voucher usage statistics (Admin only)"""
    voucher = db.query(Voucher).filter(Voucher.id == voucher_id).first()

    if not voucher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voucher not found"
        )

    usages = db.query(VoucherUsage).filter(
        VoucherUsage.voucher_id == voucher_id
    ).order_by(VoucherUsage.used_at.desc()).all()

    return {
        "voucher_id": voucher_id,
        "voucher_code": voucher.code,
        "total_usage": len(usages),
        "usage_limit": voucher.usage_limit,
        "usages": [
            {
                "id": u.id,
                "user_id": u.user_id,
                "order_id": u.order_id,
                "used_at": u.used_at
            }
            for u in usages
        ]
    }
