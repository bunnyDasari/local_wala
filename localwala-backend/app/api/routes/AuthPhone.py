# localwala-backend/app/api/routes/phone_auth.py
import random
import time
import httpx
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import hash_password, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.schemas import TokenResponse

router = APIRouter(prefix="/phone", tags=["Phone Auth"])
logger = logging.getLogger(__name__)

# In-memory OTP store: { phone: { otp, expires_at } }
# In production use Redis instead
_otp_store: dict[str, dict] = {}

OTP_EXPIRE_SECONDS = 300   # 5 minutes


def _generate_otp() -> str:
    return str(random.randint(100000, 999999))   # 6-digit OTP


async def _send_sms_fast2sms(phone: str, otp: str) -> bool:
    """Send OTP via Fast2SMS Quick SMS API."""
    if not settings.FAST2SMS_API_KEY:
        logger.warning("FAST2SMS_API_KEY not set — OTP not sent (demo mode)")
        return False

    message = f"Your LocalWala OTP is {otp}. Valid for 5 minutes. Do not share with anyone."

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            "https://www.fast2sms.com/dev/bulkV2",
            headers={
                "authorization": settings.FAST2SMS_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "route": "q",           # Quick SMS route (no DLT needed)
                "message": message,
                "language": "english",
                "flash": 0,
                "numbers": phone,
            },
        )
        data = resp.json()
        logger.info(f"Fast2SMS response: {data}")

        if resp.status_code == 200 and data.get("return") is True:
            return True
        else:
            logger.error(f"Fast2SMS error: {data}")
            return False


# ─── Schemas ─────────────────────────────────────────────────────────────────

class PhoneSendOTP(BaseModel):
    phone: str


class PhoneVerifyOTP(BaseModel):
    phone: str
    otp: str


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/send-otp")
async def send_otp(payload: PhoneSendOTP, db: AsyncSession = Depends(get_db)):
    phone = payload.phone.strip().replace(" ", "").replace("-", "")

    if len(phone) != 10 or not phone.isdigit():
        raise HTTPException(status_code=400, detail="Enter a valid 10-digit mobile number")

    # Check user exists
    user = await db.scalar(select(User).where(User.phone == phone))
    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account found with this phone number. Please register first."
        )

    # Generate and store OTP
    otp = _generate_otp()
    _otp_store[phone] = {
        "otp": otp,
        "expires_at": time.time() + OTP_EXPIRE_SECONDS,
    }
    logger.info(f"OTP for {phone}: {otp}")   # visible in docker logs for debugging

    # Send SMS
    sent = await _send_sms_fast2sms(phone, otp)

    if sent:
        return {
            "success": True,
            "message": f"OTP sent to +91 ******{phone[-4:]}",
        }
    else:
        # If SMS fails (no API key set), still return success but log it
        # Remove this in production — require SMS to succeed
        if settings.ENVIRONMENT == "development":
            return {
                "success": True,
                "message": f"[DEV] OTP for {phone} is {otp} (SMS not sent — set FAST2SMS_API_KEY)",
                "dev_otp": otp,   # only returned in dev mode
            }
        raise HTTPException(status_code=500, detail="Failed to send OTP. Try again.")


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(payload: PhoneVerifyOTP, db: AsyncSession = Depends(get_db)):
    phone = payload.phone.strip().replace(" ", "").replace("-", "")
    otp   = payload.otp.strip()

    # Get stored OTP
    stored = _otp_store.get(phone)
    if not stored:
        raise HTTPException(status_code=400, detail="OTP not requested or expired. Request a new one.")

    # Check expiry
    if time.time() > stored["expires_at"]:
        del _otp_store[phone]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    # Validate OTP
    if stored["otp"] != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP. Please try again.")

    # OTP correct — clear it
    del _otp_store[phone]

    # Get user
    user = await db.scalar(select(User).where(User.phone == phone))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user_id=user.id, name=user.name)