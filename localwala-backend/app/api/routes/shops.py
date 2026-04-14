from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional
import math
import logging
from app.core.database import get_db
from app.models.shop import Shop, ShopCategory
from app.schemas.schemas import ShopOut, ShopList, CategoryOut

router = APIRouter(prefix="/shops", tags=["Shops"])
logger = logging.getLogger(__name__)


def haversine(lat1, lon1, lat2, lon2) -> float:
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("/categories", response_model=list[CategoryOut])
async def get_categories(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(ShopCategory))
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/nearby", response_model=ShopList)
async def get_nearby_shops(
    lat: Optional[float] = Query(None, description="User latitude"),
    lng: Optional[float] = Query(None, description="User longitude"),
    category_id: Optional[int] = None,
    radius_km: float = Query(50.0, le=200),   # default 50 km so you always get results
    db: AsyncSession = Depends(get_db),
):
    try:
        q = select(Shop).options(selectinload(Shop.category)).where(Shop.is_active == True)  # noqa
        if category_id:
            q = q.where(Shop.category_id == category_id)

        result = await db.execute(q)
        shops = result.scalars().all()
        logger.info(f"Total shops in DB (active): {len(shops)}")

        # If no lat/lng provided, return all shops with no distance filter
        if lat is None or lng is None:
            shop_list = []
            for shop in shops:
                out = ShopOut.model_validate(shop)
                out.distance_km = None
                shop_list.append(out)
            return ShopList(shops=shop_list, total=len(shop_list))

        # Filter by haversine distance
        nearby = []
        for shop in shops:
            dist = haversine(lat, lng, shop.latitude, shop.longitude)
            logger.debug(f"Shop '{shop.name}' distance: {dist:.2f} km (radius: {radius_km})")
            if dist <= radius_km:
                out = ShopOut.model_validate(shop)
                out.distance_km = round(dist, 2)
                nearby.append(out)

        nearby.sort(key=lambda s: (s.distance_km or 0))
        logger.info(f"Shops within {radius_km}km: {len(nearby)}")
        return ShopList(shops=nearby, total=len(nearby))

    except Exception as e:
        logger.error(f"Error in get_nearby_shops: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/all", response_model=ShopList)
async def get_all_shops(
    category_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """Return every active shop — useful for testing without coordinates."""
    try:
        q = select(Shop).options(selectinload(Shop.category)).where(Shop.is_active == True)  # noqa
        if category_id:
            q = q.where(Shop.category_id == category_id)
        result = await db.execute(q)
        shops = [ShopOut.model_validate(s) for s in result.scalars().all()]
        return ShopList(shops=shops, total=len(shops))
    except Exception as e:
        logger.error(f"Error in get_all_shops: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{shop_id}", response_model=ShopOut)
async def get_shop(shop_id: int, db: AsyncSession = Depends(get_db)):
    try:
        shop = await db.scalar(
            select(Shop).options(selectinload(Shop.category)).where(Shop.id == shop_id)
        )
        if not shop:
            raise HTTPException(status_code=404, detail="Shop not found")
        return ShopOut.model_validate(shop)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching shop {shop_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
