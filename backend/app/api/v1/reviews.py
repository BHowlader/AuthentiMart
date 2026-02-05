from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Review, Product, User, OrderItem
from app.schemas import ReviewCreate, ReviewResponse
from app.utils import get_current_user_required
from sqlalchemy import func

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
async def get_product_reviews(
    product_id: int,
    db: Session = Depends(get_db)
):
    reviews = db.query(Review).filter(
        Review.product_id == product_id
    ).order_by(Review.created_at.desc()).all()
    
    return reviews

@router.post("", response_model=ReviewResponse)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    # Check if product exists
    product = db.query(Product).filter(
        Product.id == review_data.product_id,
        Product.is_active == True
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if user already reviewed this product
    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.product_id == review_data.product_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this product"
        )
    
    # Check if user has purchased this product
    has_purchased = db.query(OrderItem).join(
        OrderItem.order
    ).filter(
        OrderItem.product_id == review_data.product_id,
        OrderItem.order.has(user_id=current_user.id)
    ).first()
    
    review = Review(
        user_id=current_user.id,
        product_id=review_data.product_id,
        rating=review_data.rating,
        comment=review_data.comment,
        is_verified=has_purchased is not None
    )
    
    db.add(review)
    db.commit()
    
    # Update product rating
    avg_rating = db.query(func.avg(Review.rating)).filter(
        Review.product_id == review_data.product_id
    ).scalar()
    
    review_count = db.query(func.count(Review.id)).filter(
        Review.product_id == review_data.product_id
    ).scalar()
    
    product.rating = round(avg_rating, 1) if avg_rating else 0
    product.review_count = review_count
    db.commit()
    
    db.refresh(review)
    return review

@router.delete("/{review_id}")
async def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    if review.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    product_id = review.product_id
    db.delete(review)
    db.commit()
    
    # Update product rating
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        avg_rating = db.query(func.avg(Review.rating)).filter(
            Review.product_id == product_id
        ).scalar()
        
        review_count = db.query(func.count(Review.id)).filter(
            Review.product_id == product_id
        ).scalar()
        
        product.rating = round(avg_rating, 1) if avg_rating else 0
        product.review_count = review_count
        db.commit()
    
    return {"message": "Review deleted"}
