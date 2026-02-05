from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import WishlistItem, Product, User
from app.schemas import WishlistItemResponse, WishlistItemCreate
from app.utils import get_current_user_required

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.get("", response_model=List[WishlistItemResponse])
async def get_wishlist(
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    items = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id
    ).all()
    
    # Add product info to each item
    result = []
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product and product.is_active:
            primary_image = next((img for img in product.images if img.is_primary), None)
            result.append({
                "id": item.id,
                "user_id": item.user_id,
                "product_id": item.product_id,
                "created_at": item.created_at,
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
                    "image": primary_image.url if primary_image else (product.images[0].url if product.images else None),
                    "category": product.category.name if product.category else None
                }
            })
    
    return result

@router.post("", response_model=WishlistItemResponse)
async def add_to_wishlist(
    item: WishlistItemCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    # Check if product exists
    product = db.query(Product).filter(
        Product.id == item.product_id,
        Product.is_active == True
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if already in wishlist
    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == item.product_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product already in wishlist"
        )
    
    wishlist_item = WishlistItem(
        user_id=current_user.id,
        product_id=item.product_id
    )
    
    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)
    
    return wishlist_item

@router.delete("/{product_id}")
async def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    item = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not in wishlist"
        )
    
    db.delete(item)
    db.commit()
    
    return {"message": "Removed from wishlist"}

@router.post("/toggle/{product_id}")
async def toggle_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Toggle product in wishlist."""
    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return {"action": "removed", "in_wishlist": False}
    else:
        # Check if product exists
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.is_active == True
        ).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        wishlist_item = WishlistItem(
            user_id=current_user.id,
            product_id=product_id
        )
        db.add(wishlist_item)
        db.commit()
        
        return {"action": "added", "in_wishlist": True}
