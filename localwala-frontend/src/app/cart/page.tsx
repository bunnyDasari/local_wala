"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { ordersApi } from "@/lib/api";
import { Spinner, EmptyState } from "@/components/shared";
import { ShoppingBag, Trash2, ArrowLeft, Minus, Plus, Tag, ChevronRight, MapPin } from "lucide-react";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const { cart, loading, fetchCart, updateItem, clearCart } = useCartStore();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [address, setAddress] = useState("Banjara Hills, Hyderabad — 500034");
  const [coupon, setCoupon] = useState("");

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleUpdate = async (itemId: number, qty: number) => {
    setUpdatingId(itemId);
    try { await updateItem(itemId, qty); }
    catch { toast.error("Failed to update"); }
    finally { setUpdatingId(null); }
  };

  const handleCheckout = async () => {
    if (!cart?.items.length) return;
    setCheckingOut(true);
    try {
      const order = await ordersApi.place(address);
      await fetchCart();
      toast.success("Order placed! 🎉");
      router.push(`/tracking?orderId=${order.id}`);
    } catch {
      toast.error("Please login to place an order");
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner />
    </div>
  );

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="max-w-2xl mx-auto pb-32 page-enter">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "var(--surface-3)" }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>My Cart</h1>
            {!isEmpty && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {cart.items.length} item{cart.items.length > 1 ? "s" : ""}
                {cart.shop_name && ` · ${cart.shop_name}`}
              </p>
            )}
          </div>
        </div>
        {!isEmpty && (
          <button
            onClick={() => clearCart()}
            className="text-xs font-semibold text-red-500 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-24 h-24 rounded-3xl bg-brand-50 flex items-center justify-center text-5xl">
            🛒
          </div>
          <div className="text-center">
            <p className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>Your cart is empty</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Browse shops and add items to get started
            </p>
          </div>
          <Link href="/shop" className="btn-primary flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Browse Shops
          </Link>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Cart Items */}
          <div className="rounded-3xl overflow-hidden" style={{ background: "var(--surface)" }}>
            {cart.items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-5 py-4"
                style={{
                  borderBottom: idx < cart.items.length - 1 ? "1px solid var(--border-soft)" : "none"
                }}
              >
                {/* Product image */}
                <div
                  className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
                  style={{ background: "var(--surface-3)" }}
                >
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🛍️</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight" style={{ color: "var(--text)" }}>
                    {item.product.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
                    per {item.product.unit}
                  </p>
                  <p className="font-bold text-sm mt-1 text-brand-600">
                    ₹{item.product.price}
                  </p>
                </div>

                {/* Qty stepper */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity - 1)}
                    disabled={updatingId === item.id}
                    className="w-8 h-8 rounded-full border-2 border-brand-500 flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm" style={{ color: "var(--text)" }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity + 1)}
                    disabled={updatingId === item.id}
                    className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Item total */}
                <p className="font-bold text-sm w-14 text-right shrink-0" style={{ color: "var(--text)" }}>
                  ₹{item.item_total.toFixed(0)}
                </p>
              </div>
            ))}
          </div>

          {/* Delivery Address */}
          <div className="rounded-3xl p-5" style={{ background: "var(--surface)" }}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-brand-500" />
              <p className="font-bold text-sm" style={{ color: "var(--text)" }}>Delivery Address</p>
            </div>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={2}
              className="input resize-none text-sm"
              placeholder="Enter your delivery address"
            />
          </div>

          {/* Coupon */}
          <div className="rounded-3xl p-5" style={{ background: "var(--surface)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-brand-500" />
              <p className="font-bold text-sm" style={{ color: "var(--text)" }}>Apply Coupon</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                placeholder="Enter coupon code"
                className="input flex-1 text-sm"
              />
              <button className="btn-outline text-sm px-4 py-2.5 whitespace-nowrap">
                Apply
              </button>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="rounded-3xl p-5 space-y-3" style={{ background: "var(--surface)" }}>
            <p className="font-bold" style={{ color: "var(--text)" }}>Bill Summary</p>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>
                  Subtotal ({cart.items.length} item{cart.items.length > 1 ? "s" : ""})
                </span>
                <span className="font-semibold" style={{ color: "var(--text)" }}>
                  ₹{cart.subtotal.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Delivery Fee</span>
                <span className="font-semibold text-green-600">₹{cart.delivery_fee}</span>
              </div>
              <div
                className="flex justify-between pt-3 border-t font-bold text-base"
                style={{ borderColor: "var(--border)" }}
              >
                <span style={{ color: "var(--text)" }}>Total</span>
                <span className="text-brand-600">₹{cart.total.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Free delivery progress */}
          {cart.delivery_fee > 0 && (
            <div
              className="rounded-3xl p-4 flex items-center gap-3"
              style={{ background: "var(--surface)" }}
            >
              <span className="text-xl">🛵</span>
              <div className="flex-1">
                <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Add ₹{Math.max(0, 200 - cart.subtotal).toFixed(0)} more for free delivery
                </p>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (cart.subtotal / 200) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sticky Checkout Button */}
      {!isEmpty && (
        <div className="cart-bar">
          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="w-full max-w-lg mx-auto flex items-center justify-between bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-lg disabled:opacity-70 active:scale-98 transition-transform"
          >
            <div>
              <p className="font-bold text-base">
                {checkingOut ? "Placing Order..." : "Proceed to Checkout"}
              </p>
              <p className="text-xs text-white/60">🔒 Secure • Cash on delivery</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">₹{cart.total.toFixed(0)}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
