"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ordersApi } from "@/lib/api";
import type { Order, OrderStatus } from "@/types";
import { Spinner, EmptyState } from "@/components/shared";
import { CheckCircle2, Clock, MapPin, ChevronDown } from "lucide-react";
import Link from "next/link";

const STAGES: { status: OrderStatus; label: string; icon: string; desc: string }[] = [
  { status: "Order Placed",               label: "Order Placed",    icon: "📋", desc: "We've received your order" },
  { status: "Vendor Preparing",           label: "Preparing",       icon: "👨‍🍳", desc: "Shop is packing your items" },
  { status: "Picked by Delivery Partner", label: "On the Way",      icon: "🛵", desc: "Rider is heading to you" },
  { status: "Delivered",                  label: "Delivered",       icon: "🎉", desc: "Enjoy your order!" },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  "Order Placed": 0, "Vendor Preparing": 1,
  "Picked by Delivery Partner": 2, "Delivered": 3, "Cancelled": -1,
};

function TrackingContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<{ id: number; shop_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(orderId ? parseInt(orderId) : null);

  const fetchOrder = useCallback(async (id: number) => {
    setLoading(true);
    try { setOrder(await ordersApi.get(id)); }
    catch { setOrder(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    ordersApi.list().then(list => {
      const active = list.filter(o => o.status !== "Delivered" && o.status !== "Cancelled");
      setOrders(active.map(o => ({ id: o.id, shop_name: o.shop_name })));
      const target = selected ?? active[0]?.id ?? null;
      if (target) { setSelected(target); fetchOrder(target); }
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { if (selected) fetchOrder(selected); }, [selected, fetchOrder]);
  useEffect(() => {
    if (!selected) return;
    const t = setInterval(() => fetchOrder(selected), 15000);
    return () => clearInterval(t);
  }, [selected, fetchOrder]);

  const handleAdvance = async () => {
    if (!order) return;
    const idx = STATUS_INDEX[order.status];
    const next = STAGES[idx + 1]?.status;
    if (!next) return;
    await ordersApi.updateStatus(order.id, next);
    fetchOrder(order.id);
  };

  const currentIdx = order ? STATUS_INDEX[order.status] : -1;

  return (
    <div className="pb-24 page-enter max-w-2xl mx-auto">
      <h1 className="text-2xl font-black mb-6" style={{ color: "var(--text)" }}>Track Order</h1>

      {/* Order selector */}
      {orders.length > 0 && (
        <div className="card p-4 mb-5">
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-3)" }}>
            Active Order
          </p>
          <div className="relative">
            <select
              value={selected ?? ""}
              onChange={e => setSelected(parseInt(e.target.value))}
              className="input appearance-none pr-10"
            >
              {orders.map(o => (
                <option key={o.id} value={o.id}>Order #{o.id} — {o.shop_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--text-3)" }} />
          </div>
        </div>
      )}

      {loading ? <Spinner /> : !order ? (
        <div className="space-y-6">
          <EmptyState icon="📦" title="No active orders" subtitle="Place an order to track it here." />
          <div className="flex justify-center">
            <Link href="/shop" className="btn-primary">Browse Shops</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status hero */}
          <div className="card p-6"
            style={{ background: "linear-gradient(135deg, #1a1a1a, #2a1a0a)", borderColor: "rgba(249,115,22,0.3)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: "var(--text-3)" }}>ORDER #{order.id}</span>
              {order.estimated_delivery && currentIdx < 3 && (
                <div className="flex items-center gap-1 text-xs font-bold" style={{ color: "var(--brand)" }}>
                  <Clock className="w-3.5 h-3.5" />
                  ETA: {new Date(order.estimated_delivery).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
            </div>
            <h2 className="text-2xl font-black text-white mb-1">
              {STAGES[Math.max(currentIdx, 0)].label}
            </h2>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
              {STAGES[Math.max(currentIdx, 0)].desc}
            </p>
            {currentIdx >= 0 && (
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${((currentIdx + 1) / 4) * 100}%`, background: "var(--brand)", boxShadow: "var(--shadow-brand)" }} />
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="card p-6">
            <h3 className="font-black mb-5" style={{ color: "var(--text)" }}>Order Journey</h3>
            <div className="space-y-0">
              {STAGES.map((stage, i) => {
                const done = currentIdx > i;
                const active = currentIdx === i;
                return (
                  <div key={stage.status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 transition-all"
                        style={{
                          background: done ? "rgba(34,197,94,0.15)" : active ? "rgba(249,115,22,0.15)" : "var(--bg-input)",
                          border: active ? "2px solid var(--brand)" : "2px solid transparent",
                        }}>
                        {done ? <CheckCircle2 className="w-5 h-5" style={{ color: "var(--green)" }} /> : stage.icon}
                      </div>
                      {i < STAGES.length - 1 && (
                        <div className="w-0.5 h-10 mt-1 rounded-full"
                          style={{ background: done ? "var(--green)" : "var(--border)" }} />
                      )}
                    </div>
                    <div className="pb-8 pt-2 min-w-0">
                      <p className="font-bold text-sm"
                        style={{ color: active ? "var(--brand)" : done ? "var(--text)" : "var(--text-3)" }}>
                        {stage.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div className="card p-5">
            <h3 className="font-black mb-3" style={{ color: "var(--text)" }}>Delivery Details</h3>
            <div className="flex items-start gap-3 text-sm mb-2" style={{ color: "var(--text-2)" }}>
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
              <span>{order.delivery_address}</span>
            </div>
            <div className="flex justify-between text-sm pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-3)" }}>{order.items.length} item(s)</span>
              <span className="font-black" style={{ color: "var(--brand)" }}>₹{order.total_amount.toFixed(0)}</span>
            </div>
          </div>

          {/* Demo advance */}
          {currentIdx >= 0 && currentIdx < 3 && (
            <div className="card p-4" style={{ borderColor: "rgba(249,115,22,0.3)" }}>
              <p className="text-xs mb-2" style={{ color: "var(--text-3)" }}>🧪 Demo: Simulate next status</p>
              <button onClick={handleAdvance} className="btn-primary w-full text-sm py-3">
                Advance to: {STAGES[currentIdx + 1]?.label}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <TrackingContent />
    </Suspense>
  );
}
