# localwala-backend/app/api/__init__.py
from fastapi import APIRouter
from app.api.routes import auth, shops, products, cart, orders, vendor, AuthPhone

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)                                    # /api/v1/auth/*
api_router.include_router(AuthPhone.router, prefix="/auth")              # /api/v1/auth/phone/*
api_router.include_router(shops.router)                                   # /api/v1/shops/*
api_router.include_router(products.router)                                # /api/v1/products/*
api_router.include_router(cart.router)                                    # /api/v1/cart/*
api_router.include_router(orders.router)                                  # /api/v1/orders/*
api_router.include_router(vendor.router)                                  # /api/v1/vendor/*