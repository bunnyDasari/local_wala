from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User, UserRole
from app.models.shop import Shop
from app.schemas.schemas import UserRegister, VendorRegister, UserLogin, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check email already exists
    existing_email = await db.scalar(select(User).where(User.email == payload.email))
    if existing_email:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Check phone already exists
    existing_phone = await db.scalar(select(User).where(User.phone == payload.phone))
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number is already registered")

    try:
        user = User(
            name=payload.name,
            email=payload.email,
            phone=payload.phone,
            address=payload.address,
            role=UserRole.USER if payload.role == "user" else UserRole.VENDOR,
            hashed_password=hash_password(payload.password),
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)

        token = create_access_token({"sub": str(user.id), "role": user.role.value})
        return TokenResponse(access_token=token, user_id=user.id, name=user.name, role=user.role.value)

    except IntegrityError as e:
        await db.rollback()
        err = str(e.orig).lower()
        if "email" in err:
            raise HTTPException(status_code=400, detail="Email is already registered")
        if "phone" in err:
            raise HTTPException(status_code=400, detail="Phone number is already registered")
        raise HTTPException(status_code=400, detail="Account already exists with these details")


@router.post("/register-vendor", response_model=TokenResponse, status_code=201)
async def register_vendor(payload: VendorRegister, db: AsyncSession = Depends(get_db)):
    # Check email already exists
    existing_email = await db.scalar(select(User).where(User.email == payload.email))
    if existing_email:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Check phone already exists
    existing_phone = await db.scalar(select(User).where(User.phone == payload.phone))
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number is already registered")

    try:
        # Create vendor user
        user = User(
            name=payload.name,
            email=payload.email,
            phone=payload.phone,
            address=payload.address,
            role=UserRole.VENDOR,
            hashed_password=hash_password(payload.password),
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)

        # Create shop for vendor
        shop = Shop(
            name=payload.shop_name,
            description=payload.shop_description,
            category_id=payload.shop_category_id,
            owner_id=user.id,
            owner_name=user.name,
            phone=user.phone,
            address=payload.shop_address,
            latitude=payload.shop_latitude,
            longitude=payload.shop_longitude,
        )
        db.add(shop)
        await db.commit()

        token = create_access_token({"sub": str(user.id), "role": user.role.value})
        return TokenResponse(access_token=token, user_id=user.id, name=user.name, role=user.role.value)

    except IntegrityError as e:
        await db.rollback()
        err = str(e.orig).lower()
        if "email" in err:
            raise HTTPException(status_code=400, detail="Email is already registered")
        if "phone" in err:
            raise HTTPException(status_code=400, detail="Phone number is already registered")
        raise HTTPException(status_code=400, detail="Account already exists with these details")


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token, user_id=user.id, name=user.name, role=user.role.value)