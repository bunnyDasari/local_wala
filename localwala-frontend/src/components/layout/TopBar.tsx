"use client";
import { Bell, Search, MapPin, Loader2, LocateFixed } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useLangStore } from "@/store/langStore";
import AuthModal from "@/components/ui/AuthModal";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LangToggle from "@/components/ui/LangToggle";

export default function TopBar() {
  const { label, city, loading, error } = useLocation();
  const { isLoggedIn } = useAuthStore();
  const { t } = useLangStore();
  const [showAuth, setShowAuth] = useState(false);

  const displayLabel = loading
    ? t("detecting")
    : city ? `${label}, ${city}` : label;

  return (
    <>
      <header
        className="sticky top-0 z-30 backdrop-blur-md border-b px-4 md:px-8 py-3 flex items-center gap-3"
        style={{ background: "var(--surface)", borderColor: "var(--border-soft)" }}
      >
        {/* Location */}
        <div className="flex items-center gap-1.5 min-w-0">
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin text-brand-500 shrink-0" />
            : error
              ? <MapPin className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
              : <LocateFixed className="w-4 h-4 text-brand-500 shrink-0" />
          }
          <span className="text-sm font-semibold truncate max-w-[180px]"
            style={{ color: "var(--text)" }}>
            {displayLabel}
          </span>
          {!loading && (
            <>
              <span className="mx-1 text-gray-300">|</span>
              <button
                onClick={() => !isLoggedIn && setShowAuth(true)}
                className="text-xs text-brand-500 font-semibold shrink-0 hover:underline"
              >
                {isLoggedIn ? t("change") : t("signIn")}
              </button>
            </>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--text-subtle)" }} />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition"
              style={{
                background: "var(--surface-3)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <LangToggle />
          <ThemeToggle />
          <button className="relative p-2 rounded-xl transition-colors"
            style={{ background: "var(--surface-3)" }}>
            <Bell className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
          </button>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}