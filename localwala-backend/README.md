# LocalWala — Backend (FastAPI + PostgreSQL)

## Tech Stack
- **FastAPI** 0.111 — async REST API
- **SQLAlchemy 2** — async ORM
- **PostgreSQL 16** — primary database
- **asyncpg** — async PostgreSQL driver
- **Redis** — caching & session store
- **Alembic** — database migrations
- **passlib + jose** — auth (bcrypt + JWT)

## Project Structure
```
localwala-backend/
├── app/
│   ├── api/
│   │   ├── __init__.py         # Router aggregator
│   │   └── routes/
│   │       ├── auth.py         # Register / Login
│   │       ├── shops.py        # Nearby shops, categories
│   │       ├── products.py     # Products by shop
│   │       ├── cart.py         # Cart CRUD
│   │       └── orders.py       # Place order, tracking, history
│   ├── core/
│   │   ├── config.py           # Settings (pydantic-settings)
│   │   ├── database.py         # Async SQLAlchemy engine + session
│   │   └── security.py         # JWT + bcrypt
│   ├── models/
│   │   ├── user.py
│   │   ├── shop.py
│   │   ├── product.py
│   │   ├── cart.py
│   │   └── order.py
│   ├── schemas/
│   │   └── schemas.py          # All Pydantic request/response models
│   ├── seed.py                 # DB seed with sample data
│   └── main.py                 # FastAPI app + CORS + lifespan
├── init.sql                    # PostgreSQL extensions
├── requirements.txt
├── Dockerfile
└── README.md
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | ❌ | Create account |
| POST | `/api/v1/auth/login` | ❌ | Get JWT token |
| GET | `/api/v1/shops/categories` | ❌ | List all categories |
| GET | `/api/v1/shops/nearby` | ❌ | Nearby shops (lat/lng) |
| GET | `/api/v1/shops/{id}` | ❌ | Shop details |
| GET | `/api/v1/products/shop/{id}` | ❌ | Products by shop |
| GET | `/api/v1/cart` | ✅ | Get user cart |
| POST | `/api/v1/cart/add` | ✅ | Add item to cart |
| PATCH | `/api/v1/cart/{item_id}` | ✅ | Update quantity |
| DELETE | `/api/v1/cart/clear` | ✅ | Clear cart |
| POST | `/api/v1/orders` | ✅ | Place order |
| GET | `/api/v1/orders` | ✅ | Order history |
| GET | `/api/v1/orders/{id}` | ✅ | Order details + tracking |
| PATCH | `/api/v1/orders/{id}/status` | ✅ | Update status (demo) |

## Quick Start

### With Docker (recommended)
```bash
cp ../.env.example .env
docker compose up --build
# Seed sample data:
docker exec localwala_backend python -m app.seed
```

### Local Dev
```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set DATABASE_URL in .env
uvicorn app.main:app --reload --port 8000
python -m app.seed
```

### API Docs
- Swagger UI → http://localhost:8000/docs
- ReDoc → http://localhost:8000/redoc

## Demo Credentials
After seeding:
- **Email:** demo@localwala.in
- **Password:** demo1234
