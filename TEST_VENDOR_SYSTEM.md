# Testing the Vendor System

## Quick Test Guide

### 1. Access the Application
Open your browser and go to: **http://localhost:8080**

### 2. Test Vendor Registration

#### Step 1: Open Registration
1. Click on the "Register" tab in the auth modal
2. You should see two role options:
   - 🛒 **Customer** (default)
   - 🏪 **Shop Owner**

#### Step 2: Register as Vendor
1. Click on "🏪 Shop Owner"
2. Fill in the form:
   - **Full Name**: Test Vendor
   - **Email**: vendor@test.com
   - **Phone Number**: 9876543210
   - **Password**: test1234
3. Click "Create Account 🎉"

#### Step 3: Verify Vendor Dashboard
After registration, you should be automatically redirected to the vendor dashboard at `/vendor/dashboard`

You should see:
- Analytics cards showing:
  - Today's Orders
  - Today's Revenue
  - Pending Orders
  - Total Products
  - Total Orders
  - Total Revenue
  - Shop Rating
  - Total Reviews
- Quick Stats section
- Shop Performance section

### 3. Test Vendor Navigation

Check the sidebar - you should see vendor-specific navigation:
- ✅ **Dashboard** - Analytics overview
- ✅ **My Shop** - Shop management
- ✅ **Products** - Product inventory
- ✅ **Orders** - Order management

### 4. Test Shop Management

1. Click on "My Shop" in the sidebar
2. You should see a form to manage your shop:
   - Shop Name
   - Description
   - Shop Image URL
   - Contact Phone
   - Shop Address
   - Delivery Time (minutes)
   - Delivery Fee (₹)
   - Minimum Order (₹)
   - Shop Status (Open/Closed toggle)
3. Try updating any field and click "Save Changes"
4. You should see a success toast: "Shop updated successfully! 🎉"

### 5. Test Product Management

1. Click on "Products" in the sidebar
2. Click "Add Product" button
3. Fill in the product form:
   - **Product Name**: Fresh Tomatoes
   - **Description**: Locally grown organic tomatoes
   - **Image URL**: https://images.unsplash.com/photo-1546470427-227e9e3e0e4e?w=400
   - **Price**: 40
   - **Original Price**: 50
   - **Unit**: kg
   - **Stock**: 100
4. Click "Add Product"
5. You should see the product card appear
6. Try:
   - Clicking "Edit" to modify the product
   - Toggling "Active/Inactive" status
   - Clicking the trash icon to delete (with confirmation)

### 6. Test Order Management

1. Click on "Orders" in the sidebar
2. You should see order filter tabs:
   - All
   - Order Placed
   - Vendor Preparing
   - Picked by Delivery Partner
   - Delivered
   - Cancelled
3. If there are orders, you should see:
   - Order details with customer info
   - Order items with images
   - Order summary (subtotal, delivery, total)
   - Status update buttons
4. Try updating an order status by clicking the status buttons

### 7. Test Customer Registration (Separate Browser/Incognito)

1. Open a new incognito window or different browser
2. Go to http://localhost:8080
3. Click "Register" tab
4. Keep "🛒 Customer" selected (default)
5. Fill in the form:
   - **Full Name**: Test Customer
   - **Email**: customer@test.com
   - **Phone Number**: 9876543211
   - **Password**: test1234
6. Click "Create Account 🎉"
7. You should be redirected to the customer dashboard at `/dashboard`
8. Check the sidebar - you should see customer navigation:
   - Dashboard
   - Shop
   - Cart (with badge if items)
   - Track Order
   - My Orders

### 8. Test Role-Based Redirects

#### Test 1: Vendor accessing customer pages
1. As a logged-in vendor, try to go to `/dashboard`
2. You should be automatically redirected to `/vendor/dashboard`

#### Test 2: Customer accessing vendor pages
1. As a logged-in customer, try to go to `/vendor/dashboard`
2. You should be automatically redirected to `/dashboard`

#### Test 3: Non-authenticated user accessing vendor pages
1. Logout
2. Try to go to `/vendor/dashboard`
3. You should be redirected to home page

### 9. Test API Integration

Open browser console (F12) and check:
1. Network tab should show successful API calls:
   - `POST /api/v1/auth/register` (201 Created)
   - `GET /api/v1/vendor/shop` (200 OK)
   - `GET /api/v1/vendor/analytics` (200 OK)
   - `GET /api/v1/vendor/products` (200 OK)
   - `GET /api/v1/vendor/orders` (200 OK)
2. No 401 Unauthorized errors
3. No 403 Forbidden errors

### 10. Test Responsive Design

1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)
4. Check:
   - Navigation switches to bottom bar on mobile
   - Cards stack properly
   - Forms are usable
   - Modals are responsive

## Expected Results

### ✅ Vendor Features Working:
- [x] Role selection in registration
- [x] Vendor dashboard with analytics
- [x] Shop management (CRUD)
- [x] Product management (CRUD)
- [x] Order management with status updates
- [x] Role-based navigation
- [x] Route protection
- [x] Automatic redirects

### ✅ Customer Features Working:
- [x] Customer registration
- [x] Customer dashboard
- [x] Browse shops
- [x] Shopping cart
- [x] Order placement
- [x] Order tracking

### ✅ Security & UX:
- [x] JWT authentication
- [x] Role-based access control
- [x] Loading states
- [x] Error handling
- [x] Toast notifications
- [x] Responsive design
- [x] Dark mode support

## Troubleshooting

### Issue: "Failed to load shop"
**Solution**: The vendor account needs to be linked to a shop. This happens automatically when a vendor registers, but if you're using an existing account, you may need to create a shop entry in the database.

### Issue: "401 Unauthorized"
**Solution**: 
1. Check if token is stored in localStorage
2. Try logging out and logging back in
3. Check browser console for errors

### Issue: "Network Error"
**Solution**:
1. Verify all Docker containers are running: `docker ps`
2. Check backend logs: `docker logs localwala_backend`
3. Verify API is accessible: http://localhost:8000/docs

### Issue: Images not showing
**Solution**: Make sure you're using valid image URLs. Try using Unsplash URLs:
- `https://images.unsplash.com/photo-1546470427-227e9e3e0e4e?w=400` (tomatoes)
- `https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400` (vegetables)
- `https://images.unsplash.com/photo-1542838132-92c53300491e?w=400` (groceries)

## API Endpoints Reference

### Vendor Endpoints
```
GET    /api/v1/vendor/shop              # Get vendor's shop
PATCH  /api/v1/vendor/shop              # Update shop
GET    /api/v1/vendor/products          # List products
POST   /api/v1/vendor/products          # Create product
PATCH  /api/v1/vendor/products/{id}     # Update product
DELETE /api/v1/vendor/products/{id}     # Delete product
GET    /api/v1/vendor/orders            # List orders
PATCH  /api/v1/vendor/orders/{id}/status # Update order status
GET    /api/v1/vendor/analytics         # Get analytics
```

### Auth Endpoints
```
POST   /api/v1/auth/register            # Register (with role)
POST   /api/v1/auth/login               # Login
POST   /api/v1/auth/phone/send-otp      # Send OTP
POST   /api/v1/auth/phone/verify-otp    # Verify OTP
```

## Success Criteria

The vendor system is working correctly if:
1. ✅ You can register as both customer and vendor
2. ✅ Vendors see vendor dashboard and navigation
3. ✅ Customers see customer dashboard and navigation
4. ✅ Vendors can manage shop, products, and orders
5. ✅ Role-based redirects work properly
6. ✅ All API calls succeed (check Network tab)
7. ✅ No console errors
8. ✅ Responsive on all screen sizes
9. ✅ Toast notifications appear for actions
10. ✅ Loading states show during async operations

## Demo Video Script

1. Show registration with role selection
2. Register as vendor
3. Show vendor dashboard with analytics
4. Navigate to "My Shop" and update details
5. Navigate to "Products" and add a product
6. Navigate to "Orders" and show order management
7. Logout
8. Register as customer in incognito
9. Show customer dashboard
10. Show role-based navigation differences
11. Try accessing vendor pages as customer (should redirect)
12. Show responsive design on mobile

---

**Status**: All features implemented and ready for testing! 🎉
