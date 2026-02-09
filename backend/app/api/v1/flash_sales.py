from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
from datetime import datetime, timezone
from app.database import get_db
from app.models import FlashSale, FlashSaleItem, Product
from app.schemas import (
    FlashSaleCreate,
    FlashSaleUpdate,
    FlashSaleResponse,
    FlashSaleListResponse,
    FlashSaleItemCreate,
    FlashSaleItemResponse,
)
from app.utils import get_current_admin

router = APIRouter(prefix="/flash-sales", tags=["Flash Sales"])


def get_flash_sale_with_items(db: Session, flash_sale: FlashSale) -> dict:
    """Convert flash sale to response with product details"""
    items = []
    for item in flash_sale.items:
        product = item.product
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "flash_price": item.flash_price,
            "flash_stock": item.flash_stock,
            "sold_count": item.sold_count,
            "sort_order": item.sort_order,
            "product": {
                "id": product.id,
                "name": product.name,
                "slug": product.slug,
                "price": product.price,
                "original_price": product.original_price,
                "discount": product.discount,
                "stock": product.stock,
                "category_id": product.category_id,
                "brand": product.brand,
                "is_featured": product.is_featured,
                "is_new": product.is_new,
                "rating": product.rating,
                "review_count": product.review_count,
                "image": product.image,
                "category": product.category_name,
            } if product else None
        })

    return {
        "id": flash_sale.id,
        "name": flash_sale.name,
        "slug": flash_sale.slug,
        "description": flash_sale.description,
        "start_time": flash_sale.start_time,
        "end_time": flash_sale.end_time,
        "banner_image": flash_sale.banner_image,
        "is_active": flash_sale.is_active,
        "created_at": flash_sale.created_at,
        "items": items
    }


@router.get("/current", response_model=FlashSaleResponse)
async def get_current_flash_sale(db: Session = Depends(get_db)):
    """Get the currently active flash sale"""
    now = datetime.now(timezone.utc)

    flash_sale = db.query(FlashSale).options(
        joinedload(FlashSale.items).joinedload(FlashSaleItem.product)
    ).filter(
        FlashSale.is_active == True,
        FlashSale.start_time <= now,
        FlashSale.end_time > now
    ).first()

    if not flash_sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active flash sale at this time"
        )

    return get_flash_sale_with_items(db, flash_sale)


@router.get("", response_model=List[FlashSaleListResponse])
async def get_flash_sales(
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """Get all flash sales"""
    query = db.query(FlashSale)

    if not include_inactive:
        query = query.filter(FlashSale.is_active == True)

    flash_sales = query.order_by(FlashSale.start_time.desc()).all()

    result = []
    for fs in flash_sales:
        result.append({
            "id": fs.id,
            "name": fs.name,
            "slug": fs.slug,
            "start_time": fs.start_time,
            "end_time": fs.end_time,
            "banner_image": fs.banner_image,
            "is_active": fs.is_active,
            "item_count": len(fs.items)
        })

    return result


@router.get("/{slug}", response_model=FlashSaleResponse)
async def get_flash_sale(slug: str, db: Session = Depends(get_db)):
    """Get flash sale by slug"""
    flash_sale = db.query(FlashSale).options(
        joinedload(FlashSale.items).joinedload(FlashSaleItem.product)
    ).filter(
        FlashSale.slug == slug,
        FlashSale.is_active == True
    ).first()

    if not flash_sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flash sale not found"
        )

    return get_flash_sale_with_items(db, flash_sale)


# ============================================
# ADMIN ENDPOINTS
# ============================================

@router.post("", response_model=FlashSaleResponse)
async def create_flash_sale(
    flash_sale_data: FlashSaleCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Create a new flash sale (Admin only)"""
    # Check if slug already exists
    existing = db.query(FlashSale).filter(
        FlashSale.slug == flash_sale_data.slug
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Flash sale with this slug already exists"
        )

    # Validate times
    if flash_sale_data.end_time <= flash_sale_data.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time"
        )

    # Create flash sale
    flash_sale = FlashSale(
        name=flash_sale_data.name,
        slug=flash_sale_data.slug,
        description=flash_sale_data.description,
        start_time=flash_sale_data.start_time,
        end_time=flash_sale_data.end_time,
        banner_image=flash_sale_data.banner_image,
    )
    db.add(flash_sale)
    db.flush()

    # Add items
    for item_data in flash_sale_data.items:
        # Verify product exists
        product = db.query(Product).filter(
            Product.id == item_data.product_id,
            Product.is_active == True
        ).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with ID {item_data.product_id} not found"
            )

        item = FlashSaleItem(
            flash_sale_id=flash_sale.id,
            product_id=item_data.product_id,
            flash_price=item_data.flash_price,
            flash_stock=item_data.flash_stock,
            sort_order=item_data.sort_order,
        )
        db.add(item)

    db.commit()
    db.refresh(flash_sale)

    # Reload with relationships
    flash_sale = db.query(FlashSale).options(
        joinedload(FlashSale.items).joinedload(FlashSaleItem.product)
    ).filter(FlashSale.id == flash_sale.id).first()

    return get_flash_sale_with_items(db, flash_sale)


@router.put("/{flash_sale_id}", response_model=FlashSaleResponse)
async def update_flash_sale(
    flash_sale_id: int,
    flash_sale_data: FlashSaleUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Update a flash sale (Admin only)"""
    flash_sale = db.query(FlashSale).filter(
        FlashSale.id == flash_sale_id
    ).first()

    if not flash_sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flash sale not found"
        )

    # Update fields
    update_data = flash_sale_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(flash_sale, field, value)

    # Validate times if both are set
    if flash_sale.end_time <= flash_sale.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time"
        )

    db.commit()
    db.refresh(flash_sale)

    # Reload with relationships
    flash_sale = db.query(FlashSale).options(
        joinedload(FlashSale.items).joinedload(FlashSaleItem.product)
    ).filter(FlashSale.id == flash_sale.id).first()

    return get_flash_sale_with_items(db, flash_sale)


@router.delete("/{flash_sale_id}")
async def delete_flash_sale(
    flash_sale_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Delete a flash sale (Admin only)"""
    flash_sale = db.query(FlashSale).filter(
        FlashSale.id == flash_sale_id
    ).first()

    if not flash_sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flash sale not found"
        )

    # Soft delete
    flash_sale.is_active = False
    db.commit()

    return {"message": "Flash sale deleted successfully"}


@router.post("/{flash_sale_id}/items", response_model=FlashSaleItemResponse)
async def add_flash_sale_item(
    flash_sale_id: int,
    item_data: FlashSaleItemCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Add a product to a flash sale (Admin only)"""
    flash_sale = db.query(FlashSale).filter(
        FlashSale.id == flash_sale_id
    ).first()

    if not flash_sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flash sale not found"
        )

    # Verify product exists
    product = db.query(Product).filter(
        Product.id == item_data.product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product not found"
        )

    # Check if product already in flash sale
    existing = db.query(FlashSaleItem).filter(
        FlashSaleItem.flash_sale_id == flash_sale_id,
        FlashSaleItem.product_id == item_data.product_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product already in this flash sale"
        )

    item = FlashSaleItem(
        flash_sale_id=flash_sale_id,
        product_id=item_data.product_id,
        flash_price=item_data.flash_price,
        flash_stock=item_data.flash_stock,
        sort_order=item_data.sort_order,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return {
        "id": item.id,
        "product_id": item.product_id,
        "flash_price": item.flash_price,
        "flash_stock": item.flash_stock,
        "sold_count": item.sold_count,
        "sort_order": item.sort_order,
        "product": {
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "price": product.price,
            "original_price": product.original_price,
            "discount": product.discount,
            "stock": product.stock,
            "category_id": product.category_id,
            "brand": product.brand,
            "is_featured": product.is_featured,
            "is_new": product.is_new,
            "rating": product.rating,
            "review_count": product.review_count,
            "image": product.image,
            "category": product.category_name,
        }
    }


@router.delete("/{flash_sale_id}/items/{item_id}")
async def remove_flash_sale_item(
    flash_sale_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Remove a product from a flash sale (Admin only)"""
    item = db.query(FlashSaleItem).filter(
        FlashSaleItem.id == item_id,
        FlashSaleItem.flash_sale_id == flash_sale_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flash sale item not found"
        )

    db.delete(item)
    db.commit()

    return {"message": "Item removed from flash sale"}
