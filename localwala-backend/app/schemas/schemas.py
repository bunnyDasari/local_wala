from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models.order import OrderStatus


# ─── Auth ───────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)
    role: str = Field(default="user", pattern="^(user|vendor)$")
    address: Optional[str] = None


class VendorRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)
    address: Optional[str] = None
    shop_name: str = Field(..., min_length=2, max_length=150)
    shop_description: Optional[str] = None
    shop_category_id: int
    shop_address: str
    shop_latitude: float
    shop_longitude: float


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    role: str


# ─── User ───────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    address: Optional[str]
    latitude: float
    longitude: float
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Category ───────────────────────────────────────────────────────────────

class CategoryOut(BaseModel):
    id: int
    name: str
    icon: str
    color: str

    class Config:
        from_attributes = True


# ─── Shop ───────────────────────────────────────────────────────────────────

class ShopOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    image_url: Optional[str]
    category: CategoryOut
    owner_name: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    rating: float
    total_reviews: int
    delivery_time_min: int
    delivery_fee: float
    min_order: float
    is_open: bool
    distance_km: Optional[float] = None   # computed at query time

    class Config:
        from_attributes = True


class ShopList(BaseModel):
    shops: List[ShopOut]
    total: int


# ─── Product ────────────────────────────────────────────────────────────────

class ProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    image_url: Optional[str]
    price: float
    original_price: Optional[float]
    unit: str
    stock: int
    is_available: bool

    class Config:
        from_attributes = True


# ─── Cart ───────────────────────────────────────────────────────────────────

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1, le=50)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=0, le=50)


class CartItemOut(BaseModel):
    id: int
    product: ProductOut
    quantity: int
    item_total: float

    class Config:
        from_attributes = True


class CartOut(BaseModel):
    items: List[CartItemOut]
    subtotal: float
    delivery_fee: float
    total: float
    shop_id: Optional[int]
    shop_name: Optional[str]


# ─── Order ──────────────────────────────────────────────────────────────────

class OrderCreate(BaseModel):
    delivery_address: str
    delivery_notes: Optional[str] = None


class OrderItemOut(BaseModel):
    id: int
    product: ProductOut
    quantity: int
    unit_price: float
    total_price: float

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    status: OrderStatus
    subtotal: float
    delivery_fee: float
    total_amount: float
    delivery_address: str
    delivery_notes: Optional[str]
    placed_at: datetime
    delivered_at: Optional[datetime]
    estimated_delivery: Optional[datetime]
    shop: ShopOut
    items: List[OrderItemOut]

    class Config:
        from_attributes = True


class OrderListItem(BaseModel):
    id: int
    status: OrderStatus
    total_amount: float
    placed_at: datetime
    shop_name: str
    item_count: int

    class Config:
        from_attributes = True


# ─── Vendor ─────────────────────────────────────────────────────────────────

class VendorShopOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    image_url: Optional[str]
    category: CategoryOut
    phone: Optional[str]
    address: Optional[str]
    rating: float
    total_reviews: int
    delivery_time_min: int
    delivery_fee: float
    min_order: float
    is_open: bool
    is_active: bool

    class Config:
        from_attributes = True


class ShopUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    delivery_time_min: Optional[int] = None
    delivery_fee: Optional[float] = None
    min_order: Optional[float] = None
    is_open: Optional[bool] = None


class VendorProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    image_url: Optional[str]
    price: float
    original_price: Optional[float]
    unit: str
    stock: int
    is_available: bool
    created_at: datetime

    class Config:
        from_attributes = True


class VendorProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: float = Field(..., gt=0)
    original_price: Optional[float] = None
    unit: str = Field(default="piece")
    stock: int = Field(default=100, ge=0)
    is_available: bool = Field(default=True)


class VendorProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    original_price: Optional[float] = None
    unit: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)
    is_available: Optional[bool] = None


class VendorOrderOut(BaseModel):
    id: int
    status: OrderStatus
    subtotal: float
    delivery_fee: float
    total_amount: float
    delivery_address: str
    delivery_notes: Optional[str]
    placed_at: datetime
    delivered_at: Optional[datetime]
    user: UserOut
    items: List[OrderItemOut]

    class Config:
        from_attributes = True


class VendorAnalytics(BaseModel):
    total_orders: int
    total_revenue: float
    today_orders: int
    today_revenue: float
    pending_orders: int
    total_products: int
    shop_rating: float
    total_reviews: int

