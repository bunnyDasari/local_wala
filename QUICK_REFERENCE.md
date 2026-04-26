# LocalWala - Quick Reference Guide

## 🚀 Quick Start

### Start Application
```bash
cd local_wala
docker-compose up -d
```

### Access Points
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432

### Stop Application
```bash
docker-compose down
```

---

## 👤 User Roles

### Customer (Default)
- Browse shops
- Add to cart
- Place orders
- Track orders

### Vendor (Shop Owner)
- Manage shop profile
- Add/edit products
- Handle orders
- View analytics

---

## 🔑 Demo Accounts

### Existing Customer
- Email: `demo@localwala.in`
- Password: `demo1234`
- Role: Customer

### Create New Vendor
1. Go to http://localhost:8080
2. Click "Register"
3. Select "🏪 Shop Owner"
4. Fill form and submit

---

## 📱 Vendor Dashboard Features

### 1. Dashboard (`/vendor/dashboard`)
- Today's orders & revenue
- Pending orders
- Total products & orders
- Shop rating & reviews

### 2. My Shop (`/vendor/shop`)
- Shop name & description
- Shop image
- Contact phone
- Address
- Delivery settings
- Open/Close toggle

### 3. Products (`/vendor/products`)
- Add new products
- Edit products
- Delete products
- Toggle availability
- Set prices & stock

### 4. Orders (`/vendor/orders`)
- View all orders
- Filter by status
- Update order status
- View customer details

---

## 🛒 Customer Dashboard Features

### 1. Dashboard (`/dashboard`)
- Browse nearby shops
- Filter by category
- View shop ratings

### 2. Shop (`/shop`)
- View all shops
- Shop details
- Product listings

### 3. Cart (`/cart`)
- View cart items
- Update quantities
- Checkout

### 4. Orders (`/orders`)
- Order history
- Order details
- Track status

### 5. Track Order (`/tracking`)
- Real-time tracking
- Order status updates

---

## 🔐 Authentication Flow

### Registration
1. Click "Register" tab
2. Choose role:
   - 🛒 Customer (default)
   - 🏪 Shop Owner
3. Fill details
4. Submit
5. Auto-login & redirect

### Login (Email/Password)
1. Click "Login" tab
2. Enter email & password
3. Submit
4. Redirect based on role

### Login (Phone OTP)
1. Click "Login" tab
2. Enter phone number
3. Click "Send OTP"
4. Enter 6-digit OTP
5. Submit
6. Redirect based on role

---

## 🎨 UI Components

### Navigation
- **Desktop**: Left sidebar
- **Mobile**: Bottom navigation bar
- **Role-based**: Different menus for vendors/customers

### Modals
- Auth modal (login/register)
- Product add/edit modal
- Confirmation dialogs

### Notifications
- Toast messages (top-right)
- Success (green)
- Error (red)
- Info (blue)

### Loading States
- Spinner for async operations
- Skeleton loaders
- Disabled buttons during save

---

## 🔧 Common Tasks

### Add a Product (Vendor)
1. Go to Products page
2. Click "Add Product"
3. Fill form:
   - Name, description
   - Image URL
   - Price, unit, stock
4. Click "Add Product"

### Update Shop Details (Vendor)
1. Go to My Shop page
2. Edit any field
3. Click "Save Changes"

### Update Order Status (Vendor)
1. Go to Orders page
2. Find order
3. Click status button
4. Confirm

### Place an Order (Customer)
1. Browse shops
2. Select shop
3. Add items to cart
4. Go to cart
5. Checkout

---

## 📊 API Endpoints

### Auth
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/phone/send-otp
POST /api/v1/auth/phone/verify-otp
```

### Vendor
```
GET    /api/v1/vendor/shop
PATCH  /api/v1/vendor/shop
GET    /api/v1/vendor/products
POST   /api/v1/vendor/products
PATCH  /api/v1/vendor/products/{id}
DELETE /api/v1/vendor/products/{id}
GET    /api/v1/vendor/orders
PATCH  /api/v1/vendor/orders/{id}/status
GET    /api/v1/vendor/analytics
```

### Customer
```
GET    /api/v1/shops/nearby
GET    /api/v1/shops/{id}
GET    /api/v1/products/shop/{id}
GET    /api/v1/cart
POST   /api/v1/cart/add
PATCH  /api/v1/cart/{id}
DELETE /api/v1/cart/clear
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/{id}
```

---

## 🐛 Troubleshooting

### "Failed to load shop"
- Vendor account needs shop linkage
- Check backend logs
- Verify database connection

### "401 Unauthorized"
- Token expired or invalid
- Logout and login again
- Clear localStorage

### "Network Error"
- Check Docker containers: `docker ps`
- Check backend logs: `docker logs localwala_backend`
- Verify API: http://localhost:8000/docs

### Images not showing
- Use valid image URLs
- Try Unsplash URLs
- Check browser console

### Page not loading
- Check frontend logs: `docker logs localwala_frontend`
- Clear browser cache
- Try incognito mode

---

## 🔍 Debugging

### Check Container Status
```bash
docker ps
```

### View Backend Logs
```bash
docker logs localwala_backend -f
```

### View Frontend Logs
```bash
docker logs localwala_frontend -f
```

### View Database Logs
```bash
docker logs localwala_postgres -f
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild Containers
```bash
docker-compose down
docker-compose up -d --build
```

---

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
REDIS_URL=redis://...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 🎯 Key Features

### ✅ Implemented
- Role-based authentication
- Vendor dashboard (complete)
- Customer dashboard (complete)
- Product management
- Order management
- Shop management
- Analytics
- Responsive design
- Dark mode
- Real-time updates

### 🔮 Future (Optional)
- Image upload
- Payment gateway
- Delivery partner role
- Push notifications
- Chat system
- Advanced analytics

---

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (bottom nav)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px (sidebar)

---

## 🎨 Theme

### Colors
- **Brand**: Orange (#F97316)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Yellow (#F59E0B)

### Dark Mode
- Auto-detects system preference
- Toggle in top bar
- Persisted in localStorage

---

## 📚 Documentation Files

- `README.md` - Project overview
- `IMPLEMENTATION_SUMMARY.md` - Complete feature list
- `VENDOR_IMPLEMENTATION_COMPLETE.md` - Vendor features
- `TEST_VENDOR_SYSTEM.md` - Testing guide
- `QUICK_REFERENCE.md` - This file
- `STATUS.md` - Current status
- `SETUP_COMPLETE.md` - Setup guide

---

## 🚀 Deployment

### Production Checklist
- [ ] Update environment variables
- [ ] Configure domain
- [ ] Setup SSL certificate
- [ ] Configure CORS
- [ ] Setup monitoring
- [ ] Configure backups
- [ ] Test all features
- [ ] Load testing

### Docker Compose Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Support

### Check Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker logs <container_name> -f
```

### Database Access
```bash
docker exec -it localwala_postgres psql -U localwala -d localwala
```

### Redis Access
```bash
docker exec -it localwala_redis redis-cli
```

---

## ✨ Tips & Tricks

1. **Use Incognito**: Test different roles simultaneously
2. **Check Network Tab**: Debug API calls
3. **Use Console**: Check for errors
4. **Test Mobile**: Use DevTools device mode
5. **Clear Cache**: If things look broken
6. **Check Logs**: First step in debugging
7. **Use API Docs**: Test endpoints at /docs
8. **Seed Data**: Use existing demo shops/products

---

**Quick Access**: http://localhost:8080
**API Docs**: http://localhost:8000/docs
**Status**: Production Ready ✅
