from pydantic import BaseModel, EmailStr, Field
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

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

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
    
    class Config:
        from_attributes = True

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
    
    class Config:
        from_attributes = True

# --- Product Schemas ---
class ProductImageBase(BaseModel):
    url: str
    is_primary: bool = False
    sort_order: int = 0

class ProductImageResponse(ProductImageBase):
    id: int
    
    class Config:
        from_attributes = True

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
    
    class Config:
        from_attributes = True

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
    category: Optional[str] = None
    
    class Config:
        from_attributes = True

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
    
    class Config:
        from_attributes = True

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
    shipping_name: str
    shipping_phone: str
    shipping_email: Optional[str] = None
    shipping_address: str
    shipping_area: Optional[str] = None
    shipping_city: str
    notes: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse] = []
    
    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

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
    
    class Config:
        from_attributes = True

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
    
    class Config:
        from_attributes = True

# --- Wishlist Schemas ---
class WishlistItemCreate(BaseModel):
    product_id: int

class WishlistItemResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    created_at: datetime
    product: Optional[ProductListResponse] = None
    
    class Config:
        from_attributes = True

# --- Cart Schemas (handled in frontend, but for API) ---
class CartItem(BaseModel):
    product_id: int
    quantity: int
    price: float
    name: str
    image: Optional[str] = None

class CartResponse(BaseModel):
    items: List[CartItem]
    subtotal: float
    shipping: float
    total: float

# --- Pagination ---
class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int
