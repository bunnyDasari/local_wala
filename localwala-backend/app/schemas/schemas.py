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
    address: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str


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
