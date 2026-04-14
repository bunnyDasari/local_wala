# 🛵 LocalWala — Hyperlocal Delivery Platform

A full-stack hyperlocal delivery web app built with **Next.js 14** + **FastAPI** + **PostgreSQL**.

---

## 🗂 Project Structure

```
localwala/
├── localwala-backend/          ← FastAPI + PostgreSQL API
│   ├── app/
│   │   ├── api/routes/         ← auth, shops, products, cart, orders
│   │   ├── core/               ← config, database, security (JWT)
│   │   ├── models/             ← SQLAlchemy ORM models
│   │   ├── schemas/            ← Pydantic request/response schemas
│   │   ├── seed.py             ← Sample data seeder
│   │   └── main.py             ← FastAPI entry point
│   ├── alembic/                ← Database migrations
│   ├── Dockerfile
│   ├── requirements.txt
│   └── README.md
│
├── localwala-frontend/         ← Next.js 14 App Router UI
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/      ← Home: stats, categories, nearby shops
│   │   │   ├── shop/           ← Shop listing + [id] detail page
│   │   │   ├── cart/           ← Cart with bill summary & checkout
│   │   │   ├── tracking/       ← Live order status timeline
│   │   │   └── orders/         ← History + [id] order detail
│   │   ├── components/
│   │   │   ├── layout/         ← Sidebar, TopBar
│   │   │   ├── ui/             ← AuthModal
│   │   │   └── shared/         ← Spinner, Badge, Price, etc.
│   │   ├── store/              ← Zustand (auth + cart)
│   │   ├── lib/api.ts          ← Axios client + all API calls
│   │   └── types/index.ts      ← All TypeScript interfaces
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── nginx/
│   └── nginx.conf              ← Reverse proxy (/ → Next.js, /api → FastAPI)
├── docker-compose.yml          ← Full stack orchestration
├── .env.example
├── Makefile                    ← Dev shortcuts
└── README.md
```

---

## 🚀 Quick Start (Docker — Recommended)

```bash
# 1. Clone and enter the project
git clone <your-repo>
cd localwala

# 2. Copy env file
cp .env.example .env

# 3. Start everything
make up
# or: docker compose up -d --build

# 4. Seed the database with sample shops & products
make seed
# or: docker compose exec backend python -m app.seed
```

| Service    | URL                              |
|------------|----------------------------------|
| 🌐 App     | http://localhost                 |
| ⚡ Frontend | http://localhost:3000            |
| 🔧 API     | http://localhost:8000            |
| 📖 API Docs | http://localhost:8000/docs      |
| 🗄 Database | localhost:5432                  |

---

## 👤 Demo Credentials

After running `make seed`:

| Field    | Value                  |
|----------|------------------------|
| Email    | demo@localwala.in      |
| Password | demo1234               |

---

## 🛠 Tech Stack

### Backend (`localwala-backend/`)
| Layer        | Tech                          |
|--------------|-------------------------------|
| Framework    | FastAPI 0.111                 |
| ORM          | SQLAlchemy 2 (async)          |
| Database     | PostgreSQL 16                 |
| Driver       | asyncpg                       |
| Migrations   | Alembic                       |
| Auth         | JWT (python-jose) + bcrypt    |
| Cache        | Redis 7                       |
| Validation   | Pydantic v2                   |

### Frontend (`localwala-frontend/`)
| Layer        | Tech                          |
|--------------|-------------------------------|
| Framework    | Next.js 14 (App Router)       |
| Language     | TypeScript                    |
| Styling      | Tailwind CSS                  |
| State        | Zustand                       |
| HTTP Client  | Axios (JWT interceptors)      |
| Toasts       | react-hot-toast               |
| Icons        | lucide-react                  |

### Infrastructure
| Service | Tech             |
|---------|------------------|
| Proxy   | Nginx            |
| Cache   | Redis            |
| DB      | PostgreSQL       |
| Runtime | Docker Compose   |

---

## 📦 Pages & Features

| Page | Route | Features |
|------|-------|---------|
| Dashboard | `/dashboard` | Stats cards, category filter, nearby shops |
| Shop List | `/shop` | Filter by category, ratings, distance |
| Shop Detail | `/shop/[id]` | Vendor info, product grid, Add to Cart |
| Cart | `/cart` | Qty stepper, coupon field, delivery address, checkout |
| Order Tracking | `/tracking` | Animated 4-stage timeline, auto-refresh, demo advance |
| Order History | `/orders` | All orders with status badges |
| Order Detail | `/orders/[id]` | Full bill, items, re-track active orders |

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | ❌ | Register new user |
| POST | `/api/v1/auth/login` | ❌ | Login → JWT token |
| GET | `/api/v1/shops/categories` | ❌ | All categories |
| GET | `/api/v1/shops/nearby?lat=&lng=` | ❌ | Shops within radius |
| GET | `/api/v1/shops/{id}` | ❌ | Shop details |
| GET | `/api/v1/products/shop/{id}` | ❌ | Products by shop |
| GET | `/api/v1/cart` | ✅ | Get user cart |
| POST | `/api/v1/cart/add` | ✅ | Add to cart |
| PATCH | `/api/v1/cart/{item_id}` | ✅ | Update qty (0 = remove) |
| DELETE | `/api/v1/cart/clear` | ✅ | Clear cart |
| POST | `/api/v1/orders` | ✅ | Place order |
| GET | `/api/v1/orders` | ✅ | Order history |
| GET | `/api/v1/orders/{id}` | ✅ | Order + tracking |
| PATCH | `/api/v1/orders/{id}/status` | ✅ | Advance status (demo) |

---

## 🧰 Makefile Commands

```bash
make up               # Start all services
make down             # Stop all services
make seed             # Seed sample data
make logs             # Tail all logs
make shell-backend    # Shell into backend container
make shell-db         # psql into PostgreSQL
make migrate          # Run Alembic migrations
make makemigrations msg="add column"  # Generate migration
make clean            # Remove everything
```

---

## 🔄 Order Status Flow

```
Order Placed → Vendor Preparing → Picked by Delivery Partner → Delivered
```

Use the **"Simulate next status"** button on the Tracking page to demo the flow end-to-end.

---

## 📁 Local Dev (Without Docker)

```bash
# Backend
cd localwala-backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Set DATABASE_URL in .env
uvicorn app.main:app --reload
python -m app.seed

# Frontend (new terminal)
cd localwala-frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 npm run dev
```
