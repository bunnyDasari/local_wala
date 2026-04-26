export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  name: string;
  role: string;
}

export type UserRole = "user" | "vendor" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  address?: string;
  latitude: number;
  longitude: number;
  created_at: string;
}
export interface Category { id: number; name: string; icon: string; color: string; }
export interface Shop { id: number; name: string; description?: string; image_url?: string; category: Category; owner_name?: string; phone?: string; address?: string; rating: number; total_reviews: number; delivery_time_min: number; delivery_fee: number; min_order: number; is_open: boolean; distance_km?: number; }
export interface Product { id: number; name: string; description?: string; image_url?: string; price: number; original_price?: number; unit: string; stock: number; is_available: boolean; }
export interface CartItem { id: number; product: Product; quantity: number; item_total: number; }
export interface Cart { items: CartItem[]; subtotal: number; delivery_fee: number; total: number; shop_id?: number; shop_name?: string; }
export type OrderStatus = "Order Placed" | "Vendor Preparing" | "Picked by Delivery Partner" | "Delivered" | "Cancelled";
export interface OrderItem { id: number; product: Product; quantity: number; unit_price: number; total_price: number; }
export interface Order { id: number; status: OrderStatus; subtotal: number; delivery_fee: number; total_amount: number; delivery_address: string; delivery_notes?: string; placed_at: string; delivered_at?: string; estimated_delivery?: string; shop: Shop; items: OrderItem[]; }
export interface OrderListItem { id: number; status: OrderStatus; total_amount: number; placed_at: string; shop_name: string; item_count: number; }
export interface ShopList {
  shops: Shop[];
  total: number;
}

// ─── Vendor Types ──────────────────────────────────────────────────────────
export interface VendorShop {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  category: Category;
  phone?: string;
  address?: string;
  rating: number;
  total_reviews: number;
  delivery_time_min: number;
  delivery_fee: number;
  min_order: number;
  is_open: boolean;
  is_active: boolean;
}

export interface VendorProduct {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  price: number;
  original_price?: number;
  unit: string;
  stock: number;
  is_available: boolean;
  created_at: string;
}

export interface VendorOrder {
  id: number;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  delivery_address: string;
  delivery_notes?: string;
  placed_at: string;
  delivered_at?: string;
  user: User;
  items: OrderItem[];
}

export interface VendorAnalytics {
  total_orders: number;
  total_revenue: number;
  today_orders: number;
  today_revenue: number;
  pending_orders: number;
  total_products: number;
  shop_rating: number;
  total_reviews: number;
}