from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import (
    ProductVariantType, ProductVariant, ProductVariantAttribute, Product, User
)
from app.schemas import (
    ProductVariantTypeCreate,
    ProductVariantTypeResponse,
    ProductVariantCreate,
    ProductVariantResponse
)
from app.utils import get_current_admin

router = APIRouter(prefix="/variants", tags=["Product Variants"])


# ============================================
# VARIANT TYPES (Size, Color, etc.)
# ============================================

@router.get("/types", response_model=List[ProductVariantTypeResponse])
async def get_variant_types(db: Session = Depends(get_db)):
    """Get all variant types"""
    return db.query(ProductVariantType).all()


@router.post("/types", response_model=ProductVariantTypeResponse)
async def create_variant_type(
    data: ProductVariantTypeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Create a new variant type (Admin only)"""
    variant_type = ProductVariantType(
        name=data.name,
        display_type=data.display_type
    )

    db.add(variant_type)
    db.commit()
    db.refresh(variant_type)

    return variant_type


@router.delete("/types/{type_id}")
async def delete_variant_type(
    type_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Delete a variant type (Admin only)"""
    variant_type = db.query(ProductVariantType).filter(
        ProductVariantType.id == type_id
    ).first()

    if not variant_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant type not found"
        )

    db.delete(variant_type)
    db.commit()

    return {"message": "Variant type deleted"}


# ============================================
# PRODUCT VARIANTS
# ============================================

@router.get("/product/{product_id}", response_model=List[ProductVariantResponse])
async def get_product_variants(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get variants for a product"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    variants = db.query(ProductVariant).filter(
        ProductVariant.product_id == product_id,
        ProductVariant.is_active == True
    ).all()

    result = []
    for variant in variants:
        attributes = []
        for attr in variant.attribute_values:
            attributes.append({
                "id": attr.id,
                "variant_type_id": attr.variant_type_id,
                "value": attr.value,
                "variant_type": {
                    "id": attr.variant_type.id,
                    "name": attr.variant_type.name,
                    "display_type": attr.variant_type.display_type
                } if attr.variant_type else None
            })

        result.append({
            "id": variant.id,
            "product_id": variant.product_id,
            "sku": variant.sku,
            "price": variant.price,
            "stock": variant.stock,
            "is_active": variant.is_active,
            "attribute_values": attributes
        })

    return result


@router.post("/product/{product_id}", response_model=ProductVariantResponse)
async def create_product_variant(
    product_id: int,
    data: ProductVariantCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Create a variant for a product (Admin only)"""
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check SKU uniqueness
    existing_sku = db.query(ProductVariant).filter(
        ProductVariant.sku == data.sku
    ).first()

    if existing_sku:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SKU already exists"
        )

    # Create variant
    variant = ProductVariant(
        product_id=product_id,
        sku=data.sku,
        price=data.price,
        stock=data.stock
    )

    db.add(variant)
    db.commit()
    db.refresh(variant)

    # Add attributes
    for attr_data in data.attributes:
        # Verify variant type exists
        variant_type = db.query(ProductVariantType).filter(
            ProductVariantType.id == attr_data.variant_type_id
        ).first()

        if not variant_type:
            continue

        attribute = ProductVariantAttribute(
            variant_id=variant.id,
            variant_type_id=attr_data.variant_type_id,
            value=attr_data.value
        )
        db.add(attribute)

    db.commit()
    db.refresh(variant)

    return variant


@router.put("/product/{product_id}/{variant_id}")
async def update_product_variant(
    product_id: int,
    variant_id: int,
    price: float = None,
    stock: int = None,
    is_active: bool = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update a product variant (Admin only)"""
    variant = db.query(ProductVariant).filter(
        ProductVariant.id == variant_id,
        ProductVariant.product_id == product_id
    ).first()

    if not variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant not found"
        )

    if price is not None:
        variant.price = price
    if stock is not None:
        variant.stock = stock
    if is_active is not None:
        variant.is_active = is_active

    db.commit()
    db.refresh(variant)

    return {"message": "Variant updated", "variant_id": variant.id}


@router.delete("/product/{product_id}/{variant_id}")
async def delete_product_variant(
    product_id: int,
    variant_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Delete a product variant (Admin only)"""
    variant = db.query(ProductVariant).filter(
        ProductVariant.id == variant_id,
        ProductVariant.product_id == product_id
    ).first()

    if not variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant not found"
        )

    # Soft delete
    variant.is_active = False
    db.commit()

    return {"message": "Variant deleted"}


@router.get("/product/{product_id}/available-options")
async def get_available_options(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get available variant options for a product (for frontend selector)"""
    variants = db.query(ProductVariant).filter(
        ProductVariant.product_id == product_id,
        ProductVariant.is_active == True,
        ProductVariant.stock > 0
    ).all()

    # Group by variant type
    options = {}

    for variant in variants:
        for attr in variant.attribute_values:
            type_name = attr.variant_type.name if attr.variant_type else "Unknown"
            type_id = attr.variant_type_id

            if type_id not in options:
                options[type_id] = {
                    "type_id": type_id,
                    "type_name": type_name,
                    "display_type": attr.variant_type.display_type if attr.variant_type else "dropdown",
                    "values": []
                }

            if attr.value not in [v["value"] for v in options[type_id]["values"]]:
                options[type_id]["values"].append({
                    "value": attr.value,
                    "in_stock": True
                })

    return list(options.values())
