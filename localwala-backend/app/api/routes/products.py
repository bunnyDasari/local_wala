from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.product import Product
from app.schemas.schemas import ProductOut

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/shop/{shop_id}", response_model=list[ProductOut])
async def get_products_by_shop(shop_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product).where(Product.shop_id == shop_id, Product.is_available == True)
    )
    return result.scalars().all()


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    product = await db.scalar(select(Product).where(Product.id == product_id))
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")
    return product
