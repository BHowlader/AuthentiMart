from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import Product, ProductImage, Category, ProductSpecification, ProductAccessory
from app.schemas import (
    ProductResponse,
    ProductListResponse,
    ProductCreate,
    ProductUpdate,
    ProductCompareRequest,
    ProductSpecificationResponse,
    ProductSpecificationsUpdate,
    ProductAccessoryCreate,
    ProductAccessoryResponse,
)
from app.utils import get_current_admin, generate_slug
from math import ceil
from collections import defaultdict

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/search/autocomplete")
async def search_autocomplete(
    q: str = Query(..., min_length=2, max_length=100),
    limit: int = Query(8, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Search autocomplete for products and categories"""
    suggestions = []

    # Search products
    products = db.query(Product).filter(
        Product.is_active == True,
        Product.images.any(),
        Product.name.ilike(f"%{q}%")
    ).order_by(Product.rating.desc()).limit(limit).all()

    for product in products:
        primary_image = next((img for img in product.images if img.is_primary), None)
        suggestions.append({
            "type": "product",
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "price": product.price,
            "image": primary_image.url if primary_image else (product.images[0].url if product.images else None),
            "url": f"/product/{product.slug}"
        })

    # Search categories (only if we have room)
    if len(suggestions) < limit:
        categories = db.query(Category).filter(
            Category.is_active == True,
            Category.name.ilike(f"%{q}%")
        ).limit(limit - len(suggestions)).all()

        for category in categories:
            suggestions.append({
                "type": "category",
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "image": category.image,
                "url": f"/products/{category.slug}"
            })

    return {
        "query": q,
        "suggestions": suggestions,
        "total": len(suggestions)
    }


@router.get("/featured")
async def get_featured_products(
    limit: int = Query(8, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get featured products"""
    products = db.query(Product).filter(
        Product.is_active == True,
        Product.is_featured == True,
        Product.images.any()
    ).order_by(Product.created_at.desc()).limit(limit).all()

    items = []
    for product in products:
        primary_image = next((img for img in product.images if img.is_primary), None)
        items.append({
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
            "image": primary_image.url if primary_image else (product.images[0].url if product.images else None),
            "category": product.category.name if product.category else None
        })

    return {"items": items, "total": len(items)}


@router.get("/new-arrivals")
async def get_new_arrivals(
    limit: int = Query(8, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get new arrival products"""
    # First try to get products marked as new
    products = db.query(Product).filter(
        Product.is_active == True,
        Product.is_new == True,
        Product.images.any()
    ).order_by(Product.created_at.desc()).limit(limit).all()

    # Fallback to latest products if none are marked as new
    if not products:
        products = db.query(Product).filter(
            Product.is_active == True,
            Product.images.any()
        ).order_by(Product.created_at.desc()).limit(limit).all()

    items = []
    for product in products:
        primary_image = next((img for img in product.images if img.is_primary), None)
        items.append({
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
            "image": primary_image.url if primary_image else (product.images[0].url if product.images else None),
            "category": product.category.name if product.category else None
        })

    return {"items": items, "total": len(items)}


@router.get("/best-sellers")
async def get_best_sellers(
    limit: int = Query(8, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get best selling products (by rating and review count)"""
    products = db.query(Product).filter(
        Product.is_active == True,
        Product.images.any()
    ).order_by(Product.rating.desc(), Product.review_count.desc()).limit(limit).all()

    items = []
    for product in products:
        primary_image = next((img for img in product.images if img.is_primary), None)
        items.append({
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
            "image": primary_image.url if primary_image else (product.images[0].url if product.images else None),
            "category": product.category.name if product.category else None
        })

    return {"items": items, "total": len(items)}


@router.get("", response_model=dict)
async def get_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = "newest",
    is_featured: Optional[bool] = None,
    is_new: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    # Only show products that are active AND have at least one image
    query = db.query(Product).filter(
        Product.is_active == True,
        Product.images.any()  # Must have at least one image
    )
    
    # Filter by category (including subcategories)
    if category:
        cat = db.query(Category).filter(Category.slug == category).first()
        if cat:
            # Get this category and all its subcategories
            subcategories = db.query(Category).filter(Category.parent_id == cat.id).all()
            category_ids = [cat.id] + [sub.id for sub in subcategories]
            query = query.filter(Product.category_id.in_(category_ids))
    
    # Search
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    
    # Price filter
    if min_price:
        query = query.filter(Product.price >= min_price)
    if max_price:
        query = query.filter(Product.price <= max_price)
    
    # Featured filter
    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)
    
    # New filter
    if is_new is not None:
        query = query.filter(Product.is_new == is_new)
    
    # Sorting
    if sort == "newest":
        query = query.order_by(Product.created_at.desc())
    elif sort == "price_low":
        query = query.order_by(Product.price.asc())
    elif sort == "price_high":
        query = query.order_by(Product.price.desc())
    elif sort == "rating":
        query = query.order_by(Product.rating.desc())
    elif sort == "popular":
        query = query.order_by(Product.review_count.desc())
    
    # Get total count
    total = query.count()
    
    # Pagination
    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()
    
    # Format response
    items = []
    for product in products:
        primary_image = next((img for img in product.images if img.is_primary), None)
        items.append({
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
            "image": primary_image.url if primary_image else (product.images[0].url if product.images else None),
            "category": product.category.name if product.category else None
        })
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": ceil(total / page_size)
    }

@router.get("/{slug}", response_model=ProductResponse)
async def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(
        Product.slug == slug,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Hide products without images from public view
    if not product.images:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return product

@router.post("", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    # Check if slug already exists
    existing = db.query(Product).filter(Product.slug == product_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product with this slug already exists"
        )
    
    # Create product
    product = Product(
        name=product_data.name,
        slug=product_data.slug,
        description=product_data.description,
        price=product_data.price,
        original_price=product_data.original_price,
        discount=product_data.discount,
        stock=product_data.stock,
        category_id=product_data.category_id,
        brand=product_data.brand,
        sku=product_data.sku,
        is_featured=product_data.is_featured,
        is_new=product_data.is_new
    )
    
    db.add(product)
    db.commit()
    db.refresh(product)
    
    # Add images
    for img_data in product_data.images:
        image = ProductImage(
            product_id=product.id,
            url=img_data.url,
            is_primary=img_data.is_primary,
            sort_order=img_data.sort_order
        )
        db.add(image)
    
    db.commit()
    db.refresh(product)
    
    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Update fields
    for field, value in product_data.dict(exclude_unset=True).items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    
    return product

@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Soft delete
    product.is_active = False
    db.commit()

    return {"message": "Product deleted successfully"}


# ============================================
# PRODUCT COMPARISON ENDPOINTS
# ============================================

@router.post("/compare")
async def compare_products(
    request: ProductCompareRequest,
    db: Session = Depends(get_db)
):
    """Compare 2-4 products side by side"""
    if len(request.product_ids) < 2 or len(request.product_ids) > 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select 2-4 products to compare"
        )

    products = db.query(Product).filter(
        Product.id.in_(request.product_ids),
        Product.is_active == True
    ).all()

    if len(products) != len(request.product_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more products not found"
        )

    # Get specifications for all products
    specs = db.query(ProductSpecification).filter(
        ProductSpecification.product_id.in_(request.product_ids)
    ).order_by(ProductSpecification.spec_group, ProductSpecification.sort_order).all()

    # Group specifications by group and name for comparison
    spec_groups = defaultdict(lambda: defaultdict(dict))
    for spec in specs:
        spec_groups[spec.spec_group][spec.spec_name][spec.product_id] = spec.spec_value

    # Format products
    formatted_products = []
    for product in products:
        primary_image = next((img for img in product.images if img.is_primary), None)
        formatted_products.append({
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
            "image": primary_image.url if primary_image else (product.images[0].url if product.images else None),
            "category": product.category.name if product.category else None,
            "description": product.description,
        })

    return {
        "products": formatted_products,
        "specifications": dict(spec_groups)
    }


# ============================================
# PRODUCT SPECIFICATIONS ENDPOINTS
# ============================================

@router.get("/{product_id}/specifications", response_model=List[ProductSpecificationResponse])
async def get_product_specifications(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed specifications for a product"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    specs = db.query(ProductSpecification).filter(
        ProductSpecification.product_id == product_id
    ).order_by(ProductSpecification.spec_group, ProductSpecification.sort_order).all()

    return specs


@router.put("/{product_id}/specifications")
async def update_product_specifications(
    product_id: int,
    specs_data: ProductSpecificationsUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Update product specifications (Admin only)"""
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Delete existing specifications
    db.query(ProductSpecification).filter(
        ProductSpecification.product_id == product_id
    ).delete()

    # Add new specifications
    for spec in specs_data.specifications:
        new_spec = ProductSpecification(
            product_id=product_id,
            spec_group=spec.spec_group,
            spec_name=spec.spec_name,
            spec_value=spec.spec_value,
            sort_order=spec.sort_order
        )
        db.add(new_spec)

    db.commit()

    # Return updated specs
    specs = db.query(ProductSpecification).filter(
        ProductSpecification.product_id == product_id
    ).order_by(ProductSpecification.spec_group, ProductSpecification.sort_order).all()

    return specs


# ============================================
# PRODUCT ACCESSORIES ENDPOINTS
# ============================================

@router.get("/{product_id}/accessories")
async def get_product_accessories(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get recommended accessories for a product"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    accessories = db.query(ProductAccessory).filter(
        ProductAccessory.product_id == product_id
    ).order_by(ProductAccessory.sort_order).all()

    result = []
    for acc in accessories:
        accessory_product = acc.accessory
        if accessory_product and accessory_product.is_active:
            primary_image = next((img for img in accessory_product.images if img.is_primary), None)
            result.append({
                "id": acc.id,
                "sort_order": acc.sort_order,
                "accessory": {
                    "id": accessory_product.id,
                    "name": accessory_product.name,
                    "slug": accessory_product.slug,
                    "price": accessory_product.price,
                    "original_price": accessory_product.original_price,
                    "discount": accessory_product.discount,
                    "stock": accessory_product.stock,
                    "category_id": accessory_product.category_id,
                    "brand": accessory_product.brand,
                    "is_featured": accessory_product.is_featured,
                    "is_new": accessory_product.is_new,
                    "rating": accessory_product.rating,
                    "review_count": accessory_product.review_count,
                    "image": primary_image.url if primary_image else (accessory_product.images[0].url if accessory_product.images else None),
                    "category": accessory_product.category.name if accessory_product.category else None
                }
            })

    return result


@router.post("/{product_id}/accessories")
async def add_product_accessory(
    product_id: int,
    accessory_data: ProductAccessoryCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Add an accessory to a product (Admin only)"""
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Verify accessory product exists
    accessory_product = db.query(Product).filter(
        Product.id == accessory_data.accessory_id,
        Product.is_active == True
    ).first()

    if not accessory_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Accessory product not found"
        )

    # Check if already exists
    existing = db.query(ProductAccessory).filter(
        ProductAccessory.product_id == product_id,
        ProductAccessory.accessory_id == accessory_data.accessory_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This accessory is already linked to this product"
        )

    accessory = ProductAccessory(
        product_id=product_id,
        accessory_id=accessory_data.accessory_id,
        sort_order=accessory_data.sort_order
    )

    db.add(accessory)
    db.commit()
    db.refresh(accessory)

    return {"message": "Accessory added successfully", "id": accessory.id}


@router.delete("/{product_id}/accessories/{accessory_id}")
async def remove_product_accessory(
    product_id: int,
    accessory_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    """Remove an accessory from a product (Admin only)"""
    accessory = db.query(ProductAccessory).filter(
        ProductAccessory.product_id == product_id,
        ProductAccessory.accessory_id == accessory_id
    ).first()

    if not accessory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Accessory link not found"
        )

    db.delete(accessory)
    db.commit()

    return {"message": "Accessory removed successfully"}
