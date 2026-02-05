from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Order, OrderItem, Product, User, PaymentStatus, OrderStatus
from app.schemas import OrderCreate, OrderResponse, OrderStatusUpdate
from app.utils import get_current_user_required, get_current_admin, generate_order_number, calculate_shipping
from math import ceil

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("", response_model=dict)
async def get_user_orders(
    page: int = 1,
    page_size: int = 10,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    query = db.query(Order).filter(Order.user_id == current_user.id)
    
    total = query.count()
    
    orders = query.order_by(Order.created_at.desc())\
        .offset((page - 1) * page_size)\
        .limit(page_size)\
        .all()
    
    return {
        "items": orders,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": ceil(total / page_size)
    }

@router.get("/{order_number}", response_model=OrderResponse)
async def get_order(
    order_number: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.order_number == order_number
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user owns this order or is admin
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    return order

@router.post("", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    # Validate and calculate order
    subtotal = 0
    order_items = []
    
    for item in order_data.items:
        product = db.query(Product).filter(
            Product.id == item.product_id,
            Product.is_active == True
        ).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {item.product_id} not found"
            )
        
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}"
            )
        
        item_total = product.price * item.quantity
        subtotal += item_total
        
        order_items.append({
            "product_id": product.id,
            "quantity": item.quantity,
            "price": product.price,
            "total": item_total
        })
    
    # Calculate shipping
    shipping_cost = calculate_shipping(subtotal, order_data.shipping_city)
    total = subtotal + shipping_cost
    
    # Create order
    order = Order(
        order_number=generate_order_number(),
        user_id=current_user.id,
        status=OrderStatus.PENDING,
        payment_status=PaymentStatus.PENDING,
        payment_method=order_data.payment_method.value,
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        total=total,
        shipping_name=order_data.shipping_name,
        shipping_phone=order_data.shipping_phone,
        shipping_email=order_data.shipping_email,
        shipping_address=order_data.shipping_address,
        shipping_area=order_data.shipping_area,
        shipping_city=order_data.shipping_city,
        notes=order_data.notes
    )
    
    db.add(order)
    db.commit()
    db.refresh(order)
    
    # Create order items and update stock
    for item_data in order_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            price=item_data["price"],
            total=item_data["total"]
        )
        db.add(order_item)
        
        # Update product stock
        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        product.stock -= item_data["quantity"]
    
    db.commit()
    db.refresh(order)
    
    return order

@router.put("/{order_number}/status", response_model=OrderResponse)
async def update_order_status(
    order_number: str,
    status_data: OrderStatusUpdate,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.order_number == order_number).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    order.status = status_data.status.value
    db.commit()
    db.refresh(order)
    
    return order

@router.post("/{order_number}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_number: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.order_number == order_number).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Can only cancel pending or confirmed orders
    if order.status not in [OrderStatus.PENDING.value, OrderStatus.CONFIRMED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order cannot be cancelled at this stage"
        )
    
    # Restore stock
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity
    
    order.status = OrderStatus.CANCELLED.value
    db.commit()
    db.refresh(order)
    
    return order

# Admin routes
@router.get("/admin/all", response_model=dict)
async def get_all_orders(
    page: int = 1,
    page_size: int = 20,
    status: str = None,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Order)
    
    if status:
        query = query.filter(Order.status == status)
    
    total = query.count()
    
    orders = query.order_by(Order.created_at.desc())\
        .offset((page - 1) * page_size)\
        .limit(page_size)\
        .all()
    
    return {
        "items": orders,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": ceil(total / page_size)
    }
