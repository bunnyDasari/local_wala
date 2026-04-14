from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.cart import CartItem
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.shop import Shop
from app.schemas.schemas import OrderCreate, OrderOut, OrderListItem

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderOut, status_code=201)
async def place_order(
    payload: OrderCreate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    # Load cart
    result = await db.execute(
        select(CartItem)
        .options(selectinload(CartItem.product).selectinload(Product.shop))
        .where(CartItem.user_id == user_id)
    )
    cart_items = result.scalars().all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    shop = cart_items[0].product.shop
    subtotal = sum(i.product.price * i.quantity for i in cart_items)
    delivery_fee = shop.delivery_fee
    total = subtotal + delivery_fee

    order = Order(
        user_id=user_id,
        shop_id=shop.id,
        subtotal=round(subtotal, 2),
        delivery_fee=delivery_fee,
        total_amount=round(total, 2),
        delivery_address=payload.delivery_address,
        delivery_notes=payload.delivery_notes,
        estimated_delivery=datetime.utcnow() + timedelta(minutes=shop.delivery_time_min),
    )
    db.add(order)
    await db.flush()

    for item in cart_items:
        db.add(OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.product.price,
            total_price=round(item.product.price * item.quantity, 2),
        ))

    # Clear cart
    await db.execute(delete(CartItem).where(CartItem.user_id == user_id))
    await db.flush()

    return await get_order(order.id, user_id, db)


@router.get("", response_model=list[OrderListItem])
async def list_orders(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.shop), selectinload(Order.items))
        .where(Order.user_id == user_id)
        .order_by(Order.placed_at.desc())
    )
    orders = result.scalars().all()
    return [
        OrderListItem(
            id=o.id,
            status=o.status,
            total_amount=o.total_amount,
            placed_at=o.placed_at,
            shop_name=o.shop.name,
            item_count=sum(i.quantity for i in o.items),
        )
        for o in orders
    ]


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    order = await db.scalar(
        select(Order)
        .options(
            selectinload(Order.shop).selectinload(Shop.category),
            selectinload(Order.items).selectinload(OrderItem.product),
        )
        .where(Order.id == order_id, Order.user_id == user_id)
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: int,
    status: OrderStatus,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Demo endpoint to advance order status (normally triggered by vendor/delivery)"""
    order = await db.scalar(select(Order).where(Order.id == order_id, Order.user_id == user_id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    if status == OrderStatus.DELIVERED:
        order.delivered_at = datetime.utcnow()
    await db.flush()
    return await get_order(order_id, user_id, db)
