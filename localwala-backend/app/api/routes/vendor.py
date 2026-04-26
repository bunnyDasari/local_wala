from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import require_role, get_current_user_id
from app.models.user import User
from app.models.shop import Shop
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.schemas import (
    VendorShopOut, VendorProductOut, VendorProductCreate, VendorProductUpdate,
    VendorOrderOut, VendorAnalytics, ShopUpdate
)

router = APIRouter(prefix="/vendor", tags=["Vendor"])


@router.get("/shop", response_model=VendorShopOut)
async def get_vendor_shop(
    user_id: int = Depends(get_current_user_id),
    _: dict = Depends(require_role(["vendor"])),
    db: AsyncSession = Depends(get_db)
):
    """Get vendor's shop details"""
    shop = await db.scalar(
        select(Shop)
        .options(selectinload(Shop.category))
        .where(Shop.owner_id == user_id)
    )
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found. Please contact support.")
    
    return shop


@router.patch("/shop", response_model=VendorShopOut)
async def update_vendor_shop(
    payload: ShopUpdate,
    user_id: int = Depends(get_current_user_id),
    _: dict = Depends(require_role(["vendor"])),
    db: AsyncSession = Depends(get_db)
):
    """Update vendor's shop details"""
    shop = await db.scalar(select(Shop).where(Shop.owner_id == user_id))
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(shop, key, value)
    
    await db.commit()
    await db.refresh(shop, ["category"])
    return shop


@router.get("/products", response_model=List[VendorProductOut])
async def get_vendor_products(
    user_id: int = Depends(get_current_user_id),
    _: dict = Depends(require_role(["vendor"])),
    db: AsyncSession = Depends(get_db)
):
    """Get all products for vendor's shop"""
    shop = await db.scalar(select(Shop).where(Shop.owner_id == user_id))
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    products = await db.scalars(
        select(Product).where(Product.shop_id == shop.id).order_by(Product.created_at.desc())
    )
    return products.all()


@router.post("/products", response_model=VendorProductOut, status_code=201)
async def create_product(
    payload: VendorProductCreate,
    user_id: int = Depends(get_current_user_id),
    _: dict = Depends(require_role(["vendor"])),
    db: AsyncSession = Depends(get_db)
):
    """Create a new product"""
    shop = await db.scalar(select(Shop).where(Shop.owner_id == user_id))
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    product = Product(
        shop_id=shop.id,
        **payload.dict()
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


@router.patch("/products/{product_id}", response_model=VendorProductOut)
async def update_product(
    product_id: int,
    payload: VendorProductUpdate,
    user_id: int = Depends(get_current_user_id),
    _: dict = Depends(require_role(["vendor"])),
    db: AsyncSession = Depends(get_db)
):
    """Update a product"""
    shop = await db.scalar(select(Shop).where(Shop.owner_id == user_id))
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    product = await db.scalar(
        select(Product).where(and_(Product.id == product_id, Product.shop_id == shop.id))
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(product, key, value)
    
    await db.commit()
    await db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=204)
async def delete_product(
    product_id: int,
    user_id: int = Depends(get_current_user_id),
    _: dict = Depends(require_role(["vendor"])),
    db: AsyncSession = Depends(get_db)
):
    """Delete a product"""
    shop = await db.scalar(select(Shop).where(Shop.owner_id == user_id))
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    product = await db.scalar(
        select(Product).where(and_(Product.id == product_id, Product.shop_id == shop.id))
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.delete(product)
    await db.commit()


@router.get("/orders", response_model=List[VendorOrderOut])
async def get_vendor_orders(
    status: str = None,
    user_id: int = Depends(get_current_user_id),
    _: dict = Depends(require_role(["vendor"])),
    db: AsyncSession = Depends(get_db)
):
    """Get all orders for vendor's shop"""
    shop = await db.scalar(select(Shop).where(Shop.owner_id == user_id))
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    query = (
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .options(selectinload(Order.user))
        .where(Order.shop_id == shop.id)
    )
    
    if status:
        query = query.where(Order.status == status)
    
    orders = await db.scalars(query.order_by(Order.placed_at.desc()))
    return orders.all()


@router.patch("/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: OrderStatus,
    user_id: int = Depends(get_current_user_id),
    _: dict = Depends(require_role(["vendor"])),
    db: AsyncSession = Depends(get_db)
):
    """Update order status"""
    shop = await db.scalar(select(Shop).where(Shop.owner_id == user_id))
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    order = await db.scalar(
        select(Order).where(and_(Order.id == order_id, Order.shop_id == shop.id))
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status
    if status == OrderStatus.DELIVERED:
        order.delivered_at = datetime.utcnow()
    
    await db.commit()
    return {"message": "Order status updated", "status": status.value}


@router.get("/analytics", response_model=VendorAnalytics)
async def get_vendor_analytics(
    user_id: int = Depends(get_current_user_id),
    _: dict = Depends(require_role(["vendor"])),
    db: AsyncSession = Depends(get_db)
):
    """Get vendor analytics"""
    shop = await db.scalar(select(Shop).where(Shop.owner_id == user_id))
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    # Total orders
    total_orders = await db.scalar(
        select(func.count(Order.id)).where(Order.shop_id == shop.id)
    ) or 0
    
    # Total revenue
    total_revenue = await db.scalar(
        select(func.sum(Order.total_amount))
        .where(and_(Order.shop_id == shop.id, Order.status != OrderStatus.CANCELLED))
    ) or 0.0
    
    # Today's orders
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = await db.scalar(
        select(func.count(Order.id))
        .where(and_(Order.shop_id == shop.id, Order.placed_at >= today_start))
    ) or 0
    
    # Today's revenue
    today_revenue = await db.scalar(
        select(func.sum(Order.total_amount))
        .where(and_(
            Order.shop_id == shop.id,
            Order.placed_at >= today_start,
            Order.status != OrderStatus.CANCELLED
        ))
    ) or 0.0
    
    # Pending orders
    pending_orders = await db.scalar(
        select(func.count(Order.id))
        .where(and_(
            Order.shop_id == shop.id,
            Order.status.in_([OrderStatus.PLACED, OrderStatus.PREPARING])
        ))
    ) or 0
    
    # Total products
    total_products = await db.scalar(
        select(func.count(Product.id)).where(Product.shop_id == shop.id)
    ) or 0
    
    return VendorAnalytics(
        total_orders=total_orders,
        total_revenue=total_revenue,
        today_orders=today_orders,
        today_revenue=today_revenue,
        pending_orders=pending_orders,
        total_products=total_products,
        shop_rating=shop.rating,
        total_reviews=shop.total_reviews
    )
