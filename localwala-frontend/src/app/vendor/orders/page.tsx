"use client";
import { useEffect, useState } from "react";
import { vendorApi } from "@/lib/api";
import type { VendorOrder, OrderStatus } from "@/types";
import { ShoppingBag, Loader2, MapPin, User, Phone, Clock } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_OPTIONS: OrderStatus[] = [
  "Order Placed", "Vendor Preparing", "Picked by Delivery Partner", "Delivered", "Cancelled",
];

const STATUS_STYLE: Record<OrderStatus, { bg: string; color: string }> = {
  "Order Placed":               { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa" },
  "Vendor Preparing":           { bg: "rgba(234,179,8,0.15)",   color: "#facc15" },
  "Picked by Delivery Partner": { bg: "rgba(168,85,247,0.15)",  color: "#c084fc" },
  "Delivered":                  { bg: "rgba(34,197,94,0.15)",   color: "#4ade80" },
  "Cancelled":                  { bg: "rgba(239,68,68,0.15)",   color: "#f87171" },
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    vendorApi.getOrders()
      .then(setOrders)
      .catch(err => toast.error(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId: number, status: OrderStatus) => {
    try {
      const updated = await vendorApi.updateOrderStatus(orderId, status);
      setOrders(orders.map(o => o.id === updated.id ? updated : o));
      toast.success(`Status → ${status}`);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand)" }} />
    </div>
  );

  return (
    <div className="space-y-5 pb-8 page-enter">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: "var(--text)" }}>
          <ShoppingBag className="w-6 h-6" style={{ color: "var(--brand)" }} /> Orders
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
          {orders.length} total orders
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilter("all")}
          className="px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all"
          style={{
            background: filter === "all" ? "var(--brand)" : "var(--bg-input)",
            color: filter === "all" ? "white" : "var(--text-3)",
            boxShadow: filter === "all" ? "var(--shadow-brand)" : "none",
          }}>
          All ({orders.length})
        </button>
        {STATUS_OPTIONS.map(s => {
          const count = orders.filter(o => o.status === s).length;
          const active = filter === s;
          return (
            <button key={s} onClick={() => setFilter(s)}
              className="px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all"
              style={{
                background: active ? "var(--brand)" : "var(--bg-input)",
                color: active ? "white" : "var(--text-3)",
                boxShadow: active ? "var(--shadow-brand)" : "none",
              }}>
              {s.split(" ")[0]} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--text-3)" }} />
          <p className="font-black text-lg" style={{ color: "var(--text)" }}>No orders found</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
            {filter === "all" ? "No orders yet" : `No ${filter} orders`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const ss = STATUS_STYLE[order.status];
            return (
              <div key={order.id} className="card p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black" style={{ color: "var(--text)" }}>Order #{order.id}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: ss.bg, color: ss.color }}>
                        {order.status}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-3)" }}>
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.placed_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black" style={{ color: "var(--brand)" }}>
                      ₹{order.total_amount.toFixed(0)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Customer */}
                <div className="rounded-2xl p-4 mb-4 space-y-2" style={{ background: "var(--bg-input)" }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-3)" }}>
                    Customer
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <span className="flex items-center gap-2" style={{ color: "var(--text-2)" }}>
                      <User className="w-4 h-4" style={{ color: "var(--brand)" }} /> {order.user.name}
                    </span>
                    <span className="flex items-center gap-2" style={{ color: "var(--text-2)" }}>
                      <Phone className="w-4 h-4" style={{ color: "var(--brand)" }} /> {order.user.phone}
                    </span>
                    <span className="flex items-start gap-2 md:col-span-2" style={{ color: "var(--text-2)" }}>
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
                      {order.delivery_address}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl"
                      style={{ background: "var(--bg-input)" }}>
                      <div className="flex items-center gap-3">
                        {item.product.image_url ? (
                          <img src={item.product.image_url} alt={item.product.name}
                            className="w-10 h-10 object-cover rounded-xl" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                            style={{ background: "var(--bg-card)" }}>🛍️</div>
                        )}
                        <div>
                          <p className="font-bold text-sm" style={{ color: "var(--text)" }}>{item.product.name}</p>
                          <p className="text-xs" style={{ color: "var(--text-3)" }}>
                            {item.quantity} × ₹{item.unit_price.toFixed(0)}
                          </p>
                        </div>
                      </div>
                      <p className="font-black" style={{ color: "var(--brand)" }}>₹{item.total_price.toFixed(0)}</p>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="space-y-1.5 mb-4 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                  {[
                    { label: "Subtotal", value: `₹${order.subtotal.toFixed(0)}` },
                    { label: "Delivery", value: `₹${order.delivery_fee.toFixed(0)}` },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-3)" }}>{r.label}</span>
                      <span style={{ color: "var(--text-2)" }}>{r.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-black pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text)" }}>Total</span>
                    <span style={{ color: "var(--brand)" }}>₹{order.total_amount.toFixed(0)}</span>
                  </div>
                </div>

                {/* Status update */}
                {order.status !== "Delivered" && order.status !== "Cancelled" && (
                  <div>
                    <p className="text-xs font-bold mb-2" style={{ color: "var(--text-3)" }}>Update Status</p>
                    <div className="flex gap-2 flex-wrap">
                      {STATUS_OPTIONS.filter(s => s !== "Cancelled").map(s => {
                        const active = order.status === s;
                        const style = STATUS_STYLE[s];
                        return (
                          <button key={s} onClick={() => updateStatus(order.id, s)} disabled={active}
                            className="px-3 py-1.5 rounded-2xl text-xs font-bold transition-all"
                            style={{
                              background: active ? style.bg : "var(--bg-input)",
                              color: active ? style.color : "var(--text-3)",
                            }}>
                            {s}
                          </button>
                        );
                      })}
                      <button onClick={() => updateStatus(order.id, "Cancelled")}
                        className="px-3 py-1.5 rounded-2xl text-xs font-bold"
                        style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
