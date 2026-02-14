from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models import Category, Product, ProductImage
from app.schemas import CategoryResponse, CategoryCreate
from app.utils import get_current_admin

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/homepage")
async def get_homepage_categories(
    limit: int = 12,
    db: Session = Depends(get_db)
):
    """Get parent categories optimized for homepage display - with aggregated product counts from subcategories"""
    # Get all active categories
    all_categories = db.query(Category).filter(Category.is_active == True).all()

    # Build parent-child mapping
    parent_categories = [cat for cat in all_categories if cat.parent_id is None]
    children_map = {}
    for cat in all_categories:
        if cat.parent_id:
            if cat.parent_id not in children_map:
                children_map[cat.parent_id] = []
            children_map[cat.parent_id].append(cat.id)

    # Get product counts for each category (only active products WITH images)
    product_counts = db.query(
        Product.category_id,
        func.count(func.distinct(Product.id)).label('count')
    ).join(ProductImage, Product.id == ProductImage.product_id).filter(
        Product.is_active == True
    ).group_by(Product.category_id).all()

    direct_count_map = {pc.category_id: pc.count for pc in product_counts}

    # Calculate total counts for parent categories (including subcategories)
    result = []
    for cat in parent_categories:
        # Direct products in this category
        total_count = direct_count_map.get(cat.id, 0)

        # Add products from all subcategories
        child_ids = children_map.get(cat.id, [])
        for child_id in child_ids:
            total_count += direct_count_map.get(child_id, 0)

        if total_count > 0:
            result.append({
                'id': cat.id,
                'name': cat.name,
                'slug': cat.slug,
                'description': cat.description,
                'image': cat.image,
                'product_count': total_count
            })

    # Sort by product count (descending) and limit
    result.sort(key=lambda x: x['product_count'], reverse=True)
    return result[:limit]


@router.get("", response_model=List[CategoryResponse])
async def get_categories(
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Category)

    if not include_inactive:
        query = query.filter(Category.is_active == True)

    categories = query.all()

    # Get product counts for each category (only products with images)
    product_counts = db.query(
        Product.category_id,
        func.count(func.distinct(Product.id)).label('count')
    ).join(ProductImage, Product.id == ProductImage.product_id).filter(
        Product.is_active == True
    ).group_by(Product.category_id).all()

    # Create a mapping of category_id to product count
    count_map = {pc.category_id: pc.count for pc in product_counts}

    # Build response with product counts
    result = []
    for cat in categories:
        cat_dict = {
            'id': cat.id,
            'name': cat.name,
            'slug': cat.slug,
            'description': cat.description,
            'image': cat.image,
            'parent_id': cat.parent_id,
            'is_active': cat.is_active,
            'product_count': count_map.get(cat.id, 0)
        }
        result.append(cat_dict)

    return result

@router.get("/{slug}", response_model=CategoryResponse)
async def get_category(slug: str, db: Session = Depends(get_db)):
    category = db.query(Category).filter(
        Category.slug == slug,
        Category.is_active == True
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return category

@router.post("", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    # Check if slug already exists
    existing = db.query(Category).filter(Category.slug == category_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this slug already exists"
        )
    
    category = Category(**category_data.dict())
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    for field, value in category_data.dict().items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    
    return category

@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    category.is_active = False
    db.commit()
    
    return {"message": "Category deleted successfully"}
