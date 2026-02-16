from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

# --- Enums ---
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, Enum):
    BKASH = "bkash"
    CARD = "card"
    COD = "cod"

# --- User Schemas ---
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    picture: Optional[str] = None
    is_custom_picture: bool = False

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class SocialLoginRequest(BaseModel):
    provider: str  # "google" or "facebook"
    token: str     # id_token for Google, access_token for Facebook

class TokenWithUser(BaseModel):
    token: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

# --- Address Schemas ---
class AddressBase(BaseModel):
    name: str
    phone: str
    address: str
    area: Optional[str] = None
    city: str
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressResponse(AddressBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    parent_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    is_active: bool
    product_count: int = 0

    model_config = ConfigDict(from_attributes=True)

# --- Product Schemas ---
class ProductImageBase(BaseModel):
    url: str
    is_primary: bool = False
    sort_order: int = 0

class ProductImageResponse(ProductImageBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    original_price: Optional[float] = None
    discount: int = 0
    stock: int = 0
    category_id: int
    brand: Optional[str] = None
    sku: Optional[str] = None
    is_featured: bool = False
    is_new: bool = False

class ProductCreate(ProductBase):
    slug: str
    images: Optional[List[ProductImageBase]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    discount: Optional[int] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    brand: Optional[str] = None
    is_featured: Optional[bool] = None
    is_new: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    slug: str
    is_active: bool
    rating: float
    review_count: int
    created_at: datetime
    images: List[ProductImageResponse] = []
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)

class ProductListResponse(BaseModel):
    id: int
    name: str
    slug: str
    price: float
    original_price: Optional[float] = None
    discount: int = 0
    stock: int
    category_id: int
    brand: Optional[str] = None
    is_featured: bool = False
    is_new: bool = False
    rating: float = 0
    review_count: int = 0
    image: Optional[str] = None
    category: Optional[str] = Field(None, validation_alias='category_name')

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# --- Order Schemas ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    total: float
    product: Optional[ProductListResponse] = None

    model_config = ConfigDict(from_attributes=True)

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    payment_method: PaymentMethod
    shipping_name: str
    shipping_phone: str
    shipping_email: Optional[str] = None
    shipping_address: str
    shipping_area: Optional[str] = None
    shipping_city: str
    notes: Optional[str] = None
    voucher_code: Optional[str] = None  # For applying voucher discount

class OrderTrackingResponse(BaseModel):
    id: int
    status: str
    description: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: int
    status: str
    payment_status: str
    payment_method: Optional[str] = None
    subtotal: float
    shipping_cost: float
    total: float
    voucher_code: Optional[str] = None
    voucher_discount: float = 0
    shipping_name: str
    shipping_phone: str
    shipping_email: Optional[str] = None
    shipping_address: str
    shipping_area: Optional[str] = None
    shipping_city: str
    notes: Optional[str] = None
    created_at: datetime
    courier_name: Optional[str] = None
    courier_tracking_id: Optional[str] = None
    items: List[OrderItemResponse] = []
    tracking: List[OrderTrackingResponse] = []  # Added tracking

    model_config = ConfigDict(from_attributes=True)

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    description: Optional[str] = None

class CourierAssign(BaseModel):
    courier_name: str # pathao, steadfast

# --- Payment Schemas ---
class PaymentCreate(BaseModel):
    order_id: int
    payment_method: PaymentMethod

class BkashPaymentCreate(BaseModel):
    order_id: int
    phone_number: str

class PaymentResponse(BaseModel):
    id: int
    order_id: int
    payment_method: str
    amount: float
    transaction_id: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Review Schemas ---
class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    rating: int
    comment: Optional[str] = None
    is_verified: bool
    created_at: datetime
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)

# --- Wishlist Schemas ---
class WishlistItemCreate(BaseModel):
    product_id: int

class WishlistItemResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    created_at: datetime
    product: Optional[ProductListResponse] = None

    model_config = ConfigDict(from_attributes=True)

# --- Cart Schemas ---
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    created_at: datetime
    product: Optional[ProductListResponse] = None

    model_config = ConfigDict(from_attributes=True)

class CartResponse(BaseModel):
    items: List[CartItemResponse]
    subtotal: float
    item_count: int


# --- Flash Sale Schemas ---
class DiscountType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"


class FlashSaleItemBase(BaseModel):
    product_id: int
    flash_price: float = Field(..., gt=0)
    flash_stock: int = Field(..., ge=0)
    sort_order: int = 0


class FlashSaleItemCreate(FlashSaleItemBase):
    pass


class FlashSaleItemResponse(FlashSaleItemBase):
    id: int
    sold_count: int = 0
    product: Optional[ProductListResponse] = None

    model_config = ConfigDict(from_attributes=True)


class FlashSaleBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    banner_image: Optional[str] = None


class FlashSaleCreate(FlashSaleBase):
    items: List[FlashSaleItemCreate] = []


class FlashSaleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    banner_image: Optional[str] = None
    is_active: Optional[bool] = None


class FlashSaleResponse(FlashSaleBase):
    id: int
    is_active: bool
    created_at: datetime
    items: List[FlashSaleItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


class FlashSaleListResponse(BaseModel):
    id: int
    name: str
    slug: str
    start_time: datetime
    end_time: datetime
    banner_image: Optional[str] = None
    is_active: bool
    item_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# --- Voucher Schemas ---
class VoucherBase(BaseModel):
    code: str = Field(..., min_length=3, max_length=50)
    name: str
    description: Optional[str] = None
    discount_type: DiscountType
    discount_value: float = Field(..., gt=0)
    min_order_amount: float = 0
    max_discount_amount: Optional[float] = None
    usage_limit: Optional[int] = None
    per_user_limit: int = 1
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class VoucherCreate(VoucherBase):
    pass


class VoucherUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[float] = None
    min_order_amount: Optional[float] = None
    max_discount_amount: Optional[float] = None
    usage_limit: Optional[int] = None
    per_user_limit: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class VoucherResponse(VoucherBase):
    id: int
    usage_count: int = 0
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VoucherValidateRequest(BaseModel):
    code: str
    subtotal: float = Field(..., ge=0)


class VoucherValidateResponse(BaseModel):
    valid: bool
    voucher: Optional[VoucherResponse] = None
    discount_amount: float = 0
    message: str


# --- Product Specification Schemas ---
class ProductSpecificationBase(BaseModel):
    spec_group: str
    spec_name: str
    spec_value: str
    sort_order: int = 0


class ProductSpecificationCreate(ProductSpecificationBase):
    pass


class ProductSpecificationResponse(ProductSpecificationBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ProductSpecificationsUpdate(BaseModel):
    specifications: List[ProductSpecificationCreate]


# --- Product Accessory Schemas ---
class ProductAccessoryCreate(BaseModel):
    accessory_id: int
    sort_order: int = 0


class ProductAccessoryResponse(BaseModel):
    id: int
    accessory: ProductListResponse
    sort_order: int = 0

    model_config = ConfigDict(from_attributes=True)


# --- Product Comparison Schema ---
class ProductCompareRequest(BaseModel):
    product_ids: List[int] = Field(..., min_length=2, max_length=4)


class ProductCompareResponse(BaseModel):
    products: List[ProductResponse]
    specifications: dict  # Grouped specifications for comparison


# --- Pagination ---
class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int

class OrderListResponse(PaginatedResponse):
    items: List[OrderResponse]


# ============================================
# NEWSLETTER SCHEMAS
# ============================================

class NewsletterSubscribe(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    source: str = "footer"


class NewsletterUnsubscribe(BaseModel):
    email: EmailStr


class NewsletterSubscriberResponse(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    is_active: bool
    subscribed_at: datetime
    source: str

    model_config = ConfigDict(from_attributes=True)


# ============================================
# RECENTLY VIEWED SCHEMAS
# ============================================

class RecentlyViewedCreate(BaseModel):
    product_id: int
    session_id: Optional[str] = None


class RecentlyViewedResponse(BaseModel):
    id: int
    product_id: int
    viewed_at: datetime
    product: Optional[ProductListResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================
# STOCK NOTIFICATION SCHEMAS
# ============================================

class StockNotificationCreate(BaseModel):
    product_id: int
    email: Optional[EmailStr] = None  # Optional if user is logged in


class StockNotificationResponse(BaseModel):
    id: int
    email: str
    product_id: int
    is_notified: bool
    created_at: datetime
    product: Optional[ProductListResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================
# LOYALTY POINTS SCHEMAS
# ============================================

class PointsSettingsResponse(BaseModel):
    id: int
    points_per_taka: float
    taka_per_point: float
    min_redeem_points: int
    max_redeem_percentage: float
    points_expiry_days: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class PointsSettingsUpdate(BaseModel):
    points_per_taka: Optional[float] = None
    taka_per_point: Optional[float] = None
    min_redeem_points: Optional[int] = None
    max_redeem_percentage: Optional[float] = None
    points_expiry_days: Optional[int] = None
    is_active: Optional[bool] = None


class PointsTransactionResponse(BaseModel):
    id: int
    points: int
    transaction_type: str
    description: Optional[str] = None
    expires_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PointsBalanceResponse(BaseModel):
    balance: int
    pending_expiry: int  # Points expiring within 30 days
    next_expiry_date: Optional[datetime] = None


class PointsRedeemRequest(BaseModel):
    points: int = Field(..., gt=0)
    order_subtotal: float = Field(..., gt=0)


class PointsRedeemResponse(BaseModel):
    points_used: int
    discount_amount: float
    remaining_balance: int


# ============================================
# REFERRAL SCHEMAS
# ============================================

class ReferralInvite(BaseModel):
    email: EmailStr


class ReferralCodeResponse(BaseModel):
    referral_code: str
    referral_url: str


class ReferralStatsResponse(BaseModel):
    total_referrals: int
    successful_referrals: int
    pending_referrals: int
    total_points_earned: int


class ReferralResponse(BaseModel):
    id: int
    referred_email: str
    status: str
    referrer_reward_points: int
    referred_reward_points: int
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================
# PRODUCT BUNDLE SCHEMAS
# ============================================

class ProductBundleItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class ProductBundleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: Optional[ProductListResponse] = None

    model_config = ConfigDict(from_attributes=True)


class ProductBundleCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    bundle_price: float = Field(..., gt=0)
    savings_text: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    items: List[ProductBundleItemCreate] = []


class ProductBundleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    bundle_price: Optional[float] = None
    savings_text: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class ProductBundleResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    bundle_price: float
    savings_text: Optional[str] = None
    image: Optional[str] = None
    is_active: bool
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime
    items: List[ProductBundleItemResponse] = []
    original_total: float = 0  # Sum of individual product prices

    model_config = ConfigDict(from_attributes=True)


# ============================================
# GIFT CARD SCHEMAS
# ============================================

class GiftCardPurchase(BaseModel):
    amount: float = Field(..., ge=100, le=50000)  # 100-50000 BDT
    recipient_email: Optional[EmailStr] = None
    recipient_name: Optional[str] = None
    personal_message: Optional[str] = None


class GiftCardCheck(BaseModel):
    code: str


class GiftCardRedeem(BaseModel):
    code: str
    amount: Optional[float] = None  # If not provided, use full balance


class GiftCardResponse(BaseModel):
    id: int
    code: str
    initial_balance: float
    current_balance: float
    recipient_email: Optional[str] = None
    recipient_name: Optional[str] = None
    is_active: bool
    expires_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GiftCardTransactionResponse(BaseModel):
    id: int
    amount: float
    transaction_type: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================
# PUSH NOTIFICATION SCHEMAS
# ============================================

class PushSubscriptionCreate(BaseModel):
    endpoint: str
    p256dh_key: str
    auth_key: str


class PushSubscriptionResponse(BaseModel):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================
# PRODUCT Q&A SCHEMAS
# ============================================

class ProductQuestionCreate(BaseModel):
    question: str = Field(..., min_length=10, max_length=500)


class ProductAnswerCreate(BaseModel):
    answer: str = Field(..., min_length=5, max_length=1000)


class ProductAnswerResponse(BaseModel):
    id: int
    answer: str
    is_admin_answer: bool
    helpful_count: int
    created_at: datetime
    user_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProductQuestionResponse(BaseModel):
    id: int
    product_id: int
    question: str
    is_answered: bool
    created_at: datetime
    user_name: Optional[str] = None
    answers: List[ProductAnswerResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ============================================
# PRODUCT VARIANT SCHEMAS
# ============================================

class ProductVariantTypeCreate(BaseModel):
    name: str
    display_type: str = "dropdown"  # dropdown, color_swatch, button


class ProductVariantTypeResponse(BaseModel):
    id: int
    name: str
    display_type: str

    model_config = ConfigDict(from_attributes=True)


class ProductVariantAttributeCreate(BaseModel):
    variant_type_id: int
    value: str


class ProductVariantAttributeResponse(BaseModel):
    id: int
    variant_type_id: int
    value: str
    variant_type: Optional[ProductVariantTypeResponse] = None

    model_config = ConfigDict(from_attributes=True)


class ProductVariantCreate(BaseModel):
    sku: str
    price: Optional[float] = None
    stock: int = 0
    attributes: List[ProductVariantAttributeCreate] = []


class ProductVariantResponse(BaseModel):
    id: int
    product_id: int
    sku: str
    price: Optional[float] = None
    stock: int
    is_active: bool
    attribute_values: List[ProductVariantAttributeResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ============================================
# EXPORT SCHEMAS
# ============================================

class ExportRequest(BaseModel):
    format: str = "csv"  # csv or xlsx
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


# ============================================
# CUSTOMER INSIGHTS SCHEMAS
# ============================================

class CustomerSegment(BaseModel):
    name: str
    count: int
    percentage: float


class CustomerInsightsResponse(BaseModel):
    total_customers: int
    new_customers_30d: int
    repeat_purchase_rate: float
    average_order_value: float
    customer_lifetime_value: float
    segments: List[CustomerSegment]


# ============================================
# VISITOR ANALYTICS SCHEMAS
# ============================================

class PageViewCreate(BaseModel):
    """Schema for tracking a page view from the client"""
    page_path: str
    page_title: Optional[str] = None
    referrer: Optional[str] = None
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None

    # UTM parameters
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None


class TrafficSourceBreakdown(BaseModel):
    source: str
    count: int
    percentage: float


class GeographicBreakdown(BaseModel):
    country_code: str
    country_name: str
    count: int
    percentage: float


class DeviceBreakdown(BaseModel):
    device_type: str
    count: int
    percentage: float


class BrowserBreakdown(BaseModel):
    browser: str
    count: int
    percentage: float


class PageBreakdown(BaseModel):
    page_path: str
    page_title: Optional[str] = None
    views: int
    unique_visitors: int


class VisitorTrendPoint(BaseModel):
    date: str
    page_views: int
    unique_visitors: int
    sessions: int


class VisitorAnalyticsSummary(BaseModel):
    """Summary stats for the analytics dashboard"""
    total_page_views: int
    unique_visitors: int
    total_sessions: int
    avg_session_duration: float
    avg_pages_per_session: float
    bounce_rate: float

    # Change percentages vs previous period
    page_views_change: float
    visitors_change: float
    sessions_change: float


class VisitorAnalyticsResponse(BaseModel):
    """Full analytics response for admin dashboard"""
    summary: VisitorAnalyticsSummary
    traffic_sources: List[TrafficSourceBreakdown]
    geographic: List[GeographicBreakdown]
    devices: List[DeviceBreakdown]
    browsers: List[BrowserBreakdown]
    top_pages: List[PageBreakdown]
    trends: List[VisitorTrendPoint]


class RealTimeVisitors(BaseModel):
    """Real-time active visitors count"""
    active_visitors: int
    active_sessions: int
    top_pages: List[dict]
