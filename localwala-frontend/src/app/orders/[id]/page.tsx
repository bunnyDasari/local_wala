"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ordersApi } from "@/lib/api";
import type { Order } from "@/types";
import { Spinner, EmptyState, StatusBadge } from "@/components/shared";
import { ArrowLeft, MapPin, Clock } from "lucide-react";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.get(parseInt(id))
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!order) return <EmptyState icon="🧾" title="Order not found" />;

  return (
    <div className="pb-24 md:pb-8 animate-fade-in max-w-2xl mx-auto space-y-4">
      <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-gray-400 font-medium">ORDER #{order.id}</p>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">{order.shop.name}</h1>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {new Date(order.placed_at).toLocaleString("en-IN")}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {order.delivery_address}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">🛍️</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{item.product.name}</p>
                <p className="text-xs text-gray-400">₹{item.unit_price} × {item.quantity}</p>
              </div>
              <p className="font-bold text-gray-900">₹{item.total_price.toFixed(0)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.subtotal.toFixed(0)}</span></div>
          <div className="flex justify-between text-gray-600"><span>Delivery Fee</span><span>₹{order.delivery_fee.toFixed(0)}</span></div>
          <div className="flex justify-between font-bold text-base text-gray-900 pt-1"><span>Total</span><span>₹{order.total_amount.toFixed(0)}</span></div>
        </div>
      </div>

      {order.status !== "Delivered" && order.status !== "Cancelled" && (
        <Link href={`/tracking?orderId=${order.id}`} className="btn-primary w-full flex items-center justify-center gap-2">
          Track this Order
        </Link>
      )}
    </div>
  );
}
