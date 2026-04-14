import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

// ─── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={clsx("flex items-center justify-center py-16", className)}>
      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1 max-w-xs">{subtitle}</p>}
    </div>
  );
}

// ─── Star Rating ────────────────────────────────────────────────────────────
export function StarRating({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-yellow-400 text-sm">★</span>
      <span className="text-sm font-semibold text-gray-800">{rating.toFixed(1)}</span>
      {reviews !== undefined && (
        <span className="text-xs text-gray-400">({reviews})</span>
      )}
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────
export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {action}
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  "Order Placed":               "bg-blue-50 text-blue-700",
  "Vendor Preparing":           "bg-yellow-50 text-yellow-700",
  "Picked by Delivery Partner": "bg-purple-50 text-purple-700",
  "Delivered":                  "bg-green-50 text-green-700",
  "Cancelled":                  "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={clsx("badge", STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600")}>
      {status}
    </span>
  );
}

// ─── Price Display ──────────────────────────────────────────────────────────
export function Price({ price, original }: { price: number; original?: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-bold text-gray-900">₹{price}</span>
      {original && original > price && (
        <span className="text-xs text-gray-400 line-through">₹{original}</span>
      )}
    </div>
  );
}

// ─── Quantity Stepper ───────────────────────────────────────────────────────
export function QuantityStepper({
  quantity, onDecrement, onIncrement, loading,
}: { quantity: number; onDecrement: () => void; onIncrement: () => void; loading?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDecrement}
        disabled={loading}
        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors font-bold disabled:opacity-50"
      >−</button>
      <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
      <button
        onClick={onIncrement}
        disabled={loading}
        className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white hover:bg-brand-600 transition-colors font-bold disabled:opacity-50"
      >+</button>
    </div>
  );
}
