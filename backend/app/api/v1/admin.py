from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import os
import uuid
import math

from app.database import get_db
from app.models.models import (
    User, Product, Order, OrderItem, Category,
    ProductImage, UserRole, OrderStatus, PaymentStatus, Address, OrderTracking
)
from app.utils.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

# ============ Pydantic Schemas ============

class DashboardStats(BaseModel):
    total_revenue: float
    total_orders: int
    total_products: int
    total_customers: int
    pending_orders: int
    low_stock_products: int
    revenue_change: float
    orders_change: float
    
class SalesData(BaseModel):
    date: str
    sales: float
    orders: int

class ProductPerformance(BaseModel):
    id: int
    name: str
    image: Optional[str]
    total_sold: int
    total_revenue: float
    stock: int
    category: str

class InventoryItem(BaseModel):
    id: int
    name: str
    image: Optional[str]
    stock: int
    sold: int
    reorder_point: int
    status: str
    category: str
    price: float

class PredictionData(BaseModel):
    id: int
    name: str
    image: Optional[str]
    current_stock: int
    predicted_demand: int
    days_until_stockout: int
    recommended_reorder: int
    urgency: str
    # Enhanced prediction fields
    avg_daily_sales: float
    trend: str  # "rising", "stable", "declining"
    trend_percentage: float
    seasonal_factor: float
    confidence: str  # "high", "medium", "low"
    data_points: int  # Number of days with sales data

class RecentOrder(BaseModel):
    id: int
    order_number: str
    customer_name: str
    total: float
    status: str
    payment_status: str
    created_at: datetime

class CustomerInfo(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    picture: Optional[str]
    is_active: bool
    total_orders: int
    total_spent: float
    last_order_date: Optional[datetime]
    created_at: datetime

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    discount: int = 0
    stock: int = 0
    category_id: int
    brand: Optional[str] = None
    sku: Optional[str] = None
    is_featured: bool = False
    is_new: bool = True
    is_active: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    discount: Optional[int] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    brand: Optional[str] = None
    sku: Optional[str] = None
    is_featured: Optional[bool] = None
    is_new: Optional[bool] = None
    is_active: Optional[bool] = None

# ============ Dashboard Endpoints ============

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get main dashboard statistics"""
    
    # Current period (last 30 days)
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    sixty_days_ago = now - timedelta(days=60)
    
    # Total revenue (all time)
    total_revenue = db.query(func.sum(Order.total)).filter(
        Order.payment_status == PaymentStatus.COMPLETED
    ).scalar() or 0
    
    # Revenue this period
    current_period_revenue = db.query(func.sum(Order.total)).filter(
        and_(
            Order.payment_status == PaymentStatus.COMPLETED,
            Order.created_at >= thirty_days_ago
        )
    ).scalar() or 0
    
    # Revenue previous period
    previous_period_revenue = db.query(func.sum(Order.total)).filter(
        and_(
            Order.payment_status == PaymentStatus.COMPLETED,
            Order.created_at >= sixty_days_ago,
            Order.created_at < thirty_days_ago
        )
    ).scalar() or 0
    
    # Calculate revenue change percentage
    if previous_period_revenue > 0:
        revenue_change = ((current_period_revenue - previous_period_revenue) / previous_period_revenue) * 100
    else:
        revenue_change = 100 if current_period_revenue > 0 else 0
    
    # Total orders
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    
    # Orders this period
    current_period_orders = db.query(func.count(Order.id)).filter(
        Order.created_at >= thirty_days_ago
    ).scalar() or 0
    
    # Orders previous period
    previous_period_orders = db.query(func.count(Order.id)).filter(
        and_(
            Order.created_at >= sixty_days_ago,
            Order.created_at < thirty_days_ago
        )
    ).scalar() or 0
    
    # Calculate orders change percentage
    if previous_period_orders > 0:
        orders_change = ((current_period_orders - previous_period_orders) / previous_period_orders) * 100
    else:
        orders_change = 100 if current_period_orders > 0 else 0
    
    # Total products
    total_products = db.query(func.count(Product.id)).filter(
        Product.is_active == True
    ).scalar() or 0
    
    # Total customers
    total_customers = db.query(func.count(User.id)).filter(
        User.role == UserRole.USER
    ).scalar() or 0
    
    # Pending orders
    pending_orders = db.query(func.count(Order.id)).filter(
        Order.status.in_([OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING])
    ).scalar() or 0
    
    # Low stock products (stock < 10)
    low_stock_products = db.query(func.count(Product.id)).filter(
        and_(Product.stock < 10, Product.is_active == True)
    ).scalar() or 0
    
    return DashboardStats(
        total_revenue=round(total_revenue, 2),
        total_orders=total_orders,
        total_products=total_products,
        total_customers=total_customers,
        pending_orders=pending_orders,
        low_stock_products=low_stock_products,
        revenue_change=round(revenue_change, 1),
        orders_change=round(orders_change, 1)
    )

@router.get("/dashboard/sales", response_model=List[SalesData])
async def get_sales_data(
    period: str = "7d",  # 7d, 30d, 90d, 1y
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get sales data for charts"""
    
    now = datetime.utcnow()
    
    if period == "7d":
        start_date = now - timedelta(days=7)
        group_format = "%Y-%m-%d"
    elif period == "30d":
        start_date = now - timedelta(days=30)
        group_format = "%Y-%m-%d"
    elif period == "90d":
        start_date = now - timedelta(days=90)
        group_format = "%Y-%W"  # Week
    else:  # 1y
        start_date = now - timedelta(days=365)
        group_format = "%Y-%m"  # Month
    
    # Get orders in the period
    orders = db.query(Order).filter(
        and_(
            Order.created_at >= start_date,
            Order.payment_status == PaymentStatus.COMPLETED
        )
    ).all()
    
    # Group by date
    sales_by_date = {}
    for order in orders:
        date_key = order.created_at.strftime(group_format)
        if date_key not in sales_by_date:
            sales_by_date[date_key] = {"sales": 0, "orders": 0}
        sales_by_date[date_key]["sales"] += order.total
        sales_by_date[date_key]["orders"] += 1
    
    # Fill in missing dates for 7d and 30d
    result = []
    if period in ["7d", "30d"]:
        days = 7 if period == "7d" else 30
        for i in range(days):
            date = now - timedelta(days=days - i - 1)
            date_key = date.strftime(group_format)
            data = sales_by_date.get(date_key, {"sales": 0, "orders": 0})
            result.append(SalesData(
                date=date.strftime("%b %d"),
                sales=round(data["sales"], 2),
                orders=data["orders"]
            ))
    else:
        for date_key in sorted(sales_by_date.keys()):
            data = sales_by_date[date_key]
            result.append(SalesData(
                date=date_key,
                sales=round(data["sales"], 2),
                orders=data["orders"]
            ))
    
    return result

@router.get("/dashboard/recent-orders", response_model=List[RecentOrder])
async def get_recent_orders(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get recent orders"""
    
    orders = db.query(Order).order_by(desc(Order.created_at)).limit(limit).all()
    
    return [
        RecentOrder(
            id=order.id,
            order_number=order.order_number,
            customer_name=order.shipping_name,
            total=order.total,
            status=order.status,
            payment_status=order.payment_status,
            created_at=order.created_at
        )
        for order in orders
    ]

# ============ Product Performance ============

@router.get("/products/top-selling", response_model=List[ProductPerformance])
async def get_top_selling_products(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get top selling products"""
    
    products = db.query(
        Product.id,
        Product.name,
        Product.stock,
        func.sum(OrderItem.quantity).label('total_sold'),
        func.sum(OrderItem.total).label('total_revenue'),
        Category.name.label('category_name')
    ).join(OrderItem, Product.id == OrderItem.product_id)\
     .join(Order, OrderItem.order_id == Order.id)\
     .join(Category, Product.category_id == Category.id)\
     .filter(Order.payment_status == PaymentStatus.COMPLETED)\
     .group_by(Product.id, Category.name)\
     .order_by(desc('total_sold'))\
     .limit(limit).all()
    
    result = []
    for p in products:
        # Get primary image
        image = db.query(ProductImage).filter(
            and_(ProductImage.product_id == p.id, ProductImage.is_primary == True)
        ).first()
        
        result.append(ProductPerformance(
            id=p.id,
            name=p.name,
            image=image.url if image else None,
            total_sold=p.total_sold or 0,
            total_revenue=round(p.total_revenue or 0, 2),
            stock=p.stock,
            category=p.category_name
        ))
    
    return result

@router.get("/products/least-selling", response_model=List[ProductPerformance])
async def get_least_selling_products(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get least selling products (with at least 1 sale)"""
    
    products = db.query(
        Product.id,
        Product.name,
        Product.stock,
        func.coalesce(func.sum(OrderItem.quantity), 0).label('total_sold'),
        func.coalesce(func.sum(OrderItem.total), 0).label('total_revenue'),
        Category.name.label('category_name')
    ).outerjoin(OrderItem, Product.id == OrderItem.product_id)\
     .outerjoin(Order, and_(OrderItem.order_id == Order.id, Order.payment_status == PaymentStatus.COMPLETED))\
     .join(Category, Product.category_id == Category.id)\
     .filter(Product.is_active == True)\
     .group_by(Product.id, Category.name)\
     .order_by('total_sold')\
     .limit(limit).all()
    
    result = []
    for p in products:
        image = db.query(ProductImage).filter(
            and_(ProductImage.product_id == p.id, ProductImage.is_primary == True)
        ).first()
        
        result.append(ProductPerformance(
            id=p.id,
            name=p.name,
            image=image.url if image else None,
            total_sold=p.total_sold or 0,
            total_revenue=round(p.total_revenue or 0, 2),
            stock=p.stock,
            category=p.category_name
        ))
    
    return result

# ============ Inventory Management ============

@router.get("/inventory", response_model=List[InventoryItem])
async def get_inventory(
    filter: str = "all",  # all, low, out
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get inventory status"""
    
    query = db.query(Product).filter(Product.is_active == True)
    
    if filter == "low":
        query = query.filter(and_(Product.stock > 0, Product.stock < 10))
    elif filter == "out":
        query = query.filter(Product.stock == 0)
    
    products = query.all()
    
    result = []
    for product in products:
        # Get total sold
        total_sold = db.query(func.sum(OrderItem.quantity)).filter(
            OrderItem.product_id == product.id
        ).scalar() or 0
        
        # Get primary image
        image = db.query(ProductImage).filter(
            and_(ProductImage.product_id == product.id, ProductImage.is_primary == True)
        ).first()
        
        # Get category
        category = db.query(Category).filter(Category.id == product.category_id).first()
        
        # Determine status
        if product.stock == 0:
            status = "out_of_stock"
        elif product.stock < 5:
            status = "critical"
        elif product.stock < 10:
            status = "low"
        else:
            status = "healthy"
        
        result.append(InventoryItem(
            id=product.id,
            name=product.name,
            image=image.url if image else None,
            stock=product.stock,
            sold=total_sold,
            reorder_point=10,  # Default reorder point
            status=status,
            category=category.name if category else "Unknown",
            price=product.price
        ))
    
    return sorted(result, key=lambda x: x.stock)

@router.put("/inventory/{product_id}/stock")
async def update_stock(
    product_id: int,
    stock: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update product stock"""
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.stock = stock
    db.commit()
    
    return {"message": "Stock updated successfully", "new_stock": stock}

# ============ Predictions ============

def get_seasonal_multiplier(target_date: datetime) -> float:
    """
    Get seasonal multiplier for Bangladesh market.
    Accounts for Eid seasons, weekends (Friday-Saturday), and general patterns.
    """
    multiplier = 1.0

    # Weekend boost (Friday-Saturday in Bangladesh)
    if target_date.weekday() in [4, 5]:  # Friday=4, Saturday=5
        multiplier *= 1.15

    # Month-based seasonality for Bangladesh
    month = target_date.month
    seasonal_factors = {
        1: 0.9,   # January - post-holiday slowdown
        2: 0.95,  # February - normal
        3: 1.1,   # March - Pohela Boishakh prep starts
        4: 1.25,  # April - Pohela Boishakh (Bengali New Year)
        5: 1.0,   # May - normal
        6: 1.0,   # June - normal
        7: 1.15,  # July - Eid-ul-Adha typical month (varies)
        8: 1.0,   # August - normal
        9: 1.0,   # September - normal
        10: 1.2,  # October - Durga Puja
        11: 1.1,  # November - pre-winter shopping
        12: 1.15, # December - winter season, year-end sales
    }
    multiplier *= seasonal_factors.get(month, 1.0)

    # Eid seasons (approximate - Eid dates vary each year)
    # In production, integrate with a proper Islamic calendar API
    # Eid-ul-Fitr window (roughly March-May depending on year)
    # Eid-ul-Adha window (roughly June-August depending on year)
    if month in [3, 4, 5, 6, 7, 8]:  # Eid-prone months
        multiplier *= 1.1

    return min(multiplier, 1.5)  # Cap at 1.5x to avoid over-prediction


def get_weighted_daily_sales(db: Session, product_id: int, days: int = 30) -> tuple:
    """
    Calculate weighted moving average where recent sales matter more.
    Returns (weighted_avg, trend, trend_pct, data_points)
    """
    now = datetime.utcnow()

    # Get daily sales for the past N days
    daily_sales = []
    for i in range(days):
        day_start = now - timedelta(days=i+1)
        day_end = now - timedelta(days=i)

        sales = db.query(func.sum(OrderItem.quantity)).join(Order).filter(
            and_(
                OrderItem.product_id == product_id,
                Order.created_at >= day_start,
                Order.created_at < day_end,
                Order.payment_status == PaymentStatus.COMPLETED
            )
        ).scalar() or 0

        daily_sales.append(sales)

    # Count days with actual sales (data points)
    data_points = sum(1 for s in daily_sales if s > 0)

    if sum(daily_sales) == 0:
        return 0, "stable", 0, 0

    # Weighted moving average: recent days weighted more
    # Week 1 (days 0-6): weight 4
    # Week 2 (days 7-13): weight 3
    # Week 3 (days 14-20): weight 2
    # Week 4 (days 21-29): weight 1
    weights = []
    for i in range(days):
        if i < 7:
            weights.append(4)
        elif i < 14:
            weights.append(3)
        elif i < 21:
            weights.append(2)
        else:
            weights.append(1)

    weighted_sum = sum(s * w for s, w in zip(daily_sales, weights))
    total_weight = sum(weights)
    weighted_avg = weighted_sum / total_weight

    # Calculate trend by comparing recent week to older weeks
    recent_week = sum(daily_sales[:7]) / 7 if daily_sales[:7] else 0
    older_weeks = sum(daily_sales[7:]) / max(len(daily_sales[7:]), 1) if daily_sales[7:] else 0

    if older_weeks > 0:
        trend_pct = ((recent_week - older_weeks) / older_weeks) * 100
    else:
        trend_pct = 100 if recent_week > 0 else 0

    # Determine trend direction
    if trend_pct > 15:
        trend = "rising"
    elif trend_pct < -15:
        trend = "declining"
    else:
        trend = "stable"

    return weighted_avg, trend, round(trend_pct, 1), data_points


def get_category_average_sales(db: Session, category_id: int, days: int = 30) -> float:
    """
    Get average daily sales for a category (fallback for new products).
    """
    start_date = datetime.utcnow() - timedelta(days=days)

    # Get all products in category
    products = db.query(Product.id).filter(Product.category_id == category_id).all()
    product_ids = [p.id for p in products]

    if not product_ids:
        return 0

    total_sales = db.query(func.sum(OrderItem.quantity)).join(Order).filter(
        and_(
            OrderItem.product_id.in_(product_ids),
            Order.created_at >= start_date,
            Order.payment_status == PaymentStatus.COMPLETED
        )
    ).scalar() or 0

    # Average per product per day
    return total_sales / (len(product_ids) * days)


@router.get("/predictions", response_model=List[PredictionData])
async def get_demand_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Get AI-powered demand predictions for products.

    Features:
    - Weighted moving average (recent sales weighted 4x more)
    - Seasonal multipliers for Bangladesh market (Eid, weekends, festivals)
    - Category-based fallback for new products
    - Trend analysis (rising/stable/declining)
    - Confidence scoring based on data availability
    """

    products = db.query(Product).filter(Product.is_active == True).all()

    # Pre-calculate category averages for fallback
    category_averages = {}
    for product in products:
        if product.category_id not in category_averages:
            category_averages[product.category_id] = get_category_average_sales(
                db, product.category_id
            )

    # Get seasonal multiplier for next 30 days (average)
    seasonal_multipliers = []
    for i in range(30):
        future_date = datetime.utcnow() + timedelta(days=i)
        seasonal_multipliers.append(get_seasonal_multiplier(future_date))
    avg_seasonal_factor = sum(seasonal_multipliers) / len(seasonal_multipliers)

    predictions = []
    for product in products:
        # Get weighted daily sales with trend analysis
        weighted_avg, trend, trend_pct, data_points = get_weighted_daily_sales(
            db, product.id, days=30
        )

        # Use category average as fallback for new products
        if weighted_avg == 0 and product.category_id in category_averages:
            weighted_avg = category_averages[product.category_id]
            used_fallback = True
        else:
            used_fallback = False

        # Apply trend adjustment
        trend_multiplier = 1.0
        if trend == "rising":
            trend_multiplier = 1.0 + (min(abs(trend_pct), 50) / 100)  # Up to 1.5x
        elif trend == "declining":
            trend_multiplier = 1.0 - (min(abs(trend_pct), 30) / 100)  # Down to 0.7x

        # Calculate predicted demand with all factors
        base_demand = weighted_avg * 30
        adjusted_demand = base_demand * trend_multiplier * avg_seasonal_factor

        # Add safety buffer (20%) and round up
        predicted_demand = math.ceil(adjusted_demand * 1.2)

        # Calculate days until stockout using weighted average
        if weighted_avg > 0:
            days_until_stockout = math.floor(product.stock / weighted_avg)
        else:
            days_until_stockout = 999

        # Recommended reorder with dynamic safety stock
        # Higher safety stock for rising trends and seasonal peaks
        safety_stock = 10
        if trend == "rising":
            safety_stock = 15
        if avg_seasonal_factor > 1.1:
            safety_stock = int(safety_stock * 1.2)

        recommended_reorder = max(0, predicted_demand - product.stock + safety_stock)

        # Determine urgency
        if days_until_stockout <= 3:
            urgency = "critical"
        elif days_until_stockout <= 7:
            urgency = "high"
        elif days_until_stockout <= 14:
            urgency = "medium"
        else:
            urgency = "low"

        # Determine confidence level
        if data_points >= 15:
            confidence = "high"
        elif data_points >= 7 or used_fallback:
            confidence = "medium"
        else:
            confidence = "low"

        # Get primary image
        image = db.query(ProductImage).filter(
            and_(ProductImage.product_id == product.id, ProductImage.is_primary == True)
        ).first()

        predictions.append(PredictionData(
            id=product.id,
            name=product.name,
            image=image.url if image else None,
            current_stock=product.stock,
            predicted_demand=predicted_demand,
            days_until_stockout=min(days_until_stockout, 999),
            recommended_reorder=recommended_reorder,
            urgency=urgency,
            avg_daily_sales=round(weighted_avg, 2),
            trend=trend,
            trend_percentage=trend_pct,
            seasonal_factor=round(avg_seasonal_factor, 2),
            confidence=confidence,
            data_points=data_points
        ))

    # Sort by urgency (critical first), then by days until stockout
    urgency_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    predictions.sort(key=lambda x: (urgency_order.get(x.urgency, 4), x.days_until_stockout))

    return predictions

# ============ Product Management ============

@router.get("/products")
async def get_all_products(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all products for admin management"""
    
    query = db.query(Product)
    
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    total = query.count()
    products = query.offset((page - 1) * limit).limit(limit).all()
    
    result = []
    for product in products:
        image = db.query(ProductImage).filter(
            and_(ProductImage.product_id == product.id, ProductImage.is_primary == True)
        ).first()
        
        category = db.query(Category).filter(Category.id == product.category_id).first()
        
        result.append({
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "price": product.price,
            "original_price": product.original_price,
            "discount": product.discount,
            "stock": product.stock,
            "category": category.name if category else None,
            "category_id": product.category_id,
            "brand": product.brand,
            "sku": product.sku,
            "is_featured": product.is_featured,
            "is_new": product.is_new,
            "is_active": product.is_active,
            "image": image.url if image else None,
            "created_at": product.created_at
        })
    
    return {
        "products": result,
        "total": total,
        "page": page,
        "pages": math.ceil(total / limit)
    }

@router.post("/products")
async def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a new product"""
    
    # Generate slug
    slug = product.name.lower().replace(" ", "-")
    slug = ''.join(c for c in slug if c.isalnum() or c == '-')
    
    # Check if slug exists
    existing = db.query(Product).filter(Product.slug == slug).first()
    if existing:
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
    
    # Generate SKU if not provided
    sku = product.sku or f"SKU-{uuid.uuid4().hex[:8].upper()}"
    
    new_product = Product(
        name=product.name,
        slug=slug,
        description=product.description,
        price=product.price,
        original_price=product.original_price,
        discount=product.discount,
        stock=product.stock,
        category_id=product.category_id,
        brand=product.brand,
        sku=sku,
        is_featured=product.is_featured,
        is_new=product.is_new,
        is_active=product.is_active
    )
    
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    return {"message": "Product created successfully", "product_id": new_product.id}

@router.put("/products/{product_id}")
async def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update a product"""
    
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product.dict(exclude_unset=True)
    
    # Update slug if name changes
    if "name" in update_data:
        slug = update_data["name"].lower().replace(" ", "-")
        slug = ''.join(c for c in slug if c.isalnum() or c == '-')
        existing = db.query(Product).filter(and_(Product.slug == slug, Product.id != product_id)).first()
        if existing:
            slug = f"{slug}-{uuid.uuid4().hex[:6]}"
        update_data["slug"] = slug
    
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db.commit()
    
    return {"message": "Product updated successfully"}

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Delete a product (soft delete)"""
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.is_active = False
    db.commit()
    
    return {"message": "Product deleted successfully"}

@router.post("/products/{product_id}/images")
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    is_primary: bool = Form(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Upload product image"""
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Save file
    upload_dir = "uploads/products"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    filepath = os.path.join(upload_dir, filename)
    
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # If this is primary, unset other primary images
    if is_primary:
        db.query(ProductImage).filter(
            and_(ProductImage.product_id == product_id, ProductImage.is_primary == True)
        ).update({"is_primary": False})
    
    # Create image record
    image = ProductImage(
        product_id=product_id,
        url=f"/uploads/products/{filename}",
        is_primary=is_primary
    )
    db.add(image)
    db.commit()
    
    return {"message": "Image uploaded successfully", "url": image.url}

# ============ Categories ============

@router.get("/categories")
async def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all categories"""
    
    categories = db.query(Category).filter(Category.is_active == True).all()
    
    return [
        {
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description,
            "image": cat.image,
            "product_count": db.query(func.count(Product.id)).filter(
                Product.category_id == cat.id
            ).scalar()
        }
        for cat in categories
    ]

# ============ Order Management ============

@router.get("/orders")
async def get_all_orders(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all orders for admin"""
    
    query = db.query(Order)
    
    if status:
        query = query.filter(Order.status == status)
    
    total = query.count()
    orders = query.order_by(desc(Order.created_at)).offset((page - 1) * limit).limit(limit).all()
    
    result = []
    for order in orders:
        user = db.query(User).filter(User.id == order.user_id).first()
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        
        result.append({
            "id": order.id,
            "order_number": order.order_number,
            "customer": {
                "id": user.id if user else None,
                "name": order.shipping_name,
                "email": order.shipping_email,
                "phone": order.shipping_phone
            },
            "items_count": len(items),
            "subtotal": order.subtotal,
            "shipping_cost": order.shipping_cost,
            "total": order.total,
            "status": order.status,
            "payment_status": order.payment_status,
            "payment_method": order.payment_method,
            "shipping_address": f"{order.shipping_address}, {order.shipping_area}, {order.shipping_city}",
            "notes": order.notes,
            "created_at": order.created_at
        })
    
    return {
        "orders": result,
        "total": total,
        "page": page,
        "pages": math.ceil(total / limit)
    }

@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Update order status"""

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    valid_statuses = [s.value for s in OrderStatus]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Valid: {valid_statuses}")

    old_payment_status = order.payment_status
    order.status = status

    # Auto-complete payment based on payment method and order status
    # bKash/Card: Payment completes when order is confirmed (payment verified before confirming)
    # COD: Payment completes when order is delivered (payment collected on delivery)
    if order.payment_status == PaymentStatus.PENDING.value:
        if status == OrderStatus.CONFIRMED.value and order.payment_method in ["bkash", "card"]:
            order.payment_status = PaymentStatus.COMPLETED.value
        elif status == OrderStatus.DELIVERED.value and order.payment_method == "cod":
            order.payment_status = PaymentStatus.COMPLETED.value

    # Add tracking entry for order status change
    tracking = OrderTracking(
        order_id=order.id,
        status=status.replace("_", " ").title(),
        description=f"Order status updated to {status}"
    )
    db.add(tracking)

    # Add tracking entry for payment status change if it changed
    if order.payment_status != old_payment_status:
        payment_tracking = OrderTracking(
            order_id=order.id,
            status=f"Payment {order.payment_status.title()}",
            description=f"Payment auto-completed ({order.payment_method.upper()})"
        )
        db.add(payment_tracking)

    db.commit()

    return {
        "message": "Order status updated",
        "new_status": status,
        "payment_status": order.payment_status
    }

# ============ Revenue Analytics ============

@router.get("/analytics/revenue")
async def get_revenue_analytics(
    period: str = "30d",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get detailed revenue analytics"""
    
    now = datetime.utcnow()
    
    periods = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "1y": 365
    }
    
    days = periods.get(period, 30)
    start_date = now - timedelta(days=days)
    
    # Revenue by category
    category_revenue = db.query(
        Category.name,
        func.sum(OrderItem.total).label('revenue')
    ).join(Product, Category.id == Product.category_id)\
     .join(OrderItem, Product.id == OrderItem.product_id)\
     .join(Order, OrderItem.order_id == Order.id)\
     .filter(
         and_(
             Order.created_at >= start_date,
             Order.payment_status == PaymentStatus.COMPLETED
         )
     ).group_by(Category.name).all()
    
    # Revenue by payment method
    payment_revenue_query = db.query(
        Order.payment_method,
        func.sum(Order.total).label('revenue'),
        func.count(Order.id).label('count')
    ).filter(
        and_(
            Order.created_at >= start_date,
            Order.payment_status == PaymentStatus.COMPLETED
        )
    ).group_by(Order.payment_method).all()
    
    # Ensure all major payment methods are represented
    payment_methods_map = {
        "bkash": {"method": "bkash", "revenue": 0, "count": 0},
        "nagad": {"method": "nagad", "revenue": 0, "count": 0},
        "rocket": {"method": "rocket", "revenue": 0, "count": 0},
        "card": {"method": "card", "revenue": 0, "count": 0},
        "cod": {"method": "cod", "revenue": 0, "count": 0}
    }
    
    for p in payment_revenue_query:
        method_key = p[0].lower() if p[0] else "unknown"
        if method_key not in payment_methods_map:
             payment_methods_map[method_key] = {"method": p[0], "revenue": 0, "count": 0}
        
        payment_methods_map[method_key]["revenue"] = round(p[1] or 0, 2)
        payment_methods_map[method_key]["count"] = p[2]
            
    payment_revenue_list = list(payment_methods_map.values())
    
    # Daily revenue trend
    daily_revenue = []
    for i in range(min(days, 30)):  # Max 30 data points
        day = now - timedelta(days=days - i - 1)
        next_day = day + timedelta(days=1)
        
        revenue = db.query(func.sum(Order.total)).filter(
            and_(
                Order.created_at >= day.replace(hour=0, minute=0, second=0),
                Order.created_at < next_day.replace(hour=0, minute=0, second=0),
                Order.payment_status == PaymentStatus.COMPLETED
            )
        ).scalar() or 0
        
        daily_revenue.append({
            "date": day.strftime("%b %d"),
            "revenue": round(revenue, 2)
        })
    
    return {
        "by_category": [{"name": c[0], "revenue": round(c[1] or 0, 2)} for c in category_revenue],
        "by_payment_method": payment_revenue_list,
        "daily_trend": daily_revenue
    }

# ============ Customer Analytics ============

@router.get("/analytics/customers")
async def get_customer_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get customer analytics"""
    
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    
    # New customers this month
    new_customers = db.query(func.count(User.id)).filter(
        and_(
            User.role == UserRole.USER,
            User.created_at >= thirty_days_ago
        )
    ).scalar() or 0
    
    # Top customers by order value
    top_customers = db.query(
        User.id,
        User.name,
        User.email,
        func.sum(Order.total).label('total_spent'),
        func.count(Order.id).label('order_count')
    ).join(Order, User.id == Order.user_id)\
     .filter(Order.payment_status == PaymentStatus.COMPLETED)\
     .group_by(User.id)\
     .order_by(desc('total_spent'))\
     .limit(10).all()
    
    # Customer growth trend
    growth = []
    for i in range(12):
        month_start = now.replace(day=1) - timedelta(days=30 * i)
        month_end = month_start + timedelta(days=30)
        
        count = db.query(func.count(User.id)).filter(
            and_(
                User.role == UserRole.USER,
                User.created_at >= month_start,
                User.created_at < month_end
            )
        ).scalar() or 0
        
        growth.append({
            "month": month_start.strftime("%b %Y"),
            "count": count
        })
    
    return {
        "new_this_month": new_customers,
        "top_customers": [
            {
                "id": c[0],
                "name": c[1],
                "email": c[2],
                "total_spent": round(c[3] or 0, 2),
                "order_count": c[4]
            }
            for c in top_customers
        ],
        "growth_trend": list(reversed(growth))
    }

# ============ Customer Management ============

@router.get("/customers")
async def get_all_customers(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    status: Optional[str] = None,  # active, inactive
    sort_by: Optional[str] = "created_at",  # created_at, total_spent, total_orders
    sort_order: Optional[str] = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all customers with their order statistics"""

    # Base query for users with role USER
    query = db.query(User).filter(User.role == UserRole.USER)

    # Apply search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (User.name.ilike(search_pattern)) |
            (User.email.ilike(search_pattern)) |
            (User.phone.ilike(search_pattern))
        )

    # Apply status filter
    if status == "active":
        query = query.filter(User.is_active == True)
    elif status == "inactive":
        query = query.filter(User.is_active == False)

    # Get total count before pagination
    total = query.count()

    # Apply sorting
    if sort_by == "created_at":
        order_col = User.created_at
    else:
        order_col = User.created_at  # Default, actual sorting by stats done below

    if sort_order == "desc":
        query = query.order_by(desc(order_col))
    else:
        query = query.order_by(order_col)

    # Apply pagination
    customers = query.offset((page - 1) * limit).limit(limit).all()

    # Get order statistics for each customer
    result = []
    for customer in customers:
        # Get total orders (all orders regardless of payment status)
        total_orders = db.query(func.count(Order.id)).filter(
            Order.user_id == customer.id
        ).scalar() or 0

        # Get total spent (only completed payments)
        total_spent = db.query(func.coalesce(func.sum(Order.total), 0)).filter(
            and_(
                Order.user_id == customer.id,
                Order.payment_status == PaymentStatus.COMPLETED
            )
        ).scalar() or 0

        # Get last order date
        last_order = db.query(Order.created_at).filter(
            Order.user_id == customer.id
        ).order_by(desc(Order.created_at)).first()

        result.append({
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "picture": customer.picture,
            "is_active": customer.is_active,
            "total_orders": total_orders,
            "total_spent": round(total_spent, 2),
            "last_order_date": last_order[0] if last_order else None,
            "created_at": customer.created_at
        })

    # Sort by total_spent or total_orders if requested
    if sort_by in ["total_spent", "total_orders"]:
        result = sorted(
            result,
            key=lambda x: x[sort_by],
            reverse=(sort_order == "desc")
        )

    return {
        "customers": result,
        "total": total,
        "page": page,
        "pages": math.ceil(total / limit)
    }

@router.get("/customers/{customer_id}")
async def get_customer_detail(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get detailed customer information"""

    customer = db.query(User).filter(
        and_(User.id == customer_id, User.role == UserRole.USER)
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Get total orders (all orders)
    total_orders = db.query(func.count(Order.id)).filter(
        Order.user_id == customer.id
    ).scalar() or 0

    # Get total spent (only completed payments)
    total_spent = db.query(func.coalesce(func.sum(Order.total), 0)).filter(
        and_(
            Order.user_id == customer.id,
            Order.payment_status == PaymentStatus.COMPLETED
        )
    ).scalar() or 0

    # Get recent orders
    recent_orders = db.query(Order).filter(
        Order.user_id == customer.id
    ).order_by(desc(Order.created_at)).limit(5).all()

    # Get addresses
    addresses = db.query(Address).filter(Address.user_id == customer.id).all()

    return {
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone,
        "picture": customer.picture,
        "is_active": customer.is_active,
        "created_at": customer.created_at,
        "total_orders": total_orders,
        "total_spent": round(total_spent, 2),
        "addresses": [
            {
                "id": addr.id,
                "name": addr.name,
                "phone": addr.phone,
                "address": addr.address,
                "area": addr.area,
                "city": addr.city,
                "is_default": addr.is_default
            }
            for addr in addresses
        ],
        "recent_orders": [
            {
                "id": order.id,
                "order_number": order.order_number,
                "total": order.total,
                "status": order.status,
                "payment_status": order.payment_status,
                "created_at": order.created_at
            }
            for order in recent_orders
        ]
    }

@router.get("/customers/{customer_id}/orders")
async def get_customer_orders(
    customer_id: int,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all orders for a specific customer"""

    customer = db.query(User).filter(
        and_(User.id == customer_id, User.role == UserRole.USER)
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Get orders with pagination
    query = db.query(Order).filter(Order.user_id == customer_id)
    total = query.count()
    orders = query.order_by(desc(Order.created_at)).offset((page - 1) * limit).limit(limit).all()

    result = []
    for order in orders:
        # Get order items
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()

        order_items = []
        for item in items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            image = db.query(ProductImage).filter(
                and_(ProductImage.product_id == item.product_id, ProductImage.is_primary == True)
            ).first() if product else None

            order_items.append({
                "id": item.id,
                "product_id": item.product_id,
                "product_name": product.name if product else "Unknown Product",
                "product_image": image.url if image else None,
                "quantity": item.quantity,
                "price": item.price,
                "total": item.total
            })

        result.append({
            "id": order.id,
            "order_number": order.order_number,
            "status": order.status,
            "payment_status": order.payment_status,
            "payment_method": order.payment_method,
            "subtotal": order.subtotal,
            "shipping_cost": order.shipping_cost,
            "total": order.total,
            "shipping_name": order.shipping_name,
            "shipping_phone": order.shipping_phone,
            "shipping_address": order.shipping_address,
            "shipping_area": order.shipping_area,
            "shipping_city": order.shipping_city,
            "notes": order.notes,
            "created_at": order.created_at,
            "items": order_items
        })

    return {
        "orders": result,
        "total": total,
        "page": page,
        "pages": math.ceil(total / limit)
    }


@router.put("/customers/{customer_id}/status")
async def update_customer_status(
    customer_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Activate or deactivate a customer account"""

    customer = db.query(User).filter(
        and_(User.id == customer_id, User.role == UserRole.USER)
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer.is_active = is_active
    db.commit()

    return {
        "message": f"Customer {'activated' if is_active else 'deactivated'} successfully",
        "is_active": is_active
    }
