"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ordersApi } from "@/lib/api";
import type { OrderListItem } from "@/types";
import { Spinner, EmptyState, StatusBadge } from "@/components/shared";
import { ChevronRight, ShoppingBag } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.list()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="pb-24 md:pb-8 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <span className="badge bg-gray-100 text-gray-600">{orders.length} orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="space-y-4">
          <EmptyState icon="📦" title="No orders yet" subtitle="Your order history will appear here." />
          <div className="flex justify-center">
            <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
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
      <div className="card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-lg shrink-0">🧾</div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 truncate">{order.shop_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {order.item_count} item{order.item_count !== 1 ? "s" : ""} •{" "}
                {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="font-bold text-gray-900">₹{order.total_amount.toFixed(0)}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <StatusBadge status={order.status} />
          {isActive && (
            <span className="text-xs text-brand-600 font-semibold">Track →</span>
          )}
          {order.status === "Delivered" && (
            <span className="text-xs text-gray-400">Delivered</span>
          )}
        </div>
      </div>
    </Link>
  );
}
