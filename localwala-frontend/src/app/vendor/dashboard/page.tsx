"use client";
import { useEffect, useState } from "react";
import { vendorApi } from "@/lib/api";
import type { VendorAnalytics } from "@/types";
import { TrendingUp, Package, ShoppingBag, IndianRupee, Star, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const STATS = (a: VendorAnalytics) => [
  { label: "Today's Orders",  value: a.today_orders,                          icon: ShoppingBag,   color: "#3b82f6" },
  { label: "Today's Revenue", value: `₹${a.today_revenue.toFixed(0)}`,        icon: IndianRupee,   color: "#22c55e" },
  { label: "Pending Orders",  value: a.pending_orders,                         icon: Package,       color: "#f97316" },
  { label: "Total Products",  value: a.total_products,                         icon: Package,       color: "#a855f7" },
  { label: "Total Orders",    value: a.total_orders,                           icon: TrendingUp,    color: "#06b6d4" },
  { label: "Total Revenue",   value: `₹${a.total_revenue.toFixed(0)}`,        icon: IndianRupee,   color: "#10b981" },
  { label: "Shop Rating",     value: `${a.shop_rating.toFixed(1)} ⭐`,        icon: Star,          color: "#eab308" },
  { label: "Total Reviews",   value: a.total_reviews,                          icon: Star,          color: "#ec4899" },
];

export default function VendorDashboard() {
  const [analytics, setAnalytics] = useState<VendorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorApi.getAnalytics()
      .then(setAnalytics)
      .catch(err => toast.error(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand)" }} />
    </div>
  );

  if (!analytics) return (
    <div className="text-center py-12" style={{ color: "var(--text-3)" }}>Failed to load analytics</div>
  );

  const avgOrder = analytics.total_orders > 0
    ? (analytics.total_revenue / analytics.total_orders).toFixed(0)
    : "0";

  return (
    <div className="space-y-6 pb-8 page-enter">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--text)" }}>Vendor Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>Overview of your shop performance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS(analytics).map((s, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: `${s.color}20` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <h2 className="font-black mb-4" style={{ color: "var(--text)" }}>Quick Stats</h2>
          <div className="space-y-4">
            {[
              { label: "Average Order Value", value: `₹${avgOrder}`, color: "var(--brand)" },
              { label: "Orders Today",        value: analytics.today_orders, color: "#3b82f6" },
              { label: "Pending Orders",      value: analytics.pending_orders, color: "#f97316" },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2"
                style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-sm" style={{ color: "var(--text-3)" }}>{row.label}</span>
                <span className="font-black text-sm" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-black mb-4" style={{ color: "var(--text)" }}>Shop Performance</h2>
          <div className="space-y-4">
            {[
              { label: "Rating",           value: `${analytics.shop_rating.toFixed(1)} / 5.0`, color: "#eab308" },
              { label: "Total Reviews",    value: analytics.total_reviews, color: "var(--text)" },
              { label: "Products Listed",  value: analytics.total_products, color: "var(--brand)" },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2"
                style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-sm" style={{ color: "var(--text-3)" }}>{row.label}</span>
                <span className="font-black text-sm" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
