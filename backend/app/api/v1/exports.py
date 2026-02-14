from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import csv
import io
from app.database import get_db
from app.models import Order, Product, User, Category, OrderItem
from app.utils import get_current_admin

router = APIRouter(prefix="/admin/exports", tags=["Export Reports"])


def generate_csv(data: list, headers: list) -> io.StringIO:
    """Generate CSV content"""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)

    for row in data:
        writer.writerow(row)

    output.seek(0)
    return output


@router.get("/orders")
async def export_orders(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    status_filter: Optional[str] = None,
    format: str = "csv",
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Export orders to CSV/Excel"""
    query = db.query(Order)

    if start_date:
        query = query.filter(Order.created_at >= start_date)
    if end_date:
        query = query.filter(Order.created_at <= end_date)
    if status_filter:
        query = query.filter(Order.status == status_filter)

    orders = query.order_by(Order.created_at.desc()).all()

    headers = [
        "Order Number", "Date", "Customer", "Email", "Phone",
        "Status", "Payment Status", "Payment Method",
        "Subtotal", "Shipping", "Voucher Discount", "Total",
        "Shipping Address", "City", "Notes"
    ]

    data = []
    for order in orders:
        data.append([
            order.order_number,
            order.created_at.strftime("%Y-%m-%d %H:%M"),
            order.shipping_name,
            order.shipping_email or "",
            order.shipping_phone,
            order.status,
            order.payment_status,
            order.payment_method or "",
            order.subtotal,
            order.shipping_cost,
            order.voucher_discount,
            order.total,
            order.shipping_address,
            order.shipping_city,
            order.notes or ""
        ])

    csv_content = generate_csv(data, headers)

    return StreamingResponse(
        iter([csv_content.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=orders_{datetime.now().strftime('%Y%m%d')}.csv"}
    )


@router.get("/products")
async def export_products(
    category_id: Optional[int] = None,
    in_stock: Optional[bool] = None,
    format: str = "csv",
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Export products to CSV"""
    query = db.query(Product)

    if category_id:
        query = query.filter(Product.category_id == category_id)
    if in_stock is True:
        query = query.filter(Product.stock > 0)
    elif in_stock is False:
        query = query.filter(Product.stock == 0)

    products = query.all()

    headers = [
        "ID", "Name", "SKU", "Category", "Brand",
        "Price", "Original Price", "Discount %",
        "Stock", "Rating", "Reviews",
        "Featured", "New", "Active"
    ]

    data = []
    for product in products:
        category = db.query(Category).filter(Category.id == product.category_id).first()
        data.append([
            product.id,
            product.name,
            product.sku or "",
            category.name if category else "",
            product.brand or "",
            product.price,
            product.original_price or "",
            product.discount,
            product.stock,
            product.rating,
            product.review_count,
            "Yes" if product.is_featured else "No",
            "Yes" if product.is_new else "No",
            "Yes" if product.is_active else "No"
        ])

    csv_content = generate_csv(data, headers)

    return StreamingResponse(
        iter([csv_content.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=products_{datetime.now().strftime('%Y%m%d')}.csv"}
    )


@router.get("/customers")
async def export_customers(
    is_active: Optional[bool] = None,
    format: str = "csv",
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Export customers to CSV"""
    from sqlalchemy import func

    query = db.query(User).filter(User.role == "user")

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    customers = query.all()

    headers = [
        "ID", "Name", "Email", "Phone",
        "Total Orders", "Total Spent", "Points Balance",
        "Registered Date", "Active"
    ]

    data = []
    for customer in customers:
        # Calculate stats
        order_stats = db.query(
            func.count(Order.id).label("count"),
            func.sum(Order.total).label("total")
        ).filter(
            Order.user_id == customer.id,
            Order.status != "cancelled"
        ).first()

        data.append([
            customer.id,
            customer.name,
            customer.email,
            customer.phone or "",
            order_stats.count or 0,
            order_stats.total or 0,
            customer.points_balance,
            customer.created_at.strftime("%Y-%m-%d"),
            "Yes" if customer.is_active else "No"
        ])

    csv_content = generate_csv(data, headers)

    return StreamingResponse(
        iter([csv_content.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=customers_{datetime.now().strftime('%Y%m%d')}.csv"}
    )


@router.get("/inventory")
async def export_inventory(
    low_stock_only: bool = False,
    format: str = "csv",
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Export inventory report to CSV"""
    query = db.query(Product).filter(Product.is_active == True)

    if low_stock_only:
        query = query.filter(Product.stock <= 10)

    products = query.order_by(Product.stock.asc()).all()

    headers = [
        "ID", "Name", "SKU", "Category",
        "Current Stock", "Status", "Price", "Value"
    ]

    data = []
    for product in products:
        category = db.query(Category).filter(Category.id == product.category_id).first()

        status = "In Stock"
        if product.stock == 0:
            status = "Out of Stock"
        elif product.stock <= 5:
            status = "Critical Low"
        elif product.stock <= 10:
            status = "Low Stock"

        data.append([
            product.id,
            product.name,
            product.sku or "",
            category.name if category else "",
            product.stock,
            status,
            product.price,
            product.price * product.stock
        ])

    csv_content = generate_csv(data, headers)

    return StreamingResponse(
        iter([csv_content.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=inventory_{datetime.now().strftime('%Y%m%d')}.csv"}
    )


@router.get("/sales-report")
async def export_sales_report(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    format: str = "csv",
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Export sales report by product"""
    from sqlalchemy import func

    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()

    # Get sales data grouped by product
    sales_data = db.query(
        Product.id,
        Product.name,
        Product.sku,
        func.sum(OrderItem.quantity).label("units_sold"),
        func.sum(OrderItem.total).label("revenue")
    ).join(
        OrderItem, Product.id == OrderItem.product_id
    ).join(
        Order, OrderItem.order_id == Order.id
    ).filter(
        Order.created_at >= start_date,
        Order.created_at <= end_date,
        Order.status.in_(["confirmed", "processing", "shipped", "delivered"])
    ).group_by(
        Product.id
    ).order_by(
        func.sum(OrderItem.total).desc()
    ).all()

    headers = [
        "Product ID", "Product Name", "SKU",
        "Units Sold", "Revenue", "Avg Price"
    ]

    data = []
    for item in sales_data:
        avg_price = item.revenue / item.units_sold if item.units_sold > 0 else 0
        data.append([
            item.id,
            item.name,
            item.sku or "",
            item.units_sold,
            round(item.revenue, 2),
            round(avg_price, 2)
        ])

    csv_content = generate_csv(data, headers)

    return StreamingResponse(
        iter([csv_content.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=sales_report_{datetime.now().strftime('%Y%m%d')}.csv"}
    )
