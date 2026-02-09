from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    DELIVERY = "delivery"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, enum.Enum):
    BKASH = "bkash"
    CARD = "card"
    COD = "cod"

# User Model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Password Reset
    reset_token = Column(String(100), nullable=True)
    reset_token_expiry = Column(DateTime(timezone=True), nullable=True)
    
    # Social Login
    google_id = Column(String(100), nullable=True, unique=True)
    facebook_id = Column(String(100), nullable=True, unique=True)
    picture = Column(String(255), nullable=True)
    is_custom_picture = Column(Boolean, default=False)
    
    addresses = relationship("Address", back_populates="user")
    orders = relationship("Order", back_populates="user", foreign_keys="Order.user_id")
    # orders_to_deliver = relationship("Order", back_populates="delivery_man", foreign_keys="Order.delivery_man_id")
    reviews = relationship("Review", back_populates="user")
    wishlist_items = relationship("WishlistItem", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")

# Address Model
class Address(Base):
    __tablename__ = "addresses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    address = Column(String(255), nullable=False)
    area = Column(String(100), nullable=True)
    city = Column(String(100), nullable=False)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="addresses")

# Category Model
class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image = Column(String(255), nullable=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    products = relationship("Product", back_populates="category")
    parent = relationship("Category", remote_side=[id])

# Product Model
class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    discount = Column(Integer, default=0)
    stock = Column(Integer, default=0)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    brand = Column(String(100), nullable=True)
    sku = Column(String(50), unique=True, nullable=True)
    is_featured = Column(Boolean, default=False)
    is_new = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product")
    reviews = relationship("Review", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    wishlist_items = relationship("WishlistItem", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")

    @property
    def image(self):
        if self.images:
            for img in self.images:
                if img.is_primary:
                    return img.url
            return self.images[0].url
        return None

    @property
    def category_name(self):
        """Return category name as string for serialization"""
        return self.category.name if self.category else None

# Product Image Model
class ProductImage(Base):
    __tablename__ = "product_images"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    url = Column(String(255), nullable=False)
    is_primary = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    
    product = relationship("Product", back_populates="images")

# Order Model
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Courier / Third-party Delivery info
    courier_name = Column(String(50), nullable=True) # e.g. "steadfast", "pathao"
    courier_tracking_id = Column(String(100), nullable=True) # Consignment ID

    status = Column(String(20), default=OrderStatus.PENDING)
    payment_status = Column(String(20), default=PaymentStatus.PENDING)
    payment_method = Column(String(20), nullable=True)
    subtotal = Column(Float, nullable=False)
    shipping_cost = Column(Float, default=0)
    total = Column(Float, nullable=False)

    # Voucher fields
    voucher_id = Column(Integer, ForeignKey("vouchers.id"), nullable=True)
    voucher_code = Column(String(50), nullable=True)
    voucher_discount = Column(Float, default=0)
    
    # Shipping info
    shipping_name = Column(String(100), nullable=False)
    shipping_phone = Column(String(20), nullable=False)
    shipping_email = Column(String(100), nullable=True)
    shipping_address = Column(String(255), nullable=False)
    shipping_area = Column(String(100), nullable=True)
    shipping_city = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", foreign_keys=[user_id], back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    payment = relationship("Payment", back_populates="order", uselist=False)
    tracking = relationship("OrderTracking", back_populates="order", order_by="desc(OrderTracking.created_at)")

# Order Tracking Model
class OrderTracking(Base):
    __tablename__ = "order_tracking"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    status = Column(String(50), nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    order = relationship("Order", back_populates="tracking")

# Order Item Model
class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

# Payment Model
class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    payment_method = Column(String(20), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_id = Column(String(100), nullable=True)
    status = Column(String(20), default=PaymentStatus.PENDING)
    payment_data = Column(Text, nullable=True)  # JSON data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    order = relationship("Order", back_populates="payment")

# Review Model
class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")

# Wishlist Item Model
class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_items")

# Cart Item Model
class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")


# ============================================
# FLASH SALE MODELS
# ============================================

class FlashSale(Base):
    __tablename__ = "flash_sales"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    banner_image = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("FlashSaleItem", back_populates="flash_sale", cascade="all, delete-orphan")


class FlashSaleItem(Base):
    __tablename__ = "flash_sale_items"

    id = Column(Integer, primary_key=True, index=True)
    flash_sale_id = Column(Integer, ForeignKey("flash_sales.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    flash_price = Column(Float, nullable=False)
    flash_stock = Column(Integer, nullable=False)
    sold_count = Column(Integer, default=0)
    sort_order = Column(Integer, default=0)

    flash_sale = relationship("FlashSale", back_populates="items")
    product = relationship("Product")


# ============================================
# VOUCHER MODELS
# ============================================

class DiscountType(str, enum.Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"


class Voucher(Base):
    __tablename__ = "vouchers"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    discount_type = Column(String(20), nullable=False)  # percentage or fixed
    discount_value = Column(Float, nullable=False)
    min_order_amount = Column(Float, default=0)
    max_discount_amount = Column(Float, nullable=True)  # Cap for percentage discounts
    usage_limit = Column(Integer, nullable=True)  # Total times voucher can be used
    usage_count = Column(Integer, default=0)
    per_user_limit = Column(Integer, default=1)  # Times per user
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    usages = relationship("VoucherUsage", back_populates="voucher")


class VoucherUsage(Base):
    __tablename__ = "voucher_usages"

    id = Column(Integer, primary_key=True, index=True)
    voucher_id = Column(Integer, ForeignKey("vouchers.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    used_at = Column(DateTime(timezone=True), server_default=func.now())

    voucher = relationship("Voucher", back_populates="usages")
    user = relationship("User")
    order = relationship("Order")


# ============================================
# PRODUCT ACCESSORY MODEL
# ============================================

class ProductAccessory(Base):
    __tablename__ = "product_accessories"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    accessory_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    sort_order = Column(Integer, default=0)

    product = relationship("Product", foreign_keys=[product_id], backref="accessory_links")
    accessory = relationship("Product", foreign_keys=[accessory_id])


# ============================================
# PRODUCT SPECIFICATION MODEL
# ============================================

class ProductSpecification(Base):
    __tablename__ = "product_specifications"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    spec_group = Column(String(100), nullable=False)  # e.g., "Display", "Performance"
    spec_name = Column(String(100), nullable=False)   # e.g., "Screen Size", "RAM"
    spec_value = Column(String(255), nullable=False)  # e.g., "6.1 inches", "8GB"
    sort_order = Column(Integer, default=0)

    product = relationship("Product", backref="specifications")
