"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { shopsApi, productsApi } from "@/lib/api";
import type { Shop, Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { Spinner, StarRating, Price, EmptyState } from "@/components/shared";
import { Clock, Bike, ShoppingBag, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());
  const { addItem } = useCartStore();

  useEffect(() => {
    const shopId = parseInt(id);
    Promise.all([shopsApi.getShop(shopId), productsApi.getByShop(shopId)])
      .then(([s, p]) => { setShop(s); setProducts(p); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async (product: Product) => {
    setAdding(product.id);
    try {
      await addItem(product.id, 1);
      setAdded((prev) => new Set(prev).add(product.id));
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => setAdded((prev) => { const n = new Set(prev); n.delete(product.id); return n; }), 2000);
    } catch {
      toast.error("Login required to add items");
    } finally {
      setAdding(null);
    }
  };

  if (loading) return <Spinner />;
  if (!shop) return <EmptyState icon="🏪" title="Shop not found" />;

  const EMOJI: Record<string, string> = { Groceries: "🛒", Vegetables: "🥦", Meat: "🥩", Medicines: "💊", Clothing: "👕" };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-fade-in max-w-4xl mx-auto">
      {/* Back */}
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to shops
      </Link>

      {/* Shop Header Card */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-3xl shrink-0">
            {EMOJI[shop.category.name] ?? "🏪"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{shop.name}</h1>
              <span className={`badge ${shop.is_open ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {shop.is_open ? "● Open Now" : "● Closed"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{shop.description}</p>
            <p className="text-xs text-gray-400 mt-1">📍 {shop.address}</p>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                <StarRating rating={shop.rating} reviews={shop.total_reviews} />
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-brand-500" /> {shop.delivery_time_min} min
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                <Bike className="w-4 h-4 text-brand-500" /> ₹{shop.delivery_fee} delivery
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                <ShoppingBag className="w-4 h-4 text-brand-500" /> Min ₹{shop.min_order}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Products ({products.length})</h2>
        {products.length === 0 ? (
          <EmptyState icon="📦" title="No products available" subtitle="This shop hasn't listed products yet." />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={() => handleAdd(product)}
                loading={adding === product.id}
                justAdded={added.has(product.id)}
                image={product.image_url ?? ""}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAdd, loading, justAdded, image }: {
  product: Product;
  onAdd: () => void;
  loading: boolean;
  justAdded: boolean;
  image: string;
}) {
  return (
    <div className="card p-4 flex gap-3 items-start hover:shadow-md transition-all">

      <img src={image ?? ""} alt={product.name} className="w-14 h-14 rounded-xl object-cover" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.description}</p>
        <p className="text-xs text-gray-400 mt-0.5">per {product.unit}</p>
        <div className="flex items-center justify-between mt-2">
          <Price price={product.price} original={product.original_price} />
          <button
            onClick={onAdd}
            disabled={loading || !product.is_available}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${justAdded
              ? "bg-green-500 text-white"
              : "bg-brand-500 hover:bg-brand-600 text-white"
              } disabled:opacity-60`}
          >
            {justAdded ? <><Check className="w-3.5 h-3.5" /> Added</> : loading ? "..." : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
