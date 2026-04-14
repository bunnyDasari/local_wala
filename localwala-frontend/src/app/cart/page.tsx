"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { ordersApi } from "@/lib/api";
import { Spinner, EmptyState, QuantityStepper } from "@/components/shared";
import { ShoppingBag, Trash2, ArrowRight, Tag } from "lucide-react";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const { cart, loading, fetchCart, updateItem, clearCart } = useCartStore();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [address, setAddress]         = useState("Banjara Hills, Hyderabad — 500034");

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleUpdate = async (itemId: number, qty: number) => {
    setUpdatingId(itemId);
    try { await updateItem(itemId, qty); }
    catch { toast.error("Failed to update cart"); }
    finally { setUpdatingId(null); }
  };

  const handleCheckout = async () => {
    if (!cart?.items.length) return;
    setCheckingOut(true);
    try {
      const order = await ordersApi.place(address);
      await fetchCart();
      toast.success("Order placed successfully! 🎉");
      router.push(`/tracking?orderId=${order.id}`);
    } catch {
      toast.error("Please login to place an order");
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return <Spinner />;

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="pb-24 md:pb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
        {!isEmpty && (
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="space-y-4">
          <EmptyState icon="🛒" title="Your cart is empty" subtitle="Browse shops and add items to get started." />
          <div className="flex justify-center">
            <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Browse Shops
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.shop_name && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <span className="text-base">🏪</span>
                <span>Ordering from <strong className="text-gray-800">{cart.shop_name}</strong></span>
              </div>
            )}

            {cart.items.map((item) => (
              <div key={item.id} className="card p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl shrink-0">🛍️</div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">{item.product.name}</h3>
                  <p className="text-xs text-gray-400">per {item.product.unit}</p>
                  <p className="text-sm font-bold text-brand-600 mt-1">₹{item.product.price}</p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <QuantityStepper
                    quantity={item.quantity}
                    loading={updatingId === item.id}
                    onDecrement={() => handleUpdate(item.id, item.quantity - 1)}
                    onIncrement={() => handleUpdate(item.id, item.quantity + 1)}
                  />
                  <p className="text-sm font-bold text-gray-900">₹{item.item_total.toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="card p-4">
              <div className="flex items-center gap-2 text-sm text-brand-600 font-semibold mb-3">
                <Tag className="w-4 h-4" /> Apply Coupon
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
                  placeholder="Enter coupon code"
                />
                <button className="btn-outline text-sm px-3 py-2">Apply</button>
              </div>
            </div>

            {/* Bill */}
            <div className="card p-5 space-y-3">
              <h3 className="font-bold text-gray-900">Bill Summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>₹{cart.subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">₹{cart.delivery_fee}</span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between font-bold text-base text-gray-900">
                  <span>Total</span>
                  <span>₹{cart.total.toFixed(0)}</span>
                </div>
              </div>

              {/* Address */}
              <div className="mt-3">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Delivery Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
                />
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full btn-primary flex items-center justify-center gap-2 mt-2"
              >
                {checkingOut ? "Placing Order..." : (
                  <><span>Proceed to Checkout</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-[11px] text-center text-gray-400 mt-1">🔒 Secure checkout • Cash on delivery</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
