"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { shopsApi } from "@/lib/api";
import type { Category, Shop } from "@/types";
import { useAuthStore } from "@/store/authStore";
import AuthModal from "@/components/ui/AuthModal";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  Search, MapPin, Bike, Star, Clock, ChevronRight,
  ShoppingBag, Loader2, LocateFixed, LogIn, User, Menu, X,
} from "lucide-react";
import { useLocation } from "@/hooks/useLocation";

const CATEGORY_EMOJI: Record<string, string> = {
  Groceries: "🛒",
  Vegetables: "🥦",
  Meat: "🥩",
  Medicines: "💊",
  Clothing: "👕",
  Fruits: "🍎",
  Dairy: "🥛",
  Bakery: "🍞",
  Snacks: "🍿",
  Beverages: "🧃",
};

const BANNERS = [
  {
    title: "Fresh Vegetables",
    subtitle: "Delivered in 30 mins",
    emoji: "🥦",
    bg: "from-green-500 to-emerald-600",
    cta: "Order Now",
  },
  {
    title: "Daily Groceries",
    subtitle: "Best prices guaranteed",
    emoji: "🛒",
    bg: "from-orange-500 to-brand-600",
    cta: "Shop Now",
  },
  {
    title: "Medicines & More",
    subtitle: "24/7 availability",
    emoji: "💊",
    bg: "from-blue-500 to-indigo-600",
    cta: "Browse",
  },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect vendors straight to their dashboard
  useEffect(() => {
    if (role === "vendor") router.replace("/vendor/dashboard");
  }, [role, router]);

  // Auto-rotate banner
  useEffect(() => {
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    shopsApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  const fetchShops = useCallback((catId?: number) => {
    setShopsLoading(true);
    shopsApi
      .getNearby(17.385, 78.4867, catId, 15)
      .then((d) => setShops(d.shops))
      .catch(() => setShops([]))
      .finally(() => setShopsLoading(false));
  }, []);

  useEffect(() => {
    fetchShops(activeCategory);
  }, [activeCategory, fetchShops]);

  const filteredShops = search.trim()
    ? shops.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.category.name.toLowerCase().includes(search.toLowerCase())
      )
    : shops;

  const banner = BANNERS[bannerIdx];

  return (
    <div className="min-h-screen" style={{ background: "var(--surface-2)" }}>
      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{ background: "var(--surface)", borderColor: "var(--border-soft)" }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-sm leading-none" style={{ color: "var(--text)" }}>
                LocalWala
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-subtle)" }}>
                Hyperlocal Delivery
              </p>
            </div>
          </Link>

          {/* Location */}
          <div className="hidden md:flex items-center gap-1.5 text-sm shrink-0">
            {locLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
            ) : (
              <LocateFixed className="w-4 h-4 text-brand-500" />
            )}
            <span className="font-semibold truncate max-w-[160px]" style={{ color: "var(--text)" }}>
              {locLoading ? "Detecting..." : city ? `${label}, ${city}` : label}
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--text-subtle)" }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shops, groceries, medicines..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition"
                style={{
                  background: "var(--surface-3)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/cart"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: "var(--surface-3)", color: "var(--text)" }}
                >
                  <ShoppingBag className="w-4 h-4 text-brand-500" />
                  Cart
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{userName?.split(" ")[0]}</span>
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login / Register</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}

            {/* Mobile menu */}
            <button
              className="md:hidden p-2 rounded-xl"
              style={{ background: "var(--surface-3)" }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" style={{ color: "var(--text)" }} />
              ) : (
                <Menu className="w-5 h-5" style={{ color: "var(--text)" }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t px-4 py-3 space-y-2"
            style={{ background: "var(--surface)", borderColor: "var(--border-soft)" }}
          >
            <div className="flex items-center gap-2 text-sm py-2">
              <LocateFixed className="w-4 h-4 text-brand-500" />
              <span style={{ color: "var(--text)" }}>
                {locLoading ? "Detecting..." : city ? `${label}, ${city}` : label}
              </span>
            </div>
            {isLoggedIn && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 py-2 text-sm font-medium"
                  style={{ color: "var(--text)" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingBag className="w-4 h-4 text-brand-500" /> My Dashboard
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center gap-2 py-2 text-sm font-medium"
                  style={{ color: "var(--text)" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingBag className="w-4 h-4 text-brand-500" /> My Cart
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 py-2 text-sm font-medium text-red-500"
                >
                  <LogIn className="w-4 h-4" /> Logout
                </button>
              </>
            )}
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-10 pb-16">

        {/* ── HERO BANNER ──────────────────────────────────────────────── */}
        <div
          className={`relative rounded-3xl overflow-hidden bg-gradient-to-r ${banner.bg} p-8 md:p-12 text-white`}
          style={{ minHeight: 200 }}
        >
          <div className="relative z-10 max-w-lg">
            <p className="text-sm font-semibold opacity-80 mb-2 uppercase tracking-wider">
              LocalWala Delivers
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
              {banner.title}
            </h1>
            <p className="text-lg opacity-90 mb-6">{banner.subtitle}</p>
            <button
              onClick={() => isLoggedIn ? router.push("/shop") : setShowAuth(true)}
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
            >
              {banner.cta} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {/* Big emoji decoration */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[120px] md:text-[160px] opacity-20 select-none pointer-events-none">
            {banner.emoji}
          </div>
          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setBannerIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === bannerIdx ? "bg-white w-6" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── LOGIN PROMPT (unauthenticated) ───────────────────────────── */}
        {!isLoggedIn && (
          <div
            className="rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                🔐
              </div>
              <div>
                <p className="font-bold" style={{ color: "var(--text)" }}>
                  Login to order from local shops
                </p>
                <p className="text-sm" style={{ color: "var(--text-subtle)" }}>
                  Browse freely — login only needed when you add to cart
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAuth(true)}
              className="shrink-0 btn-primary flex items-center gap-2 px-6 py-3"
            >
              <LogIn className="w-4 h-4" /> Login / Register
            </button>
          </div>
        )}

        {/* ── CATEGORIES ───────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {/* All */}
            <button
              onClick={() => setActiveCategory(undefined)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                activeCategory === undefined
                  ? "border-brand-500 bg-brand-50"
                  : "border-transparent hover:border-gray-200"
              }`}
              style={
                activeCategory !== undefined
                  ? { background: "var(--surface)", borderColor: "var(--border)" }
                  : {}
              }
            >
              <span className="text-3xl">🛍️</span>
              <span
                className="text-xs font-semibold text-center leading-tight"
                style={{ color: "var(--text)" }}
              >
                All
              </span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? undefined : cat.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  activeCategory === cat.id
                    ? "border-brand-500 bg-brand-50"
                    : "border-transparent hover:border-gray-200"
                }`}
                style={
                  activeCategory !== cat.id
                    ? { background: "var(--surface)", borderColor: "var(--border)" }
                    : {}
                }
              >
                <span className="text-3xl">
                  {CATEGORY_EMOJI[cat.name] ?? cat.icon ?? "🏪"}
                </span>
                <span
                  className="text-xs font-semibold text-center leading-tight"
                  style={{ color: "var(--text)" }}
                >
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── SHOPS NEAR YOU ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                {activeCategory
                  ? `${categories.find((c) => c.id === activeCategory)?.name ?? ""} Shops`
                  : "Shops Near You"}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-subtle)" }}>
                {locLoading ? "Finding your location..." : `Showing shops in ${city || "your area"}`}
              </p>
            </div>
            {filteredShops.length > 0 && (
              <Link
                href="/shop"
                className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {shopsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🏪</p>
              <p className="font-bold text-lg" style={{ color: "var(--text)" }}>
                No shops found
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-subtle)" }}>
                {search ? "Try a different search term" : "Try selecting a different category"}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredShops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  onLoginRequired={() => setShowAuth(true)}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── WHY LOCALWALA ────────────────────────────────────────────── */}
        <section
          className="rounded-3xl p-8 md:p-12"
          style={{ background: "var(--surface)" }}
        >
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "var(--text)" }}>
            Why LocalWala?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { emoji: "⚡", title: "Fast Delivery", desc: "30 min or less" },
              { emoji: "🏪", title: "Local Shops", desc: "Support your community" },
              { emoji: "💰", title: "Best Prices", desc: "No hidden charges" },
              { emoji: "🔒", title: "Secure", desc: "Safe & trusted" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-3">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: "var(--surface-3)" }}
                >
                  {item.emoji}
                </div>
                <div>
                  <p className="font-bold" style={{ color: "var(--text)" }}>
                    {item.title}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-subtle)" }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer className="text-center py-6 border-t" style={{ borderColor: "var(--border-soft)" }}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <Bike className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold" style={{ color: "var(--text)" }}>
              LocalWala
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-subtle)" }}>
            Hyperlocal delivery from shops near you
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--text-subtle)" }}>
            © 2026 LocalWala. All rights reserved.
          </p>
        </footer>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

// ── Shop Card ──────────────────────────────────────────────────────────────
function ShopCard({
  shop,
  onLoginRequired,
  isLoggedIn,
}: {
  shop: Shop;
  onLoginRequired: () => void;
  isLoggedIn: boolean;
}) {
  return (
    <Link href={isLoggedIn ? `/shop/${shop.id}` : "#"} onClick={!isLoggedIn ? onLoginRequired : undefined}>
      <div
        className="rounded-2xl overflow-hidden border hover:-translate-y-1 transition-all duration-200 cursor-pointer group h-full flex flex-col"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Shop image / placeholder */}
        <div
          className="h-36 flex items-center justify-center text-6xl relative"
          style={{ background: `${shop.category.color}22` }}
        >
          {shop.image_url ? (
            <img
              src={shop.image_url}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{CATEGORY_EMOJI[shop.category.name] ?? "🏪"}</span>
          )}
          {/* Open/closed badge */}
          <span
            className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${
              shop.is_open
                ? "bg-green-500 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {shop.is_open ? "● Open" : "● Closed"}
          </span>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3
            className="font-bold text-base group-hover:text-brand-600 transition-colors truncate"
            style={{ color: "var(--text)" }}
          >
            {shop.name}
          </h3>
          <p className="text-xs mt-0.5 mb-3 line-clamp-1" style={{ color: "var(--text-subtle)" }}>
            {shop.description || shop.category.name}
          </p>

          {/* Meta row */}
          <div
            className="flex items-center justify-between text-xs mt-auto pt-3 border-t"
            style={{ borderColor: "var(--border-soft)", color: "var(--text-muted)" }}
          >
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{shop.rating.toFixed(1)}</span>
              <span>({shop.total_reviews})</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {shop.delivery_time_min} min
            </div>
            <div className="flex items-center gap-1">
              <Bike className="w-3.5 h-3.5" />
              ₹{shop.delivery_fee}
            </div>
          </div>

          {/* CTA */}
          {!isLoggedIn ? (
            <button
              onClick={(e) => { e.preventDefault(); onLoginRequired(); }}
              className="mt-3 w-full py-2 rounded-xl text-xs font-bold border-2 border-brand-500 text-brand-600 hover:bg-brand-50 transition-colors"
            >
              Login to Order
            </button>
          ) : (
            <div className="mt-3 w-full py-2 rounded-xl text-xs font-bold bg-brand-500 text-white text-center group-hover:bg-brand-600 transition-colors">
              View Shop →
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}