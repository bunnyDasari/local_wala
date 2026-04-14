"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ordersApi } from "@/lib/api";
import type { Order, OrderStatus } from "@/types";
import { Spinner, EmptyState } from "@/components/shared";
import { CheckCircle2, Circle, Clock, MapPin, Phone, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

const STAGES: { status: OrderStatus; label: string; icon: string; desc: string }[] = [
  { status: "Order Placed",               label: "Order Placed",             icon: "📋", desc: "We've received your order" },
  { status: "Vendor Preparing",           label: "Vendor Preparing",         icon: "👨‍🍳", desc: "Shop is packing your items" },
  { status: "Picked by Delivery Partner", label: "Picked Up",                icon: "🛵", desc: "On the way to you" },
  { status: "Delivered",                  label: "Delivered",                icon: "🎉", desc: "Enjoy your order!" },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  "Order Placed":               0,
  "Vendor Preparing":           1,
  "Picked by Delivery Partner": 2,
  "Delivered":                  3,
  "Cancelled":                  -1,
};

export default function TrackingPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  const [order, setOrder]     = useState<Order | null>(null);
  const [orders, setOrders]   = useState<{ id: number; shop_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(orderId ? parseInt(orderId) : null);

  const fetchOrder = useCallback(async (id: number) => {
    setLoading(true);
    try { setOrder(await ordersApi.get(id)); }
    catch { setOrder(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    ordersApi.list().then((list) => {
      const active = list.filter(o => o.status !== "Delivered" && o.status !== "Cancelled");
      setOrders(active.map(o => ({ id: o.id, shop_name: o.shop_name })));
      const target = selected ?? active[0]?.id ?? null;
      if (target) { setSelected(target); fetchOrder(target); }
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { if (selected) fetchOrder(selected); }, [selected, fetchOrder]);

  // Auto-refresh every 15s for live tracking feel
  useEffect(() => {
    if (!selected) return;
    const t = setInterval(() => fetchOrder(selected), 15000);
    return () => clearInterval(t);
  }, [selected, fetchOrder]);

  const handleAdvance = async () => {
    if (!order) return;
    const idx   = STATUS_INDEX[order.status];
    const next  = STAGES[idx + 1]?.status;
    if (!next) return;
    await ordersApi.updateStatus(order.id, next);
    fetchOrder(order.id);
  };

  const currentIdx = order ? STATUS_INDEX[order.status] : -1;

  return (
    <div className="pb-24 md:pb-8 animate-fade-in max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Track Order</h1>

      {/* Order selector */}
      {orders.length > 0 && (
        <div className="card p-4 mb-6">
          <label className="text-xs font-semibold text-gray-500 block mb-2">ACTIVE ORDER</label>
          <div className="relative">
            <select
              value={selected ?? ""}
              onChange={(e) => setSelected(parseInt(e.target.value))}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              {orders.map(o => (
                <option key={o.id} value={o.id}>Order #{o.id} — {o.shop_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {loading ? <Spinner /> : !order ? (
        <div className="space-y-4">
          <EmptyState icon="📦" title="No active orders" subtitle="Place an order to track it here." />
          <div className="flex justify-center">
            <Link href="/shop" className="btn-primary">Browse Shops</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400 font-medium">ORDER #{order.id}</span>
              {order.estimated_delivery && currentIdx < 3 && (
                <div className="flex items-center gap-1 text-xs text-brand-600 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  ETA: {new Date(order.estimated_delivery).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{STAGES[Math.max(currentIdx, 0)].label}</h2>
            <p className="text-sm text-gray-500">{STAGES[Math.max(currentIdx, 0)].desc}</p>

            {/* Progress bar */}
            {currentIdx >= 0 && (
              <div className="mt-4 bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-brand-500 h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${((currentIdx + 1) / 4) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="card p-6">
            <h3 className="text-sm font-bold text-gray-700 mb-5">Order Journey</h3>
            <div className="space-y-0">
              {STAGES.map((stage, i) => {
                const done    = currentIdx > i;
                const active  = currentIdx === i;
                const pending = currentIdx < i;
                return (
                  <div key={stage.status} className="flex gap-4">
                    {/* Line + icon */}
                    <div className="flex flex-col items-center">
                      <div className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 shrink-0",
                        done   ? "bg-green-100" :
                        active ? "bg-brand-100 ring-2 ring-brand-400 ring-offset-2 animate-pulse" :
                                 "bg-gray-100"
                      )}>
                        {done ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : stage.icon}
                      </div>
                      {i < STAGES.length - 1 && (
                        <div className={clsx("w-0.5 h-10 mt-1", done ? "bg-green-300" : "bg-gray-200")} />
                      )}
                    </div>

                    {/* Text */}
                    <div className="pb-8 min-w-0 pt-2">
                      <p className={clsx("font-semibold text-sm", active ? "text-brand-700" : done ? "text-gray-700" : "text-gray-400")}>
                        {stage.label}
                      </p>
                      <p className={clsx("text-xs mt-0.5", pending ? "text-gray-300" : "text-gray-500")}>
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shop info */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Order Details</h3>
            <div className="flex items-start gap-3 text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
              <span>{order.delivery_address}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-brand-500 shrink-0" />
              <span>{order.shop.phone ?? "—"}</span>
              <span className="text-gray-400">({order.shop.name})</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-500">{order.items.length} item(s)</span>
              <span className="font-bold text-gray-900">₹{order.total_amount.toFixed(0)}</span>
            </div>
          </div>

          {/* Demo advance button */}
          {currentIdx >= 0 && currentIdx < 3 && (
            <div className="card p-4 bg-amber-50 border-amber-200">
              <p className="text-xs text-amber-700 font-medium mb-2">🧪 Demo: Simulate next status</p>
              <button onClick={handleAdvance} className="btn-primary text-sm w-full">
                Advance to: {STAGES[currentIdx + 1]?.label}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
