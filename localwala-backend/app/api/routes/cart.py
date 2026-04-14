from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.cart import CartItem
from app.models.product import Product
from app.models.shop import Shop
from app.schemas.schemas import CartItemAdd, CartItemUpdate, CartItemOut, CartOut, ProductOut

router = APIRouter(prefix="/cart", tags=["Cart"])


async def _build_cart(items: list[CartItem]) -> CartOut:
    cart_items_out = []
    subtotal = 0.0
    shop_id = None
    shop_name = None

    for item in items:
        item_total = item.product.price * item.quantity
        subtotal += item_total
        cart_items_out.append(
            CartItemOut(
                id=item.id,
                product=ProductOut.model_validate(item.product),
                quantity=item.quantity,
                item_total=item_total,
            )
        )
        if not shop_id:
            shop_id = item.product.shop_id
            shop_name = item.product.shop.name if item.product.shop else None

    delivery_fee = 20.0 if subtotal > 0 else 0.0
    return CartOut(
        items=cart_items_out,
        subtotal=round(subtotal, 2),
        delivery_fee=delivery_fee,
        total=round(subtotal + delivery_fee, 2),
        shop_id=shop_id,
        shop_name=shop_name,
    )


@router.get("", response_model=CartOut)
async def get_cart(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CartItem)
        .options(selectinload(CartItem.product).selectinload(Product.shop))
        .where(CartItem.user_id == user_id)
    )
    items = result.scalars().all()
    return await _build_cart(items)


@router.post("/add", response_model=CartOut)
async def add_to_cart(
    payload: CartItemAdd,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    product = await db.scalar(select(Product).where(Product.id == payload.product_id))
    if not product or not product.is_available:
        raise HTTPException(status_code=404, detail="Product not available")

    existing = await db.scalar(
        select(CartItem).where(CartItem.user_id == user_id, CartItem.product_id == payload.product_id)
    )
    if existing:
        existing.quantity = min(existing.quantity + payload.quantity, 50)
    else:
        db.add(CartItem(user_id=user_id, product_id=payload.product_id, quantity=payload.quantity))

    await db.flush()
    return await get_cart(user_id, db)


@router.patch("/{item_id}", response_model=CartOut)
async def update_cart_item(
    item_id: int,
    payload: CartItemUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    item = await db.scalar(
        select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user_id)
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if payload.quantity == 0:
        await db.delete(item)
    else:
        item.quantity = payload.quantity

    await db.flush()
    return await get_cart(user_id, db)


@router.delete("/clear", response_model=CartOut)
async def clear_cart(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(CartItem).where(CartItem.user_id == user_id))
    return CartOut(items=[], subtotal=0, delivery_fee=0, total=0, shop_id=None, shop_name=None)
