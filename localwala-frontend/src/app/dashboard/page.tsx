"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { shopsApi } from "@/lib/api";
import type { Category, Shop } from "@/types";
import { Spinner, EmptyState } from "@/components/shared";
import { Clock, ChevronRight, Star, Bike, Loader2, LocateFixed } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { useAuthStore } from "@/store/authStore";

const EMOJI: Record<string, string> = {
  Groceries: "🛒", Vegetables: "🥦", Meat: "🥩", Medicines: "💊", Clothing: "👕",
};

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { text: "Good Morning", emoji: "🌅" };
  if (h >= 12 && h < 17) return { text: "Good Afternoon", emoji: "☀️" };
  if (h >= 17 && h < 21) return { text: "Good Evening", emoji: "🌆" };
  return { text: "Good Night", emoji: "🌙" };
}

export default function DashboardPage() {
  const router = useRouter();
  const { role, userName } = useAuthStore();
  const { lat, lng, loading: locLoading, city, label } = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const { text, emoji } = getGreeting();

  useEffect(() => {
    if (role === "vendor") router.push("/vendor/dashboard");
  }, [role, router]);

  useEffect(() => { shopsApi.getCategories().then(setCategories).catch(() => {}); }, []);

  useEffect(() => {
    if (locLoading) return;
    setLoading(true);
    shopsApi.getNearby(lat, lng, activeCategory)
      .then(d => setShops(d.shops))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, [lat, lng, locLoading, activeCategory]);

  return (
    <div className="space-y-6 pb-24 page-enter">

      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>{emoji} {text}!</p>
          <h1 className="text-2xl font-black mt-0.5" style={{ color: "var(--text)" }}>
            {userName ? `Hey, ${userName.split(" ")[0]}` : "What do you need?"}
          </h1>
          <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: "var(--text-3)" }}>
            {locLoading
              ? <><Loader2 className="w-3 h-3 animate-spin" style={{ color: "var(--brand)" }} /> Detecting...</>
              : <><LocateFixed className="w-3 h-3" style={{ color: "var(--brand)" }} /> {city || label}</>
            }
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: "var(--bg-card)" }}>
          {emoji}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Shops Nearby", value: "12+", color: "var(--brand)" },
          { label: "Avg Delivery", value: "25 min", color: "#22c55e" },
          { label: "Orders Today", value: "3", color: "#3b82f6" },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] mt-1" style={{ color: "var(--text-3)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Categories</h2>
          <Link href="/shop" className="text-xs font-bold" style={{ color: "var(--brand)" }}>See all</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          <button onClick={() => setActiveCategory(undefined)}
            className={`cat-chip ${activeCategory === undefined ? "active" : ""}`}>
            <span className="text-2xl">🛍️</span>All
          </button>
          {categories.map(cat => (
            <button key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? undefined : cat.id)}
              className={`cat-chip ${activeCategory === cat.id ? "active" : ""}`}>
              <span className="text-2xl">{EMOJI[cat.name] ?? cat.icon ?? "🏪"}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Shops */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Shops Near You</h2>
          <Link href="/shop" className="text-xs font-bold flex items-center gap-1" style={{ color: "var(--brand)" }}>
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading || locLoading ? <Spinner /> : shops.length === 0
          ? <EmptyState icon="🏪" title="No shops found" subtitle="Try a different category" />
          : (
            <div className="grid sm:grid-cols-2 gap-4">
              {shops.map(shop => <ShopCard key={shop.id} shop={shop} />)}
            </div>
          )}
      </section>
    </div>
  );
}

function ShopCard({ shop }: { shop: Shop }) {
  return (
    <Link href={`/shop/${shop.id}`}>
      <div className="shop-card">
        <div className="h-36 relative flex items-center justify-center overflow-hidden"
          style={{ background: `${shop.category.color}22` }}>
          {shop.image_url
            ? <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover" />
            : <span className="text-5xl">{EMOJI[shop.category.name] ?? "🏪"}</span>
          }
          <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${
            shop.is_open ? "bg-green-500 text-white" : "bg-gray-600 text-white"
          }`}>
            {shop.is_open ? "● Open" : "● Closed"}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-black text-sm mb-1" style={{ color: "var(--text)" }}>{shop.name}</h3>
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-3)" }}>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="font-bold" style={{ color: "var(--text)" }}>{shop.rating.toFixed(1)}</span>
            </span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{shop.delivery_time_min} min</span>
            <span className="flex items-center gap-1"><Bike className="w-3 h-3" />₹{shop.delivery_fee}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
