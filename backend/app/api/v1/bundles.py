from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
import os
import uuid
from app.database import get_db
from app.models import ProductBundle, ProductBundleItem, Product, User
from app.schemas import (
    ProductBundleCreate,
    ProductBundleUpdate,
    ProductBundleResponse,
    ProductBundleItemCreate
)
from app.utils import get_current_admin

router = APIRouter(prefix="/bundles", tags=["Product Bundles"])

UPLOAD_DIR = "uploads/bundles"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def calculate_bundle_details(bundle: ProductBundle, db: Session) -> dict:
    """Calculate bundle details including original total and items"""
    items = []
    original_total = 0

    for item in bundle.items:
        product = item.product
        if product and product.is_active:
            primary_image = next((img for img in product.images if img.is_primary), None)
            original_total += product.price * item.quantity

            items.append({
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "slug": product.slug,
                    "price": product.price,
                    "original_price": product.original_price,
                    "discount": product.discount,
                    "image": primary_image.url if primary_image else (product.images[0].url if product.images else None)
                }
            })

    return {
        "id": bundle.id,
        "name": bundle.name,
        "slug": bundle.slug,
        "description": bundle.description,
        "bundle_price": bundle.bundle_price,
        "savings_text": bundle.savings_text,
        "image": bundle.image,
        "is_active": bundle.is_active,
        "start_date": bundle.start_date,
        "end_date": bundle.end_date,
        "created_at": bundle.created_at,
        "items": items,
        "original_total": original_total,
        "savings": original_total - bundle.bundle_price if original_total > bundle.bundle_price else 0
    }


@router.get("")
async def get_bundles(
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get all active bundles"""
    now = datetime.utcnow()

    query = db.query(ProductBundle).filter(
        ProductBundle.is_active == True
    )

    # Filter by date range
    query = query.filter(
        (ProductBundle.start_date == None) | (ProductBundle.start_date <= now),
        (ProductBundle.end_date == None) | (ProductBundle.end_date >= now)
    )

    total = query.count()
    bundles = query.order_by(ProductBundle.created_at.desc()) \
        .offset((page - 1) * limit).limit(limit).all()

    return {
        "bundles": [calculate_bundle_details(b, db) for b in bundles],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.get("/{slug}")
async def get_bundle(
    slug: str,
    db: Session = Depends(get_db)
):
    """Get bundle by slug"""
    bundle = db.query(ProductBundle).filter(
        ProductBundle.slug == slug,
        ProductBundle.is_active == True
    ).first()

    if not bundle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bundle not found"
        )

    return calculate_bundle_details(bundle, db)


# Admin endpoints
@router.post("/admin")
async def create_bundle(
    data: ProductBundleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Create a new bundle (Admin only)"""
    # Check slug uniqueness
    existing = db.query(ProductBundle).filter(
        ProductBundle.slug == data.slug
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bundle with this slug already exists"
        )

    # Create bundle
    bundle = ProductBundle(
        name=data.name,
        slug=data.slug,
        description=data.description,
        bundle_price=data.bundle_price,
        savings_text=data.savings_text,
        start_date=data.start_date,
        end_date=data.end_date
    )

    db.add(bundle)
    db.commit()
    db.refresh(bundle)

    # Add items
    for item_data in data.items:
        # Verify product exists
        product = db.query(Product).filter(
            Product.id == item_data.product_id,
            Product.is_active == True
        ).first()

        if not product:
            continue

        item = ProductBundleItem(
            bundle_id=bundle.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity
        )
        db.add(item)

    db.commit()
    db.refresh(bundle)

    return calculate_bundle_details(bundle, db)


@router.put("/admin/{bundle_id}")
async def update_bundle(
    bundle_id: int,
    data: ProductBundleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update a bundle (Admin only)"""
    bundle = db.query(ProductBundle).filter(
        ProductBundle.id == bundle_id
    ).first()

    if not bundle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bundle not found"
        )

    for field, value in data.dict(exclude_unset=True).items():
        setattr(bundle, field, value)

    db.commit()
    db.refresh(bundle)

    return calculate_bundle_details(bundle, db)


@router.post("/admin/{bundle_id}/upload-image")
async def upload_bundle_image(
    bundle_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Upload bundle image (Admin only)"""
    bundle = db.query(ProductBundle).filter(
        ProductBundle.id == bundle_id
    ).first()

    if not bundle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bundle not found"
        )

    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    # Save file
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)

    # Delete old image if exists
    if bundle.image:
        old_path = bundle.image.lstrip("/")
        if os.path.exists(old_path):
            os.remove(old_path)

    bundle.image = f"/{filepath}"
    db.commit()

    return {"image": bundle.image}


@router.post("/admin/{bundle_id}/items")
async def add_bundle_item(
    bundle_id: int,
    data: ProductBundleItemCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Add item to bundle (Admin only)"""
    bundle = db.query(ProductBundle).filter(
        ProductBundle.id == bundle_id
    ).first()

    if not bundle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bundle not found"
        )

    # Check if product already in bundle
    existing = db.query(ProductBundleItem).filter(
        ProductBundleItem.bundle_id == bundle_id,
        ProductBundleItem.product_id == data.product_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product already in bundle"
        )

    item = ProductBundleItem(
        bundle_id=bundle_id,
        product_id=data.product_id,
        quantity=data.quantity
    )

    db.add(item)
    db.commit()

    return {"message": "Item added to bundle"}


@router.delete("/admin/{bundle_id}/items/{item_id}")
async def remove_bundle_item(
    bundle_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Remove item from bundle (Admin only)"""
    item = db.query(ProductBundleItem).filter(
        ProductBundleItem.id == item_id,
        ProductBundleItem.bundle_id == bundle_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    db.delete(item)
    db.commit()

    return {"message": "Item removed from bundle"}


@router.delete("/admin/{bundle_id}")
async def delete_bundle(
    bundle_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Delete bundle (Admin only)"""
    bundle = db.query(ProductBundle).filter(
        ProductBundle.id == bundle_id
    ).first()

    if not bundle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bundle not found"
        )

    # Soft delete
    bundle.is_active = False
    db.commit()

    return {"message": "Bundle deleted"}
