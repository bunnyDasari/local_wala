"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { shopsApi } from "@/lib/api";
import type { Category, Shop } from "@/types";
import { useAuthStore } from "@/store/authStore";
import AuthModal from "@/components/ui/AuthModal";
import { Search, MapPin, Star, Clock, Bike, ChevronRight, Loader2, LogIn, Bell, LocateFixed } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";

const EMOJI: Record<string, string> = {
  Groceries: "🛒", Vegetables: "🥦", Meat: "🥩", Medicines: "💊", Clothing: "👕",
};

const BANNERS = [
  { title: "Fresh Veggies", sub: "Delivered in 30 mins", emoji: "🥦", color: "#1a3a1a", accent: "#22c55e" },
  { title: "Daily Groceries", sub: "Best prices guaranteed", emoji: "🛒", color: "#2a1a0a", accent: "#f97316" },
  { title: "Medicines", sub: "24/7 availability", emoji: "💊", color: "#0a1a2a", accent: "#3b82f6" },
];

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, userName, role, logout } = useAuthStore();
  const { label, city, loading: locLoading } = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | undefined>();
  const [search, setSearch] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    if (role === "vendor") router.replace("/vendor/dashboard");
  }, [role, router]);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { shopsApi.getCategories().then(setCategories).catch(() => {}); }, []);

  const fetchShops = useCallback((catId?: number) => {
    setShopsLoading(true);
    shopsApi.getNearby(17.385, 78.4867, catId, 15)
      .then(d => setShops(d.shops))
      .catch(() => setShops([]))
      .finally(() => setShopsLoading(false));
  }, []);

  useEffect(() => { fetchShops(activeCategory); }, [activeCategory, fetchShops]);

  const filtered = search.trim()
    ? shops.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.name.toLowerCase().includes(search.toLowerCase()))
    : shops;

  const banner = BANNERS[bannerIdx];

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg)" }}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 px-4 pt-5 pb-3" style={{ background: "var(--bg)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-3)" }}>
              {locLoading ? "Detecting location..." : "Deliver to"}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <LocateFixed className="w-4 h-4" style={{ color: "var(--brand)" }} />
              <span className="font-bold text-sm" style={{ color: "var(--text)" }}>
                {locLoading ? "..." : city ? `${label}, ${city}` : label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <button className="relative w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--bg-card)" }}>
                  <Bell className="w-5 h-5" style={{ color: "var(--text-2)" }} />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: "var(--brand)" }} />
                </button>
                <Link href="/dashboard">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm"
                    style={{ background: "var(--brand)", color: "white" }}>
                    {(userName ?? "U")[0].toUpperCase()}
                  </div>
                </Link>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm"
                style={{ background: "var(--brand)", color: "white", boxShadow: "var(--shadow-brand)" }}>
                <LogIn className="w-4 h-4" />
                Login
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-3)" }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search shops, groceries, medicines..."
            className="input pl-11"
          />
        </div>
      </header>

      <div className="px-4 space-y-8">

        {/* ── HERO BANNER ─────────────────────────────────────────────── */}
        <div
          className="relative rounded-3xl overflow-hidden p-6"
          style={{ background: banner.color, minHeight: 180 }}
        >
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: banner.accent }}>
              LocalWala Delivers
            </p>
            <h1 className="text-3xl font-black text-white leading-tight mb-2">
              {banner.title}
            </h1>
            <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>
              {banner.sub}
            </p>
            <button
              onClick={() => isLoggedIn ? router.push("/shop") : setShowAuth(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm"
              style={{ background: banner.accent, color: "white" }}
            >
              Order Now <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl opacity-30 select-none pointer-events-none">
            {banner.emoji}
          </div>
          {/* Dots */}
          <div className="absolute bottom-4 left-6 flex gap-1.5">
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)}
                className="h-1.5 rounded-full transition-all"
                style={{ width: i === bannerIdx ? 20 : 6, background: i === bannerIdx ? "white" : "rgba(255,255,255,0.3)" }}
              />
            ))}
          </div>
        </div>

        {/* ── CATEGORIES ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Categories</h2>
            <Link href="/shop" className="text-xs font-bold" style={{ color: "var(--brand)" }}>
              See all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            <button onClick={() => setActiveCategory(undefined)}
              className={`cat-chip ${activeCategory === undefined ? "active" : ""}`}>
              <span className="text-2xl">🛍️</span>
              All
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

        {/* ── POPULAR SHOPS ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">
              {activeCategory
                ? `${categories.find(c => c.id === activeCategory)?.name} Shops`
                : "Shops Near You"}
            </h2>
            <Link href="/shop" className="text-xs font-bold" style={{ color: "var(--brand)" }}>
              View all
            </Link>
          </div>

          {shopsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand)" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🏪</p>
              <p className="font-bold" style={{ color: "var(--text)" }}>No shops found</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>Try a different category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(shop => (
                <ShopCard key={shop.id} shop={shop}
                  onLoginRequired={() => setShowAuth(true)}
                  isLoggedIn={isLoggedIn} />
              ))}
            </div>
          )}
        </section>

        {/* ── WHY LOCALWALA ───────────────────────────────────────────── */}
        <section className="rounded-3xl p-6" style={{ background: "var(--bg-card)" }}>
          <h2 className="section-title text-center mb-6">Why LocalWala?</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { emoji: "⚡", title: "Fast Delivery", desc: "30 min or less" },
              { emoji: "🏪", title: "Local Shops", desc: "Support community" },
              { emoji: "💰", title: "Best Prices", desc: "No hidden charges" },
              { emoji: "🔒", title: "Secure", desc: "Safe & trusted" },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: "var(--bg-input)" }}>
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--text)" }}>{item.title}</p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs" style={{ color: "var(--text-3)" }}>
            © 2026 LocalWala · Hyperlocal Delivery
          </p>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

function ShopCard({ shop, onLoginRequired, isLoggedIn }: {
  shop: Shop; onLoginRequired: () => void; isLoggedIn: boolean;
}) {
  return (
    <Link href={isLoggedIn ? `/shop/${shop.id}` : "#"}
      onClick={!isLoggedIn ? onLoginRequired : undefined}>
      <div className="shop-card">
        {/* Cover */}
        <div className="h-40 relative flex items-center justify-center overflow-hidden"
          style={{ background: `${shop.category.color}22` }}>
          {shop.image_url
            ? <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover" />
            : <span className="text-6xl">{EMOJI[shop.category.name] ?? "🏪"}</span>
          }
          <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${
            shop.is_open ? "bg-green-500 text-white" : "bg-gray-600 text-white"
          }`}>
            {shop.is_open ? "● Open" : "● Closed"}
          </span>
        </div>
        {/* Info */}
        <div className="p-4">
          <h3 className="font-black text-base mb-1" style={{ color: "var(--text)" }}>{shop.name}</h3>
          <p className="text-xs mb-3 line-clamp-1" style={{ color: "var(--text-3)" }}>
            {shop.description || shop.category.name}
          </p>
          <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "var(--text-3)" }}>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold" style={{ color: "var(--text)" }}>{shop.rating.toFixed(1)}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />{shop.delivery_time_min} min
            </span>
            <span className="flex items-center gap-1">
              <Bike className="w-3.5 h-3.5" />₹{shop.delivery_fee}
            </span>
          </div>
          {!isLoggedIn ? (
            <button onClick={e => { e.preventDefault(); onLoginRequired(); }}
              className="w-full py-2.5 rounded-2xl text-sm font-bold border-2"
              style={{ borderColor: "var(--brand)", color: "var(--brand)" }}>
              Login to Order
            </button>
          ) : (
            <div className="w-full py-2.5 rounded-2xl text-sm font-bold text-center text-white"
              style={{ background: "var(--brand)", boxShadow: "var(--shadow-brand)" }}>
              View Shop →
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
