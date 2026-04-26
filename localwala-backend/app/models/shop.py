from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class CategoryEnum(str, enum.Enum):
    GROCERIES = "Groceries"
    VEGETABLES = "Vegetables"
    MEAT = "Meat"
    MEDICINES = "Medicines"
    CLOTHING = "Clothing"


class ShopCategory(Base):
    __tablename__ = "shop_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    icon = Column(String(10), default="🛍️")
    color = Column(String(20), default="#F97316")

    shops = relationship("Shop", back_populates="category")


class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text)
    image_url = Column(String(500))
    category_id = Column(Integer, ForeignKey("shop_categories.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Link to vendor user
    owner_name = Column(String(100))
    phone = Column(String(15))
    address = Column(String(500))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    rating = Column(Float, default=4.0)
    total_reviews = Column(Integer, default=0)
    delivery_time_min = Column(Integer, default=20)   # minutes
    delivery_fee = Column(Float, default=20.0)
    min_order = Column(Float, default=100.0)
    is_open = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("ShopCategory", back_populates="shops")
    owner = relationship("User", back_populates="owned_shops")
    products = relationship("Product", back_populates="shop", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="shop")
