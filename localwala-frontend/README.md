# LocalWala — Frontend (Next.js 14 + TypeScript)

## Tech Stack
- **Next.js 14** — App Router, Server Components
- **TypeScript** — full type safety
- **Tailwind CSS** — utility-first styling
- **Zustand** — client state (cart, auth)
- **Axios** — API client with JWT interceptors
- **react-hot-toast** — notifications
- **lucide-react** — icons

## Project Structure
```
localwala-frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Root layout (sidebar + topbar)
│   │   ├── globals.css             ← Global styles + utilities
│   │   ├── page.tsx                ← Redirects to /dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx            ← Home: stats, categories, nearby shops
│   │   ├── shop/
│   │   │   ├── page.tsx            ← Shop listing with category filter
│   │   │   └── [id]/page.tsx       ← Shop detail + products + Add to Cart
│   │   ├── cart/
│   │   │   └── page.tsx            ← Cart items, bill summary, checkout
│   │   ├── tracking/
│   │   │   └── page.tsx            ← Live order tracking with timeline
│   │   └── orders/
│   │       ├── page.tsx            ← Order history list
│   │       └── [id]/page.tsx       ← Order detail
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx         ← Desktop sidebar + mobile bottom nav
│   │   │   └── TopBar.tsx          ← Location, search, notifications
│   │   └── shared/
│   │       └── index.tsx           ← Spinner, EmptyState, Badge, Price, etc.
│   ├── store/
│   │   ├── authStore.ts            ← Auth state (token, user)
│   │   └── cartStore.ts            ← Cart state + actions
│   ├── lib/
│   │   └── api.ts                  ← Axios client + all API calls
│   └── types/
│       └── index.ts                ← All TypeScript interfaces
├── Dockerfile
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Pages & Features

| Route | Page | Features |
|-------|------|---------|
| `/dashboard` | Dashboard | Stats, category filter, nearby shops |
| `/shop` | Shop Listing | Category pills, distance, ratings |
| `/shop/[id]` | Shop Detail | Products, Add to Cart, shop info |
| `/cart` | Cart | Qty stepper, coupon input, checkout |
| `/tracking` | Order Tracking | Animated timeline, auto-refresh, demo advance |
| `/orders` | Order History | Status badges, active order link |
| `/orders/[id]` | Order Detail | Full bill, items, status |

## Quick Start

### With Docker (recommended)
```bash
docker compose up --build
# App → http://localhost:3000
```

### Local Dev
```bash
npm install
cp ../.env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev
# App → http://localhost:3000
```

## Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=LocalWala
```

## Demo Flow
1. Open http://localhost:3000 → Dashboard
2. Browse shops → click any shop
3. Add products to cart
4. Go to Cart → enter address → Checkout
5. Track order on Tracking page
6. Use "Advance status" button to simulate delivery stages
7. View history on Orders page
