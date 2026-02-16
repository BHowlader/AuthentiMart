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

    # Loyalty Points
    points_balance = Column(Integer, default=0)

    # Referral Program
    referral_code = Column(String(20), unique=True, nullable=True)
    referred_by = Column(Integer, ForeignKey("users.id"), nullable=True)

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

    # Gift Card fields
    gift_card_id = Column(Integer, ForeignKey("gift_cards.id"), nullable=True)
    gift_card_amount = Column(Float, default=0)

    # Points redemption
    points_redeemed = Column(Integer, default=0)
    points_discount = Column(Float, default=0)

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


# ============================================
# EMAIL & NEWSLETTER MODELS
# ============================================

class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)
    recipient_email = Column(String(100), nullable=False)
    email_type = Column(String(50), nullable=False)  # order_confirmation, password_reset, etc.
    subject = Column(String(255), nullable=False)
    status = Column(String(20), default="pending")  # pending, sent, failed
    error_message = Column(Text, nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    subscribed_at = Column(DateTime(timezone=True), server_default=func.now())
    unsubscribed_at = Column(DateTime(timezone=True), nullable=True)
    source = Column(String(50), default="footer")  # footer, popup, checkout

    user = relationship("User")


# ============================================
# RECENTLY VIEWED & RECOMMENDATIONS
# ============================================

class RecentlyViewed(Base):
    __tablename__ = "recently_viewed"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), nullable=True, index=True)  # For anonymous users
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    product = relationship("Product")


class ProductRelation(Base):
    __tablename__ = "product_relations"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    related_product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    relation_type = Column(String(50), nullable=False)  # similar, frequently_bought, viewed_together
    score = Column(Float, default=1.0)  # Relevance score
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", foreign_keys=[product_id])
    related_product = relationship("Product", foreign_keys=[related_product_id])


class StockNotification(Base):
    __tablename__ = "stock_notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    email = Column(String(100), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    is_notified = Column(Boolean, default=False)
    notified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    product = relationship("Product")


# ============================================
# LOYALTY POINTS SYSTEM
# ============================================

class PointsSettings(Base):
    __tablename__ = "points_settings"

    id = Column(Integer, primary_key=True, index=True)
    points_per_taka = Column(Float, default=0.01)  # 1 point per 100 BDT
    taka_per_point = Column(Float, default=1.0)    # 1 point = 1 BDT discount
    min_redeem_points = Column(Integer, default=100)
    max_redeem_percentage = Column(Float, default=0.5)  # Max 50% of order
    points_expiry_days = Column(Integer, default=365)
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PointsTransaction(Base):
    __tablename__ = "points_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    points = Column(Integer, nullable=False)  # Positive = earned, Negative = redeemed
    transaction_type = Column(String(50), nullable=False)  # order_earned, order_redeemed, referral, bonus, expired
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    description = Column(String(255), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    order = relationship("Order")


# ============================================
# REFERRAL PROGRAM
# ============================================

class Referral(Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    referred_email = Column(String(100), nullable=False)
    referred_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    referral_code = Column(String(20), unique=True, index=True, nullable=False)
    status = Column(String(20), default="pending")  # pending, registered, completed, rewarded
    referrer_reward_points = Column(Integer, default=0)
    referred_reward_points = Column(Integer, default=0)
    first_order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    referrer = relationship("User", foreign_keys=[referrer_id])
    referred_user = relationship("User", foreign_keys=[referred_user_id])
    first_order = relationship("Order")


# ============================================
# PRODUCT BUNDLES
# ============================================

class ProductBundle(Base):
    __tablename__ = "product_bundles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    bundle_price = Column(Float, nullable=False)  # Special bundle price
    savings_text = Column(String(100), nullable=True)  # "Save 20%"
    image = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("ProductBundleItem", back_populates="bundle", cascade="all, delete-orphan")


class ProductBundleItem(Base):
    __tablename__ = "product_bundle_items"

    id = Column(Integer, primary_key=True, index=True)
    bundle_id = Column(Integer, ForeignKey("product_bundles.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)

    bundle = relationship("ProductBundle", back_populates="items")
    product = relationship("Product")


# ============================================
# GIFT CARDS
# ============================================

class GiftCard(Base):
    __tablename__ = "gift_cards"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False)
    initial_balance = Column(Float, nullable=False)
    current_balance = Column(Float, nullable=False)
    purchaser_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    recipient_email = Column(String(100), nullable=True)
    recipient_name = Column(String(100), nullable=True)
    personal_message = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    purchaser = relationship("User")
    transactions = relationship("GiftCardTransaction", back_populates="gift_card")


class GiftCardTransaction(Base):
    __tablename__ = "gift_card_transactions"

    id = Column(Integer, primary_key=True, index=True)
    gift_card_id = Column(Integer, ForeignKey("gift_cards.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    amount = Column(Float, nullable=False)  # Positive = purchase/refund, Negative = redemption
    transaction_type = Column(String(20), nullable=False)  # purchase, redeem, refund
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    gift_card = relationship("GiftCard", back_populates="transactions")
    order = relationship("Order")


# ============================================
# ABANDONED CART RECOVERY
# ============================================

class AbandonedCartEmail(Base):
    __tablename__ = "abandoned_cart_emails"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cart_snapshot = Column(Text, nullable=False)  # JSON of cart items
    cart_total = Column(Float, nullable=False)
    email_sequence = Column(Integer, default=1)  # 1st, 2nd, 3rd reminder
    sent_at = Column(DateTime(timezone=True), nullable=True)
    opened_at = Column(DateTime(timezone=True), nullable=True)
    clicked_at = Column(DateTime(timezone=True), nullable=True)
    converted = Column(Boolean, default=False)
    conversion_order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    conversion_order = relationship("Order")


# ============================================
# PUSH NOTIFICATIONS
# ============================================

class PushSubscription(Base):
    __tablename__ = "push_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    endpoint = Column(Text, nullable=False)
    p256dh_key = Column(Text, nullable=False)
    auth_key = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


# ============================================
# PRODUCT Q&A
# ============================================

class ProductQuestion(Base):
    __tablename__ = "product_questions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=False)
    is_answered = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product")
    user = relationship("User")
    answers = relationship("ProductAnswer", back_populates="question", cascade="all, delete-orphan")


class ProductAnswer(Base):
    __tablename__ = "product_answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("product_questions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null for admin answers
    answer = Column(Text, nullable=False)
    is_admin_answer = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False)
    helpful_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    question = relationship("ProductQuestion", back_populates="answers")
    user = relationship("User")


# ============================================
# PRODUCT VARIANTS
# ============================================

class ProductVariantType(Base):
    __tablename__ = "product_variant_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)  # Size, Color
    display_type = Column(String(20), default="dropdown")  # dropdown, color_swatch, button


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    sku = Column(String(50), unique=True, nullable=False)
    price = Column(Float, nullable=True)  # Override base price if different
    stock = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    product = relationship("Product", backref="variants")
    attribute_values = relationship("ProductVariantAttribute", back_populates="variant", cascade="all, delete-orphan")


class ProductVariantAttribute(Base):
    __tablename__ = "product_variant_attributes"

    id = Column(Integer, primary_key=True, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=False)
    variant_type_id = Column(Integer, ForeignKey("product_variant_types.id"), nullable=False)
    value = Column(String(100), nullable=False)  # XL, Red, #FF0000

    variant = relationship("ProductVariant", back_populates="attribute_values")
    variant_type = relationship("ProductVariantType")


# ============================================
# VISITOR ANALYTICS
# ============================================

class PageView(Base):
    """Tracks individual page views with anonymized visitor data"""
    __tablename__ = "page_views"

    id = Column(Integer, primary_key=True, index=True)

    # Anonymized visitor identifier (hashed IP + user agent, rotated daily)
    visitor_hash = Column(String(64), index=True, nullable=False)

    # Session tracking (anonymous session ID)
    session_id = Column(String(64), index=True, nullable=False)

    # Page information
    page_path = Column(String(500), nullable=False)
    page_title = Column(String(255), nullable=True)

    # Traffic source (parsed from referrer)
    traffic_source = Column(String(50), default="direct")
    referrer_url = Column(String(500), nullable=True)
    referrer_domain = Column(String(255), nullable=True)

    # UTM parameters (for campaign tracking)
    utm_source = Column(String(100), nullable=True)
    utm_medium = Column(String(100), nullable=True)
    utm_campaign = Column(String(100), nullable=True)

    # Geographic (from IP geolocation - country/city level only)
    country_code = Column(String(2), nullable=True)
    country_name = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)

    # Device & browser (parsed from user agent)
    device_type = Column(String(20), nullable=True)  # desktop, mobile, tablet
    browser = Column(String(50), nullable=True)
    os = Column(String(50), nullable=True)

    # Screen resolution (if provided by client)
    screen_width = Column(Integer, nullable=True)
    screen_height = Column(Integer, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class VisitorSession(Base):
    """Aggregated session data for unique visitors"""
    __tablename__ = "visitor_sessions"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(String(64), unique=True, index=True, nullable=False)
    visitor_hash = Column(String(64), index=True, nullable=False)

    # Session metrics
    page_count = Column(Integer, default=1)
    entry_page = Column(String(500), nullable=True)
    exit_page = Column(String(500), nullable=True)

    # Traffic source for the session
    traffic_source = Column(String(50), default="direct")
    referrer_domain = Column(String(255), nullable=True)

    # Geographic
    country_code = Column(String(2), nullable=True)
    city = Column(String(100), nullable=True)

    # Device info
    device_type = Column(String(20), nullable=True)
    browser = Column(String(50), nullable=True)
    os = Column(String(50), nullable=True)

    # Timestamps
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())

    # Duration in seconds (calculated on session end)
    duration_seconds = Column(Integer, nullable=True)
