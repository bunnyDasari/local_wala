from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class OrderStatus(str, enum.Enum):
    PLACED = "Order Placed"
    PREPARING = "Vendor Preparing"
    PICKED_UP = "Picked by Delivery Partner"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PLACED)
    subtotal = Column(Float, nullable=False)
    delivery_fee = Column(Float, default=20.0)
    total_amount = Column(Float, nullable=False)
    delivery_address = Column(String(500))
    delivery_notes = Column(Text)
    estimated_delivery = Column(DateTime(timezone=True))
    placed_at = Column(DateTime(timezone=True), server_default=func.now())
    delivered_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="orders")
    shop = relationship("Shop", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
