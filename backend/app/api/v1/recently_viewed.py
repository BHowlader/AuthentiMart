from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from app.database import get_db
from app.models import RecentlyViewed, Product, User
from app.schemas import RecentlyViewedCreate
from app.utils import get_current_user

router = APIRouter(prefix="/recently-viewed", tags=["Recently Viewed"])


@router.get("")
async def get_recently_viewed(
    limit: int = 20,
    session_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recently viewed products"""
    query = db.query(RecentlyViewed)

    if current_user:
        query = query.filter(RecentlyViewed.user_id == current_user.id)
    elif session_id:
        query = query.filter(RecentlyViewed.session_id == session_id)
    else:
        return {"items": []}

    # Get recent views, excluding duplicates (keep latest)
    recent = query.order_by(RecentlyViewed.viewed_at.desc()).limit(limit * 2).all()

    # Deduplicate by product_id, keeping the most recent
    seen_products = set()
    items = []

    for view in recent:
        if view.product_id not in seen_products and view.product:
            # Only include active products with images
            if view.product.is_active and view.product.images:
                seen_products.add(view.product_id)
                primary_image = next((img for img in view.product.images if img.is_primary), None)
                items.append({
                    "id": view.id,
                    "product_id": view.product_id,
                    "viewed_at": view.viewed_at,
                    "product": {
                        "id": view.product.id,
                        "name": view.product.name,
                        "slug": view.product.slug,
                        "price": view.product.price,
                        "original_price": view.product.original_price,
                        "discount": view.product.discount,
                        "image": primary_image.url if primary_image else (view.product.images[0].url if view.product.images else None),
                        "rating": view.product.rating,
                        "review_count": view.product.review_count
                    }
                })

                if len(items) >= limit:
                    break

    return {"items": items}


@router.post("")
async def track_view(
    data: RecentlyViewedCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Track a product view"""
    # Verify product exists
    product = db.query(Product).filter(
        Product.id == data.product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check for existing view (within last hour to prevent spam)
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)

    query = db.query(RecentlyViewed).filter(
        RecentlyViewed.product_id == data.product_id,
        RecentlyViewed.viewed_at > one_hour_ago
    )

    if current_user:
        query = query.filter(RecentlyViewed.user_id == current_user.id)
    elif data.session_id:
        query = query.filter(RecentlyViewed.session_id == data.session_id)
    else:
        return {"message": "View not tracked (no user or session)"}

    existing = query.first()

    if existing:
        # Update timestamp
        existing.viewed_at = datetime.utcnow()
        db.commit()
        return {"message": "View updated"}

    # Create new view record
    view = RecentlyViewed(
        user_id=current_user.id if current_user else None,
        session_id=data.session_id if not current_user else None,
        product_id=data.product_id
    )

    db.add(view)
    db.commit()

    # Clean up old views (keep last 100 per user/session)
    cleanup_query = db.query(RecentlyViewed)
    if current_user:
        cleanup_query = cleanup_query.filter(RecentlyViewed.user_id == current_user.id)
    elif data.session_id:
        cleanup_query = cleanup_query.filter(RecentlyViewed.session_id == data.session_id)

    count = cleanup_query.count()
    if count > 100:
        # Delete oldest views
        oldest = cleanup_query.order_by(RecentlyViewed.viewed_at.asc()).limit(count - 100).all()
        for old_view in oldest:
            db.delete(old_view)
        db.commit()

    return {"message": "View tracked"}


@router.delete("")
async def clear_history(
    session_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clear recently viewed history"""
    query = db.query(RecentlyViewed)

    if current_user:
        query = query.filter(RecentlyViewed.user_id == current_user.id)
    elif session_id:
        query = query.filter(RecentlyViewed.session_id == session_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User or session ID required"
        )

    deleted = query.delete()
    db.commit()

    return {"message": f"Cleared {deleted} items from history"}
