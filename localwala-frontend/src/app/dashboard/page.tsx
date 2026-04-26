"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { shopsApi } from "@/lib/api";
import type { Category, Shop } from "@/types";
import { Spinner, StarRating, EmptyState, SectionHeader } from "@/components/shared";
import { Clock, ChevronRight, TrendingUp, Package, Bike, LocateFixed, Loader2 } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { useLangStore } from "@/store/langStore";
import { useAuthStore } from "@/store/authStore";

function getGreeting(t: (k: any) => string): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: t("goodMorning"), emoji: "🌅" };
  if (hour >= 12 && hour < 17) return { text: t("goodAfternoon"), emoji: "☀️" };
  if (hour >= 17 && hour < 21) return { text: t("goodEvening"), emoji: "🌆" };
  return { text: t("goodNight"), emoji: "🌙" };
}

export default function DashboardPage() {
  const router = useRouter();
  const { role } = useAuthStore();
  const { lat, lng, loading: locLoading, error: locError } = useLocation();
  const { t } = useLangStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  // Redirect vendors to their dashboard
  useEffect(() => {
    if (role === "vendor") {
      router.push("/vendor/dashboard");
    }
  }, [role, router]);

  const { text: greetText, emoji: greetEmoji } = getGreeting(t);

  const HERO_STATS = [
    { label: t("shopsNearby"), value: "12+", icon: Package, color: "bg-orange-50 text-orange-600" },
    { label: t("avgDelivery"), value: "25 " + t("min"), icon: Bike, color: "bg-green-50 text-green-600" },
    { label: t("ordersToday"), value: "3", icon: TrendingUp, color: "bg-blue-50 text-blue-600" },
  ];

  useEffect(() => {
    shopsApi.getCategories().then(setCategories).catch(() => { });
  }, []);

  useEffect(() => {
    if (locLoading) return;
    setLoading(true);
    shopsApi
      .getNearby(lat, lng, activeCategory)
      .then((d) => setShops(d.shops))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, [lat, lng, locLoading, activeCategory]);

  const EMOJI: Record<string, string> = {
    Groceries: "🛒", Vegetables: "🥦", Meat: "🥩", Medicines: "💊", Clothing: "👕",
  };

  return (
    <div className="space-y-8 pb-24 md:pb-8 animate-fade-in">

      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
            {greetEmoji} {greetText}!
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            {t("whatToday")}
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: "var(--text-subtle)" }}>
            {locLoading ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> {t("detecting")}</>
            ) : locError ? (
              <><span>📍</span> {t("usingDefault")}</>
            ) : (
              <>
                <LocateFixed className="w-3 h-3 text-brand-500" />
                <span className="text-brand-600 font-medium">{t("liveLocation")}</span>
                <span>· {lat.toFixed(4)}, {lng.toFixed(4)}</span>
              </>
            )}
          </div>
        </div>
        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-lg">
          {greetEmoji}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {HERO_STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex flex-col gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold" style={{ color: "var(--text)" }}>{value}</p>
            <p className="text-xs leading-tight" style={{ color: "var(--text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <section>
        <SectionHeader title={t("shopByCategory")} />
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory(undefined)}
            className={`shrink-0 flex flex-col items-center justify-center gap-1.5 w-24 h-24 rounded-2xl border-2 transition-all ${activeCategory === undefined ? "border-brand-500 bg-brand-50" : "border-gray-100 bg-white hover:border-gray-200"
              }`}
          >
            <span className="text-2xl">🛍️</span>
            <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>{t("all")}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? undefined : cat.id)}
              className={`shrink-0 flex flex-col items-center justify-center gap-1.5 w-24 h-24 rounded-2xl border-2 transition-all ${activeCategory === cat.id ? "border-brand-500 bg-brand-50" : "border-gray-100 bg-white hover:border-gray-200"
                }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Nearby Shops */}
      <section>
        <SectionHeader
          title={locLoading ? t("findingShops") : t("shopsNearYou")}
          action={
            <Link href="/shop" className="text-sm text-brand-600 font-semibold flex items-center gap-1 hover:underline">
              {t("viewAll")} <ChevronRight className="w-4 h-4" />
            </Link>
          }
        />
        {loading || locLoading ? (
          <Spinner />
        ) : shops.length === 0 ? (
          <EmptyState icon="🏪" title={t("noShopsFound")} subtitle={t("noShopsSubtitle")} />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function ShopCard({ shop }: { shop: Shop }) {
  const { t } = useLangStore();
  const EMOJI: Record<string, string> = {
    Groceries: "🛒", Vegetables: "🥦", Meat: "🥩", Medicines: "💊", Clothing: "👕",
  };
  return (
    <Link href={`/shop/${shop.id}`}>
      <div className="card p-4 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: shop.category.color + "22" }}>
            {EMOJI[shop.category.name] ?? "🏪"}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`badge ${shop.is_open ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {shop.is_open ? `● ${t("open")}` : `● ${t("closed")}`}
            </span>
            {shop.distance_km !== undefined && (
              <span className="text-xs" style={{ color: "var(--text-subtle)" }}>
                {shop.distance_km} {t("away")}
              </span>
            )}
          </div>
        </div>
        <h3 className="font-bold group-hover:text-brand-600 transition-colors" style={{ color: "var(--text)" }}>
          {shop.name}
        </h3>
        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-muted)" }}>
          {shop.description}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--border-soft)" }}>
          <StarRating rating={shop.rating} reviews={shop.total_reviews} />
          <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            <Clock className="w-3.5 h-3.5" />{shop.delivery_time_min} {t("min")}
          </div>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>₹{shop.delivery_fee} {t("delivery")}</span>
        </div>
      </div>
    </Link>
  );
}