"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { shopsApi } from "@/lib/api";
import type { Category, Shop } from "@/types";
import { Spinner, StarRating, EmptyState } from "@/components/shared";
import { Clock, SlidersHorizontal } from "lucide-react";

export default function ShopPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeCategory, setActive] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  const EMOJI: Record<string, string> = {
    Groceries: "🛒", Vegetables: "🥦", Meat: "🥩", Medicines: "💊", Clothing: "👕",
  };

  // fetch categories once
  useEffect(() => {
    shopsApi.getCategories().then(setCategories).catch(() => { });
  }, []);

  // fetch shops only when category changes
  const fetchShops = useCallback((categoryId?: number) => {
    setLoading(true);
    shopsApi
      .getNearby(17.385, 78.4867, categoryId, 15)
      .then((d) => setShops(d.shops))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchShops(activeCategory);
  }, [activeCategory, fetchShops]);

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Shops Near You</h1>
        <button
          className="flex items-center gap-2 text-sm rounded-xl px-3 py-2 transition"
          style={{
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <SlidersHorizontal className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: undefined, name: "All", icon: "🛍️" },
          ...categories.map((c) => ({ id: c.id, name: c.name, icon: EMOJI[c.name] ?? "🏪" })),
        ].map((cat) => (
          <button
            key={cat.id ?? "all"}
            onClick={() => setActive(cat.id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeCategory === cat.id
              ? "bg-brand-500 text-white shadow-sm"
              : "border"
              }`}
            style={activeCategory !== cat.id ? {
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text-muted)",
            } : {}}
          >
            <span>{cat.icon}</span> {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : shops.length === 0 ? (
        <EmptyState icon="🏪" title="No shops found" subtitle="Try a different category." />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <Link key={shop.id} href={`/shop/${shop.id}`}>
              <div
                className="card p-5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group h-full flex flex-col"
                style={{ background: "var(--surface)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: "var(--surface-3)" }}>
                    {EMOJI[shop.category.name] ?? "🏪"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold truncate group-hover:text-brand-600 transition-colors"
                      style={{ color: "var(--text)" }}>
                      {shop.name}
                    </h3>
                    <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                      {shop.category.name}
                    </p>
                  </div>
                  <span className={`ml-auto badge shrink-0 ${shop.is_open ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}>
                    {shop.is_open ? "Open" : "Closed"}
                  </span>
                </div>

                <p className="text-sm flex-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                  {shop.description}
                </p>
                <p className="text-xs mt-2 truncate" style={{ color: "var(--text-subtle)" }}>
                  📍 {shop.address}
                </p>

                <div
                  className="flex items-center justify-between mt-4 pt-3 text-xs"
                  style={{ borderTop: "1px solid var(--border-soft)", color: "var(--text-muted)" }}
                >
                  <StarRating rating={shop.rating} reviews={shop.total_reviews} />
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />{shop.delivery_time_min} min
                  </span>
                  <span>₹{shop.delivery_fee} fee</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}