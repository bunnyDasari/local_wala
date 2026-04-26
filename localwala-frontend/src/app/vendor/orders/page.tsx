"use client";
import { useEffect, useState } from "react";
import { vendorApi } from "@/lib/api";
import type { VendorOrder, OrderStatus } from "@/types";
import { ShoppingBag, Loader2, MapPin, User, Phone, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";

const STATUS_OPTIONS: OrderStatus[] = [
  "Order Placed",
  "Vendor Preparing",
  "Picked by Delivery Partner",
  "Delivered",
  "Cancelled",
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  "Order Placed": "bg-blue-100 text-blue-700",
  "Vendor Preparing": "bg-yellow-100 text-yellow-700",
  "Picked by Delivery Partner": "bg-purple-100 text-purple-700",
  "Delivered": "bg-green-100 text-green-700",
  "Cancelled": "bg-red-100 text-red-700",
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await vendorApi.getOrders();
      setOrders(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      const updated = await vendorApi.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map((o) => (o.id === updated.id ? updated : o)));
      toast.success(`Order status updated to: ${newStatus}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "var(--text)" }}>
          <ShoppingBag className="w-8 h-8 text-brand-500" />
          Orders
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-subtle)" }}>
          Manage incoming orders and update their status
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={clsx(
            "px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors",
            filter === "all"
              ? "bg-brand-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          All ({orders.length})
        </button>
        {STATUS_OPTIONS.map((status) => {
          const count = orders.filter((o) => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={clsx(
                "px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors",
                filter === status
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <ShoppingBag className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--text-subtle)" }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
            No orders found
          </h3>
          <p style={{ color: "var(--text-subtle)" }}>
            {filter === "all" ? "You haven't received any orders yet" : `No orders with status: ${filter}`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl p-6 border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>
                      Order #{order.id}
                    </h3>
                    <span className={clsx("px-3 py-1 rounded-lg text-xs font-semibold", STATUS_COLORS[order.status])}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-subtle)" }}>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(order.placed_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-600">₹{order.total_amount.toFixed(2)}</p>
                  <p className="text-sm" style={{ color: "var(--text-subtle)" }}>
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div
                className="rounded-xl p-4 mb-4"
                style={{ background: "var(--surface-3)" }}
              >
                <h4 className="font-semibold mb-3" style={{ color: "var(--text)" }}>
                  Customer Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" style={{ color: "var(--text-subtle)" }} />
                    <span style={{ color: "var(--text)" }}>{order.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" style={{ color: "var(--text-subtle)" }} />
                    <span style={{ color: "var(--text)" }}>{order.user.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 md:col-span-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--text-subtle)" }} />
                    <span style={{ color: "var(--text)" }}>{order.delivery_address}</span>
                  </div>
                  {order.delivery_notes && (
                    <div className="md:col-span-2">
                      <span className="font-semibold" style={{ color: "var(--text)" }}>Notes: </span>
                      <span style={{ color: "var(--text-subtle)" }}>{order.delivery_notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-4">
                <h4 className="font-semibold" style={{ color: "var(--text)" }}>Order Items</h4>
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "var(--surface-3)" }}
                  >
                    <div className="flex items-center gap-3">
                      {item.product.image_url && (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <p className="font-semibold" style={{ color: "var(--text)" }}>
                          {item.product.name}
                        </p>
                        <p className="text-sm" style={{ color: "var(--text-subtle)" }}>
                          {item.quantity} × ₹{item.unit_price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold" style={{ color: "var(--text)" }}>
                      ₹{item.total_price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="space-y-2 mb-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-subtle)" }}>Subtotal</span>
                  <span style={{ color: "var(--text)" }}>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-subtle)" }}>Delivery Fee</span>
                  <span style={{ color: "var(--text)" }}>₹{order.delivery_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                  <span style={{ color: "var(--text)" }}>Total</span>
                  <span className="text-brand-600">₹{order.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Status Update */}
              {order.status !== "Delivered" && order.status !== "Cancelled" && (
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--text)" }}>
                    Update Status
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.filter((s) => s !== "Cancelled").map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(order.id, status)}
                        disabled={order.status === status}
                        className={clsx(
                          "px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
                          order.status === status
                            ? STATUS_COLORS[status]
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                    <button
                      onClick={() => updateStatus(order.id, "Cancelled")}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
