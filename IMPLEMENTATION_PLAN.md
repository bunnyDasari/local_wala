# 🚀 LocalWala - Complete User/Vendor Dashboard Implementation Plan

## ✅ COMPLETED (Backend Foundation)

### 1. Database Models Updated
- ✅ Added `UserRole` enum (user, vendor, admin) to User model
- ✅ Added `role` column to users table
- ✅ Added `owner_id` foreign key to shops table (links shop to vendor)
- ✅ Added `owned_shops` relationship to User model

### 2. Authentication System Enhanced
- ✅ Updated JWT token to include `role` field
- ✅ Created `require_role()` dependency for role-based access control
- ✅ Updated `/auth/register` to accept role parameter
- ✅ Created `/auth/register-vendor` endpoint for vendor registration with shop creation
- ✅ Updated `/auth/login` to return role in token response

### 3. Vendor API Routes Created (`/api/v1/vendor/*`)
- ✅ `GET /vendor/shop` - Get vendor's shop details
- ✅ `PATCH /vendor/shop` - Update shop details
- ✅ `GET /vendor/products` - List all products
- ✅ `POST /vendor/products` - Create new product
- ✅ `PATCH /vendor/products/{id}` - Update product
- ✅ `DELETE /vendor/products/{id}` - Delete product
- ✅ `GET /vendor/orders` - Get vendor's orders (with status filter)
- ✅ `PATCH /vendor/orders/{id}/status` - Update order status
- ✅ `GET /vendor/analytics` - Get sales analytics

### 4. Schemas Added
- ✅ `VendorRegister` - Vendor registration with shop details
- ✅ `VendorShopOut`, `ShopUpdate` - Shop management
- ✅ `VendorProductOut`, `VendorProductCreate`, `VendorProductUpdate` - Product management
- ✅ `VendorOrderOut` - Vendor order view
- ✅ `VendorAnalytics` - Analytics data

---

## 🔄 NEXT STEPS (To Complete)

### Phase 1: Database Migration (CRITICAL)

**Option A: Manual SQL (Fastest)**
```sql
-- Connect to PostgreSQL
docker compose exec -it postgres psql -U localwala -d localwala_db

-- Add role enum and column
CREATE TYPE userrole AS ENUM ('user', 'vendor', 'admin');
ALTER TABLE users ADD COLUMN role userrole NOT NULL DEFAULT 'user';

-- Add owner_id to shops
ALTER TABLE shops ADD COLUMN owner_id INTEGER REFERENCES users(id);

-- Update existing data (optional - link existing shops to demo user)
UPDATE users SET role = 'vendor' WHERE email = 'demo@localwala.in';
UPDATE shops SET owner_id = (SELECT id FROM users WHERE email = 'demo@localwala.in' LIMIT 1);
```

**Option B: Rebuild Database (Clean Start)**
```bash
# Stop and remove all containers with volumes
docker compose down -v

# Start fresh
docker compose up -d --build

# Seed database
docker compose exec backend python -m app.seed
```

### Phase 2: Frontend - Update Auth Store & Types

**File: `src/store/authStore.ts`**
```typescript
interface AuthState {
  token: string | null;
  userId: number | null;
  userName: string | null;
  role: "user" | "vendor" | null;  // ADD THIS
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  setUser: (token: string, userId: number, name: string, role: string) => void;  // UPDATE
  logout: () => void;
}
```

**File: `src/types/index.ts`**
```typescript
export type UserRole = "user" | "vendor";

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  name: string;
  role: string;  // ADD THIS
}
```

### Phase 3: Frontend - Enhanced AuthModal

**File: `src/components/ui/AuthModal.tsx`**

Add role selection UI:
```typescript
const [selectedRole, setSelectedRole] = useState<"user" | "vendor">("user");

// In the register form, add:
<div className="mb-4">
  <label className="block text-sm font-medium mb-2">I am a</label>
  <div className="flex gap-4">
    <button
      type="button"
      onClick={() => setSelectedRole("user")}
      className={`flex-1 py-3 rounded-lg border-2 ${
        selectedRole === "user" 
          ? "border-brand-500 bg-brand-50" 
          : "border-gray-200"
      }`}
    >
      🛒 Customer
    </button>
    <button
      type="button"
      onClick={() => setSelectedRole("vendor")}
      className={`flex-1 py-3 rounded-lg border-2 ${
        selectedRole === "vendor" 
          ? "border-brand-500 bg-brand-50" 
          : "border-gray-200"
      }`}
    >
      🏪 Shop Owner
    </button>
  </div>
</div>

{selectedRole === "vendor" && (
  <>
    <input placeholder="Shop Name" name="shop_name" required />
    <input placeholder="Shop Address" name="shop_address" required />
    <select name="shop_category_id" required>
      <option value="">Select Category</option>
      {/* Load categories */}
    </select>
  </>
)}
```

### Phase 4: Frontend - Create Vendor Dashboard Pages

**Create these files:**

1. **`src/app/vendor/dashboard/page.tsx`** - Vendor home with analytics
2. **`src/app/vendor/shop/page.tsx`** - Shop management
3. **`src/app/vendor/products/page.tsx`** - Product list & management
4. **`src/app/vendor/products/new/page.tsx`** - Add new product
5. **`src/app/vendor/products/[id]/edit/page.tsx`** - Edit product
6. **`src/app/vendor/orders/page.tsx`** - Vendor orders list
7. **`src/app/vendor/orders/[id]/page.tsx`** - Order detail with status update
8. **`src/app/vendor/analytics/page.tsx`** - Sales analytics & reports

### Phase 5: Frontend - Update Navigation

**File: `src/components/layout/Sidebar.tsx`**

Add role-based navigation:
```typescript
const { role } = useAuthStore();

const userLinks = [
  { href: "/dashboard", icon: "🏠", label: "Home" },
  { href: "/shop", icon: "🛍️", label: "Shops" },
  { href: "/cart", icon: "🛒", label: "Cart" },
  { href: "/orders", icon: "📦", label: "Orders" },
  { href: "/tracking", icon: "📍", label: "Track" },
];

const vendorLinks = [
  { href: "/vendor/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/vendor/shop", icon: "🏪", label: "My Shop" },
  { href: "/vendor/products", icon: "📦", label: "Products" },
  { href: "/vendor/orders", icon: "🛒", label: "Orders" },
  { href: "/vendor/analytics", icon: "📈", label: "Analytics" },
];

const links = role === "vendor" ? vendorLinks : userLinks;
```

### Phase 6: Frontend - Route Protection

**Create: `src/middleware.ts`**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  // Protect vendor routes
  if (request.nextUrl.pathname.startsWith('/vendor')) {
    if (!token || role !== 'vendor') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Redirect vendors away from user pages
  if (role === 'vendor' && request.nextUrl.pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/vendor/:path*', '/dashboard', '/cart', '/orders/:path*'],
};
```

---

## 📋 VENDOR DASHBOARD FEATURES

### Dashboard Page (`/vendor/dashboard`)
- **Analytics Cards:**
  - Total Orders
  - Total Revenue
  - Today's Orders
  - Today's Revenue
  - Pending Orders
  - Total Products
  - Shop Rating
  - Total Reviews
- **Recent Orders** (last 10)
- **Quick Actions** (Add Product, View Orders, Update Shop)

### Shop Management (`/vendor/shop`)
- Edit shop details (name, description, image)
- Update contact info (phone, address)
- Set delivery settings (time, fee, minimum order)
- Toggle shop open/closed status

### Product Management (`/vendor/products`)
- **Product List** with search & filters
- **Add Product** form:
  - Name, description, image URL
  - Price, original price (for discounts)
  - Unit (kg, piece, liter, etc.)
  - Stock quantity
  - Availability toggle
- **Edit Product** - Update any field
- **Delete Product** - With confirmation
- **Bulk Actions** - Enable/disable multiple products

### Order Management (`/vendor/orders`)
- **Order List** with filters:
  - All Orders
  - Pending (Placed + Preparing)
  - In Progress (Picked Up)
  - Completed (Delivered)
  - Cancelled
- **Order Detail View:**
  - Customer info (name, phone, address)
  - Order items with quantities
  - Total amount breakdown
  - **Status Update Button** - Move to next status
  - Order timeline
- **Real-time Updates** - Auto-refresh pending orders

### Analytics (`/vendor/analytics`)
- **Revenue Charts:**
  - Daily revenue (last 7 days)
  - Monthly revenue (last 6 months)
- **Order Statistics:**
  - Orders by status (pie chart)
  - Orders by time of day
- **Top Products** - Best sellers
- **Customer Insights** - Repeat customers, average order value

---

## 🎨 UI/UX IMPROVEMENTS

### Design System
- **Colors:**
  - Primary: `#F97316` (Orange)
  - Success: `#10B981` (Green)
  - Warning: `#F59E0B` (Amber)
  - Error: `#EF4444` (Red)
  - Neutral: Gray scale

- **Typography:**
  - Headings: Bold, clear hierarchy
  - Body: Inter font, 14-16px
  - Labels: 12px, uppercase, gray-500

- **Components:**
  - Cards: White bg, subtle shadow, rounded-xl
  - Buttons: Solid primary, outline secondary
  - Inputs: Border focus states, clear labels
  - Tables: Striped rows, hover states
  - Modals: Centered, backdrop blur

### Responsive Design
- **Mobile First** - All pages work on mobile
- **Breakpoints:**
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

### Performance Optimizations
- **Image Optimization** - Next.js Image component
- **Code Splitting** - Dynamic imports for heavy components
- **API Caching** - SWR or React Query for data fetching
- **Lazy Loading** - Load products/orders on scroll
- **Debounced Search** - Reduce API calls

---

## 🐛 BUG FIXES & IMPROVEMENTS

### Backend
1. ✅ Add role-based access control to all routes
2. ✅ Validate vendor owns shop before allowing updates
3. ✅ Add pagination to product/order lists
4. ✅ Add search & filters to vendor endpoints
5. ✅ Add image upload endpoint (or use external service)
6. ✅ Add email notifications for new orders
7. ✅ Add order status validation (can't skip statuses)

### Frontend
1. ✅ Add loading states to all API calls
2. ✅ Add error handling with toast notifications
3. ✅ Add form validation with clear error messages
4. ✅ Add confirmation dialogs for destructive actions
5. ✅ Add empty states for lists
6. ✅ Add skeleton loaders
7. ✅ Fix cart persistence across page reloads
8. ✅ Add optimistic UI updates

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Run database migrations
- [ ] Update environment variables
- [ ] Test all user flows (register, login, order)
- [ ] Test all vendor flows (add product, update order)
- [ ] Test role-based access control
- [ ] Test on mobile devices
- [ ] Set up error monitoring (Sentry)
- [ ] Set up analytics (Google Analytics)
- [ ] Configure CDN for images
- [ ] Set up automated backups
- [ ] Configure SSL certificate
- [ ] Set up CI/CD pipeline

---

## 📚 ADDITIONAL FEATURES (Future)

### Delivery Partner Dashboard
- Accept/reject delivery requests
- View assigned orders
- Update delivery status
- Track earnings

### Admin Dashboard
- Manage users, vendors, delivery partners
- View platform analytics
- Handle disputes
- Configure platform settings

### Advanced Features
- Real-time order tracking with maps
- Push notifications
- In-app chat (customer ↔ vendor)
- Loyalty program & rewards
- Promo codes & discounts
- Multi-language support
- Dark mode
- PWA (Progressive Web App)

---

## 🎯 PRIORITY ORDER

1. **CRITICAL** - Database migration (add role & owner_id)
2. **HIGH** - Update auth store & types with role
3. **HIGH** - Create vendor dashboard pages
4. **HIGH** - Add role-based navigation
5. **MEDIUM** - Implement route protection
6. **MEDIUM** - Add vendor product management UI
7. **MEDIUM** - Add vendor order management UI
8. **LOW** - Analytics & charts
9. **LOW** - Advanced features

---

## 💡 QUICK START COMMANDS

```bash
# 1. Apply database changes
docker compose exec postgres psql -U localwala -d localwala_db < migration.sql

# 2. Rebuild backend
docker compose up -d --build backend

# 3. Test vendor registration
curl -X POST http://localhost:8000/api/v1/auth/register-vendor \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Vendor",
    "email": "vendor@test.com",
    "phone": "9876543210",
    "password": "test1234",
    "shop_name": "Test Shop",
    "shop_category_id": 1,
    "shop_address": "123 Test St",
    "shop_latitude": 17.385,
    "shop_longitude": 78.4867
  }'

# 4. Test vendor login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "vendor@test.com", "password": "test1234"}'
```

---

This plan provides a complete roadmap to transform LocalWala into a production-ready hyperlocal delivery platform with separate User and Vendor dashboards!
