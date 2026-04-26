"use client";
import { Search, MapPin, Bell, Loader2 } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { useAuthStore } from "@/store/authStore";

export default function TopBar() {
  const { label, city, loading } = useLocation();
  const { userName } = useAuthStore();

  return (
    <header
      className="sticky top-0 z-30 px-4 md:px-6 py-4 flex items-center gap-3"
      style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
    >
      {/* Location */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
            Deliver to
          </span>
          <div className="flex items-center gap-1">
            {loading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "var(--brand)" }} />
              : <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--brand)" }} />
            }
            <span className="text-sm font-bold truncate max-w-[180px]" style={{ color: "var(--text)" }}>
              {loading ? "Detecting..." : city ? `${label}, ${city}` : label}
            </span>
          </div>
        </div>
      </div>

      {/* Search bar — desktop */}
      <div className="hidden md:flex flex-1 max-w-sm relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-3)" }} />
        <input
          type="text"
          placeholder="Search shops, products..."
          className="input pl-10 py-2.5 text-sm"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="relative w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--bg-input)" }}
        >
          <Bell className="w-5 h-5" style={{ color: "var(--text-2)" }} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: "var(--brand)" }} />
        </button>

        {userName && (
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm"
            style={{ background: "var(--brand)", color: "white" }}
          >
            {userName[0].toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
