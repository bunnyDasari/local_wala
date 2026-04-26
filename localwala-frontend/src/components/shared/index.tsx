import { Loader2 } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-20 ${className ?? ""}`}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand)" }} />
    </div>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <span className="text-6xl">{icon}</span>
      <p className="text-lg font-bold" style={{ color: "var(--text)" }}>{title}</p>
      {subtitle && <p className="text-sm max-w-xs" style={{ color: "var(--text-3)" }}>{subtitle}</p>}
    </div>
  );
}

export function StarRating({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-yellow-400 text-sm">★</span>
      <span className="text-sm font-bold" style={{ color: "var(--text)" }}>{rating.toFixed(1)}</span>
      {reviews !== undefined && (
        <span className="text-xs" style={{ color: "var(--text-3)" }}>({reviews})</span>
      )}
    </div>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="section-title">{title}</h2>
      {action}
    </div>
  );
}

const STATUS_CLASS: Record<string, string> = {
  "Order Placed":               "status-placed",
  "Vendor Preparing":           "status-preparing",
  "Picked by Delivery Partner": "status-picked",
  "Delivered":                  "status-delivered",
  "Cancelled":                  "status-cancelled",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${STATUS_CLASS[status] ?? "status-placed"}`}>
      {status}
    </span>
  );
}

export function Price({ price, original }: { price: number; original?: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-black text-base" style={{ color: "var(--brand)" }}>₹{price}</span>
      {original && original > price && (
        <span className="text-xs line-through" style={{ color: "var(--text-3)" }}>₹{original}</span>
      )}
    </div>
  );
}

export function QuantityStepper({
  quantity, onDecrement, onIncrement, loading,
}: { quantity: number; onDecrement: () => void; onIncrement: () => void; loading?: boolean }) {
  return (
    <div className="qty-pill">
      <button onClick={onDecrement} disabled={loading}>−</button>
      <span>{quantity}</span>
      <button onClick={onIncrement} disabled={loading}>+</button>
    </div>
  );
}
