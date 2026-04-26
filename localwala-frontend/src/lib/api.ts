import axios, { AxiosError } from "axios";
import type {
  TokenResponse, Category, ShopList, Shop,
  Product, Cart, Order, OrderListItem,
  VendorShop, VendorProduct, VendorOrder, VendorAnalytics,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  timeout: 10000,
});

// Attach token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("lw_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Normalize any FastAPI/network error into a plain string ──────────────────
function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data;

    if (!data) return err.message ?? "Network error";

    // FastAPI validation errors: { detail: [ { msg, loc, ... } ] }
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((e: { msg?: string; loc?: string[] }) =>
          [e.loc?.slice(1).join(" → "), e.msg].filter(Boolean).join(": ")
        )
        .join(" | ");
    }

    // FastAPI string detail: { detail: "some message" }
    if (typeof data.detail === "string") return data.detail;

    // FastAPI object detail: { detail: { error: "...", reason: "..." } }
    if (typeof data.detail === "object" && data.detail !== null) {
      return data.detail.reason ?? data.detail.error ?? JSON.stringify(data.detail);
    }

    // Fallback
    return JSON.stringify(data);
  }

  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

// Auto-logout on 401
api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("lw_token");
      localStorage.removeItem("lw_user");
      window.location.href = "/";
    }
    // Attach a clean message so callers can do err.message directly
    const clean = extractErrorMessage(err);
    err.message = clean;
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
// export const authApi = {
//   register: (data: { name: string; email: string; phone: string; password: string; address?: string }) =>
//     api.post<TokenResponse>("/auth/register", data).then((r) => r.data),

//   login: (email: string, password: string) =>
//     api.post<TokenResponse>("/auth/login", { email, password }).then((r) => r.data),
// };

export const authApi = {
  register: (data: {
    name: string; email: string; phone: string; password: string; address?: string; role?: string;
  }) => api.post<TokenResponse>("/auth/register", { ...data, role: data.role || "user" }).then((r) => r.data),

  login: (email: string, password: string) =>
    api.post<TokenResponse>("/auth/login", { email, password }).then((r) => r.data),

  // Phone OTP
  sendOtp: (phone: string) =>
    api
      .post<{ success: boolean; is_new_user: boolean; message: string }>(
        "/auth/phone/send-otp",
        { phone }
      )
      .then((r) => r.data),

  verifyOtp: (phone: string, otp: string, name?: string) =>
    api
      .post<TokenResponse>("/auth/phone/verify-otp", { phone, otp, name })
      .then((r) => r.data),
};

// ─── Shops ─────────────────────────────────────────────────────────────────
export const shopsApi = {
  getCategories: () =>
    api.get<Category[]>("/shops/categories").then((r) => r.data),

  getNearby: (lat = 17.385, lng = 78.4867, categoryId?: number, radiusKm = 10) =>
    api
      .get<ShopList>("/shops/nearby", {
        params: { lat, lng, category_id: categoryId, radius_km: radiusKm },
      })
      .then((r) => r.data),

  getShop: (id: number) =>
    api.get<Shop>(`/shops/${id}`).then((r) => r.data),
};

// ─── Products ──────────────────────────────────────────────────────────────
export const productsApi = {
  getByShop: (shopId: number) =>
    api.get<Product[]>(`/products/shop/${shopId}`).then((r) => r.data),
};

// ─── Cart ──────────────────────────────────────────────────────────────────
export const cartApi = {
  get: () => api.get<Cart>("/cart").then((r) => r.data),

  add: (productId: number, quantity = 1) =>
    api.post<Cart>("/cart/add", { product_id: productId, quantity }).then((r) => r.data),

  update: (itemId: number, quantity: number) =>
    api.patch<Cart>(`/cart/${itemId}`, { quantity }).then((r) => r.data),

  clear: () => api.delete<Cart>("/cart/clear").then((r) => r.data),
};

// ─── Orders ────────────────────────────────────────────────────────────────
export const ordersApi = {
  place: (deliveryAddress: string, deliveryNotes?: string) =>
    api
      .post<Order>("/orders", { delivery_address: deliveryAddress, delivery_notes: deliveryNotes })
      .then((r) => r.data),

  list: () => api.get<OrderListItem[]>("/orders").then((r) => r.data),

  get: (id: number) => api.get<Order>(`/orders/${id}`).then((r) => r.data),

  updateStatus: (id: number, status: string) =>
    api.patch<Order>(`/orders/${id}/status`, null, { params: { status } }).then((r) => r.data),
};

// ─── Vendor ────────────────────────────────────────────────────────────────
export const vendorApi = {
  // Shop management
  getShop: () => api.get<VendorShop>("/vendor/shop").then((r) => r.data),
  
  updateShop: (data: Partial<VendorShop>) =>
    api.patch<VendorShop>("/vendor/shop", data).then((r) => r.data),

  // Product management
  getProducts: () => api.get<VendorProduct[]>("/vendor/products").then((r) => r.data),
  
  createProduct: (data: {
    name: string;
    description?: string;
    price: number;
    original_price?: number;
    unit: string;
    stock: number;
    image_url?: string;
  }) => api.post<VendorProduct>("/vendor/products", data).then((r) => r.data),
  
  updateProduct: (id: number, data: Partial<VendorProduct>) =>
    api.patch<VendorProduct>(`/vendor/products/${id}`, data).then((r) => r.data),
  
  deleteProduct: (id: number) =>
    api.delete(`/vendor/products/${id}`).then((r) => r.data),

  // Order management
  getOrders: () => api.get<VendorOrder[]>("/vendor/orders").then((r) => r.data),
  
  updateOrderStatus: (id: number, status: string) =>
    api.patch<VendorOrder>(`/vendor/orders/${id}/status`, null, { params: { status } }).then((r) => r.data),

  // Analytics
  getAnalytics: () => api.get<VendorAnalytics>("/vendor/analytics").then((r) => r.data),
};

export { extractErrorMessage };
export default api;