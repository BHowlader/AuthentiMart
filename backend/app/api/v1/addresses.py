from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import User, Address
from app.schemas import AddressCreate, AddressResponse
from app.utils.auth import get_current_user_required

router = APIRouter(prefix="/addresses", tags=["Addresses"])


@router.get("", response_model=List[AddressResponse])
async def get_addresses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get all addresses for the current user"""
    addresses = db.query(Address).filter(Address.user_id == current_user.id).all()
    return addresses


@router.post("", response_model=AddressResponse)
async def create_address(
    address_data: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Create a new address"""
    # If this is the first address or marked as default, unset other defaults
    if address_data.is_default:
        db.query(Address).filter(
            Address.user_id == current_user.id
        ).update({"is_default": False})

    # If this is the first address, make it default
    existing_count = db.query(Address).filter(Address.user_id == current_user.id).count()
    is_default = address_data.is_default or existing_count == 0

    new_address = Address(
        user_id=current_user.id,
        name=address_data.name,
        phone=address_data.phone,
        address=address_data.address,
        area=address_data.area,
        city=address_data.city,
        is_default=is_default
    )

    db.add(new_address)
    db.commit()
    db.refresh(new_address)

    return new_address


@router.put("/{address_id}", response_model=AddressResponse)
async def update_address(
    address_id: int,
    address_data: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Update an address"""
    address = db.query(Address).filter(
        Address.id == address_id,
        Address.user_id == current_user.id
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    # If setting as default, unset other defaults
    if address_data.is_default and not address.is_default:
        db.query(Address).filter(
            Address.user_id == current_user.id
        ).update({"is_default": False})

    address.name = address_data.name
    address.phone = address_data.phone
    address.address = address_data.address
    address.area = address_data.area
    address.city = address_data.city
    address.is_default = address_data.is_default

    db.commit()
    db.refresh(address)

    return address


@router.delete("/{address_id}")
async def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Delete an address"""
    address = db.query(Address).filter(
        Address.id == address_id,
        Address.user_id == current_user.id
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    was_default = address.is_default

    db.delete(address)
    db.commit()

    # If deleted address was default, make another one default
    if was_default:
        first_address = db.query(Address).filter(
            Address.user_id == current_user.id
        ).first()
        if first_address:
            first_address.is_default = True
            db.commit()

    return {"message": "Address deleted successfully"}


@router.put("/{address_id}/default")
async def set_default_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Set an address as default"""
    address = db.query(Address).filter(
        Address.id == address_id,
        Address.user_id == current_user.id
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    # Unset all other defaults
    db.query(Address).filter(
        Address.user_id == current_user.id
    ).update({"is_default": False})

    address.is_default = True
    db.commit()

    return {"message": "Default address updated"}
