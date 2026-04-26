"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ordersApi } from "@/lib/api";
import type { OrderListItem } from "@/types";
import { Spinner, EmptyState, StatusBadge } from "@/components/shared";
import { ShoppingBag, ChevronRight, Clock } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.list().then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="pb-24 page-enter max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black" style={{ color: "var(--text)" }}>My Orders</h1>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: "var(--bg-input)", color: "var(--text-3)" }}>
          {orders.length} orders
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="space-y-6">
          <EmptyState icon="📦" title="No orders yet" subtitle="Your order history will appear here." />
          <div className="flex justify-center">
            <Link href="/shop" className="btn-primary gap-2">
              <ShoppingBag className="w-4 h-4" /> Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: OrderListItem }) {
  const isActive = order.status !== "Delivered" && order.status !== "Cancelled";
  const date = new Date(order.placed_at);

  return (
    <Link href={isActive ? `/tracking?orderId=${order.id}` : `/orders/${order.id}`}>
      <div className="card p-4 hover:border-orange-500/30 transition-all cursor-pointer"
        style={{ borderColor: isActive ? "rgba(249,115,22,0.2)" : "var(--border)" }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
            style={{ background: isActive ? "rgba(249,115,22,0.15)" : "var(--bg-input)" }}>
            🧾
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black truncate" style={{ color: "var(--text)" }}>{order.shop_name}</p>
            <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: "var(--text-3)" }}>
              <span>{order.item_count} item{order.item_count !== 1 ? "s" : ""}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="font-black" style={{ color: "var(--brand)" }}>
              ₹{order.total_amount.toFixed(0)}
            </span>
            <ChevronRight className="w-4 h-4" style={{ color: "var(--text-3)" }} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3"
          style={{ borderTop: "1px solid var(--border)" }}>
          <StatusBadge status={order.status} />
          {isActive && (
            <span className="text-xs font-bold" style={{ color: "var(--brand)" }}>Track →</span>
          )}
        </div>
      </div>
    </Link>
  );
}
