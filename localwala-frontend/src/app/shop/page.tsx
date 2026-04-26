"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { shopsApi } from "@/lib/api";
import type { Category, Shop } from "@/types";
import { Spinner, EmptyState } from "@/components/shared";
import { Clock, Bike, Star, Search, MapPin } from "lucide-react";

const EMOJI: Record<string, string> = {
  Groceries: "🛒", Vegetables: "🥦", Meat: "🥩", Medicines: "💊", Clothing: "👕",
};

export default function ShopPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeCategory, setActive] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    shopsApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  const fetchShops = useCallback((categoryId?: number) => {
    setLoading(true);
    shopsApi
      .getNearby(17.385, 78.4867, categoryId, 15)
      .then((d) => setShops(d.shops))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchShops(activeCategory); }, [activeCategory, fetchShops]);

  const filtered = search.trim()
    ? shops.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.name.toLowerCase().includes(search.toLowerCase())
      )
    : shops;

  return (
    <div className="space-y-5 pb-24 md:pb-8 page-enter">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
          Shops Near You
        </h1>
        <p className="text-sm flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
          <MapPin className="w-3.5 h-3.5 text-brand-500" />
          Banjara Hills, Hyderabad
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-subtle)" }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search shops or categories..."
          className="input pl-11"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setActive(undefined)}
          className={`cat-pill ${activeCategory === undefined ? "active" : ""}`}
        >
          <span className="text-xl">🛍️</span>
          <span>All</span>
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActive(activeCategory === cat.id ? undefined : cat.id)}
            className={`cat-pill ${activeCategory === cat.id ? "active" : ""}`}
          >
            <span className="text-xl">{EMOJI[cat.name] ?? cat.icon ?? "🏪"}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
          {filtered.length} shop{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Shop grid */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🏪" title="No shops found" subtitle="Try a different category or search term." />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(shop => <ShopCard key={shop.id} shop={shop} />)}
        </div>
      )}
    </div>
  );
}

function ShopCard({ shop }: { shop: Shop }) {
  return (
    <Link href={`/shop/${shop.id}`}>
      <div className="shop-card group">
        {/* Cover image */}
        <div
          className="h-40 flex items-center justify-center relative overflow-hidden"
          style={{ background: `${shop.category.color}18` }}
        >
          {shop.image_url ? (
            <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
              {EMOJI[shop.category.name] ?? "🏪"}
            </span>
          )}
          {/* Open badge */}
          <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${
            shop.is_open ? "bg-green-500 text-white" : "bg-gray-400 text-white"
          }`}>
            {shop.is_open ? "● Open" : "● Closed"}
          </span>
          {/* Category tag */}
          <span
            className="absolute bottom-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: "var(--surface)", color: "var(--text-muted)" }}
          >
            {shop.category.name}
          </span>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-base mb-1 group-hover:text-brand-600 transition-colors" style={{ color: "var(--text)" }}>
            {shop.name}
          </h3>
          <p className="text-xs mb-3 line-clamp-1" style={{ color: "var(--text-muted)" }}>
            {shop.description || "Local shop near you"}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold" style={{ color: "var(--text)" }}>{shop.rating.toFixed(1)}</span>
              <span>({shop.total_reviews})</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {shop.delivery_time_min} min
            </span>
            <span className="flex items-center gap-1">
              <Bike className="w-3.5 h-3.5" />
              ₹{shop.delivery_fee}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
