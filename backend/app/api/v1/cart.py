from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import CartItem, Product, User
from app.schemas import CartItemCreate, CartItemUpdate, CartItemResponse, CartResponse
from app.utils import get_current_user_required

router = APIRouter(prefix="/cart", tags=["Cart"])

def get_product_list_response(product):
    """Convert product to ProductListResponse-compatible dict"""
    return {
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
        "category": product.category.name if product.category else None
    }

@router.get("", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Get user's cart"""
    cart_items = db.query(CartItem).filter(
        CartItem.user_id == current_user.id
    ).all()

    items = []
    subtotal = 0

    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product and product.is_active:
            item_data = {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "created_at": item.created_at,
                "product": get_product_list_response(product)
            }
            items.append(item_data)
            subtotal += product.price * item.quantity

    return {
        "items": items,
        "subtotal": subtotal,
        "item_count": sum(item["quantity"] for item in items)
    }

@router.post("", response_model=CartItemResponse)
async def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Add item to cart"""
    # Check if product exists and is active
    product = db.query(Product).filter(
        Product.id == item_data.product_id,
        Product.is_active == True
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check stock
    if product.stock < item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Only {product.stock} available."
        )

    # Check if item already in cart
    existing_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == item_data.product_id
    ).first()

    if existing_item:
        # Update quantity
        new_quantity = existing_item.quantity + item_data.quantity
        if new_quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot add more. Only {product.stock} available."
            )
        existing_item.quantity = new_quantity
        db.commit()
        db.refresh(existing_item)
        cart_item = existing_item
    else:
        # Create new cart item
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity
        )
        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)

    return {
        "id": cart_item.id,
        "product_id": cart_item.product_id,
        "quantity": cart_item.quantity,
        "created_at": cart_item.created_at,
        "product": get_product_list_response(product)
    }

@router.put("/{item_id}", response_model=CartItemResponse)
async def update_cart_item(
    item_id: int,
    item_data: CartItemUpdate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Update cart item quantity"""
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )

    product = db.query(Product).filter(Product.id == cart_item.product_id).first()

    if item_data.quantity > product.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Only {product.stock} available."
        )

    cart_item.quantity = item_data.quantity
    db.commit()
    db.refresh(cart_item)

    return {
        "id": cart_item.id,
        "product_id": cart_item.product_id,
        "quantity": cart_item.quantity,
        "created_at": cart_item.created_at,
        "product": get_product_list_response(product)
    }

@router.delete("/{item_id}")
async def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Remove item from cart"""
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )

    db.delete(cart_item)
    db.commit()

    return {"message": "Item removed from cart"}

@router.delete("")
async def clear_cart(
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Clear all items from cart"""
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()

    return {"message": "Cart cleared"}
