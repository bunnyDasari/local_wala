"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ordersApi } from "@/lib/api";
import type { Order } from "@/types";
import { Spinner, EmptyState, StatusBadge } from "@/components/shared";
import { ArrowLeft, MapPin, Clock } from "lucide-react";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.get(parseInt(id)).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!order) return <EmptyState icon="🧾" title="Order not found" />;

  return (
    <div className="pb-24 page-enter max-w-2xl mx-auto space-y-4">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold"
        style={{ color: "var(--text-3)" }}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>
              ORDER #{order.id}
            </p>
            <h1 className="text-xl font-black" style={{ color: "var(--text)" }}>{order.shop.name}</h1>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex flex-col gap-2 text-xs" style={{ color: "var(--text-3)" }}>
          <span className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} />
            {new Date(order.placed_at).toLocaleString("en-IN")}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} />
            {order.delivery_address}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="card p-5">
        <h2 className="font-black mb-4" style={{ color: "var(--text)" }}>Items Ordered</h2>
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
                style={{ background: "var(--bg-input)" }}>
                {item.product.image_url
                  ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover rounded-2xl" />
                  : "🛍️"
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: "var(--text)" }}>{item.product.name}</p>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>₹{item.unit_price} × {item.quantity}</p>
              </div>
              <p className="font-black" style={{ color: "var(--brand)" }}>₹{item.total_price.toFixed(0)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 space-y-2 text-sm" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex justify-between" style={{ color: "var(--text-3)" }}>
            <span>Subtotal</span><span>₹{order.subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between" style={{ color: "var(--text-3)" }}>
            <span>Delivery Fee</span><span>₹{order.delivery_fee.toFixed(0)}</span>
          </div>
          <div className="flex justify-between font-black text-base pt-2" style={{ borderTop: "1px solid var(--border)", color: "var(--text)" }}>
            <span>Total</span>
            <span style={{ color: "var(--brand)" }}>₹{order.total_amount.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {order.status !== "Delivered" && order.status !== "Cancelled" && (
        <Link href={`/tracking?orderId=${order.id}`} className="btn-primary w-full">
          Track this Order
        </Link>
      )}
    </div>
  );
}
