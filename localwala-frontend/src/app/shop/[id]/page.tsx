"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { shopsApi, productsApi } from "@/lib/api";
import type { Shop, Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Spinner, StarRating, EmptyState } from "@/components/shared";
import { Clock, Bike, ArrowLeft, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const EMOJI: Record<string, string> = {
  Groceries: "🛒", Vegetables: "🥦", Meat: "🥩", Medicines: "💊", Clothing: "👕",
};

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [adding, setAdding] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const { addItem, cart } = useCartStore();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    const shopId = parseInt(id);
    Promise.all([shopsApi.getShop(shopId), productsApi.getByShop(shopId)])
      .then(([s, p]) => { setShop(s); setProducts(p); })
      .finally(() => setLoading(false));
  }, [id]);

  const cartTotal = cart?.total ?? 0;
  const cartCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  const handleAdd = async (product: Product) => {
    if (!isLoggedIn) {
      toast.error("Please login to add items");
      return;
    }
    setAdding(product.id);
    try {
      await addItem(product.id, 1);
      setQuantities(q => ({ ...q, [product.id]: (q[product.id] ?? 0) + 1 }));
      toast.success(`${product.name} added!`, { duration: 1500 });
    } catch {
      toast.error("Failed to add item");
    } finally {
      setAdding(null);
    }
  };

  const handleInc = async (product: Product) => {
    if (!isLoggedIn) return;
    setAdding(product.id);
    try {
      await addItem(product.id, 1);
      setQuantities(q => ({ ...q, [product.id]: (q[product.id] ?? 0) + 1 }));
    } finally { setAdding(null); }
  };

  const handleDec = (product: Product) => {
    const cur = quantities[product.id] ?? 0;
    if (cur <= 1) {
      setQuantities(q => { const n = { ...q }; delete n[product.id]; return n; });
    } else {
      setQuantities(q => ({ ...q, [product.id]: cur - 1 }));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  );
  if (!shop) return <EmptyState icon="🏪" title="Shop not found" />;

  const tabs = ["All", "Popular", "New"];

  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--surface-2)" }}>

      {/* ── Top Nav ─────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border-soft)" }}
      >
        <Link href="/shop" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
        </Link>
        <h1 className="font-bold text-base" style={{ color: "var(--text)" }}>{shop.name}</h1>
        <button
          onClick={() => router.push("/cart")}
          className="relative w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "var(--surface-3)" }}
        >
          <ShoppingCart className="w-5 h-5" style={{ color: "var(--text)" }} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Shop Hero ───────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2">
        <div
          className="rounded-3xl p-5 flex items-center gap-4"
          style={{ background: "var(--surface)" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: `${shop.category.color}22` }}
          >
            {shop.image_url
              ? <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover rounded-2xl" />
              : EMOJI[shop.category.name] ?? "🏪"
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-bold text-lg leading-tight" style={{ color: "var(--text)" }}>
                {shop.name}
              </h2>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${shop.is_open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {shop.is_open ? "Open" : "Closed"}
              </span>
            </div>
            <p className="text-xs mb-2 line-clamp-1" style={{ color: "var(--text-muted)" }}>
              {shop.description}
            </p>
            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold" style={{ color: "var(--text)" }}>{shop.rating.toFixed(1)}</span>
                <span>({shop.total_reviews})</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                {shop.delivery_time_min} min
              </span>
              <span className="flex items-center gap-1">
                <Bike className="w-3.5 h-3.5 text-brand-500" />
                ₹{shop.delivery_fee}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Tabs ───────────────────────────────────────────────── */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === tab
                ? "bg-gray-900 text-white dark:bg-brand-500"
                : "bg-white text-gray-500 border border-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Products Grid ───────────────────────────────────────────────── */}
      <div className="px-4">
        {products.length === 0 ? (
          <EmptyState icon="📦" title="No products available" subtitle="This shop hasn't listed products yet." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                qty={quantities[product.id] ?? 0}
                loading={adding === product.id}
                onAdd={() => handleAdd(product)}
                onInc={() => handleInc(product)}
                onDec={() => handleDec(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Sticky Cart Bar ─────────────────────────────────────────────── */}
      {cartCount > 0 && (
        <div className="cart-bar">
          <button
            onClick={() => router.push("/cart")}
            className="w-full max-w-lg mx-auto flex items-center justify-between bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-lg active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">
                {cartCount}
              </span>
              <span className="font-bold">View Cart</span>
            </div>
            <span className="font-bold text-lg">₹{cartTotal.toFixed(0)}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product, qty, loading, onAdd, onInc, onDec,
}: {
  product: Product;
  qty: number;
  loading: boolean;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
}) {
  const discount = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="product-card">
      {/* Image area */}
      <div
        className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
        style={{ background: "var(--surface-3)" }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl select-none">🛍️</span>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
            {discount}% OFF
          </span>
        )}
        {!product.is_available && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="p-3">
        <p className="text-xs font-semibold leading-tight line-clamp-2 mb-1" style={{ color: "var(--text)" }}>
          {product.name}
        </p>
        <p className="text-[10px] mb-2" style={{ color: "var(--text-subtle)" }}>
          {product.unit}
        </p>

        {/* Price + Add button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--text)" }}>
              ₹{product.price}
            </p>
            {product.original_price && product.original_price > product.price && (
              <p className="text-[10px] line-through" style={{ color: "var(--text-subtle)" }}>
                ₹{product.original_price}
              </p>
            )}
          </div>

          {qty === 0 ? (
            <button
              onClick={onAdd}
              disabled={loading || !product.is_available}
              className="btn-add disabled:opacity-50"
            >
              {loading ? "·" : "+"}
            </button>
          ) : (
            <div className="qty-stepper">
              <button onClick={onDec} className="qty-btn">
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center text-sm">{qty}</span>
              <button onClick={onInc} disabled={loading} className="qty-btn">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
