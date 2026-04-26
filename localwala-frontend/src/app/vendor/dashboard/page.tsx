"use client";
import { useEffect, useState } from "react";
import { vendorApi } from "@/lib/api";
import type { VendorAnalytics } from "@/types";
import { TrendingUp, Package, ShoppingBag, DollarSign, Star, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function VendorDashboard() {
  const [analytics, setAnalytics] = useState<VendorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await vendorApi.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Today's Orders",
      value: analytics.today_orders,
      icon: ShoppingBag,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Today's Revenue",
      value: `₹${analytics.today_revenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Pending Orders",
      value: analytics.pending_orders,
      icon: Package,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Total Products",
      value: analytics.total_products,
      icon: Package,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Total Orders",
      value: analytics.total_orders,
      icon: TrendingUp,
      color: "bg-indigo-500",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      label: "Total Revenue",
      value: `₹${analytics.total_revenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Shop Rating",
      value: `${analytics.shop_rating.toFixed(1)} ⭐`,
      icon: Star,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Total Reviews",
      value: analytics.total_reviews,
      icon: Star,
      color: "bg-pink-500",
      textColor: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
          Vendor Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-subtle)" }}>
          Overview of your shop performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-6 border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-subtle)" }}>
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-2" style={{ color: "var(--text)" }}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-2xl p-6 border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text)" }}>
            Quick Stats
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span style={{ color: "var(--text-subtle)" }}>Average Order Value</span>
              <span className="font-bold" style={{ color: "var(--text)" }}>
                ₹{analytics.total_orders > 0 ? (analytics.total_revenue / analytics.total_orders).toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: "var(--text-subtle)" }}>Orders Today</span>
              <span className="font-bold" style={{ color: "var(--text)" }}>
                {analytics.today_orders}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: "var(--text-subtle)" }}>Pending Orders</span>
              <span className="font-bold text-orange-600">
                {analytics.pending_orders}
              </span>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl p-6 border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text)" }}>
            Shop Performance
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span style={{ color: "var(--text-subtle)" }}>Rating</span>
              <span className="font-bold" style={{ color: "var(--text)" }}>
                {analytics.shop_rating.toFixed(1)} / 5.0
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: "var(--text-subtle)" }}>Total Reviews</span>
              <span className="font-bold" style={{ color: "var(--text)" }}>
                {analytics.total_reviews}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: "var(--text-subtle)" }}>Products Listed</span>
              <span className="font-bold" style={{ color: "var(--text)" }}>
                {analytics.total_products}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
