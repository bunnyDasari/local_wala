"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Store, ShoppingCart, MapPin,
  ClipboardList, LogOut, Bike, LogIn, User,
} from "lucide-react";
import { clsx } from "clsx";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useLangStore } from "@/store/langStore";
import AuthModal from "@/components/ui/AuthModal";

export default function Sidebar() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());
  const { isLoggedIn, userName, role, logout } = useAuthStore();
  const { t } = useLangStore();
  const [showAuth, setShowAuth] = useState(false);

  // Navigation based on role
  const USER_NAV = [
    { label: t("dashboard"), href: "/dashboard", icon: LayoutDashboard, badge: false },
    { label: t("shop"), href: "/shop", icon: Store, badge: false },
    { label: t("cart"), href: "/cart", icon: ShoppingCart, badge: true },
    { label: t("trackOrder"), href: "/tracking", icon: MapPin, badge: false },
    { label: t("myOrders"), href: "/orders", icon: ClipboardList, badge: false },
  ];

  const VENDOR_NAV = [
    { label: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard, badge: false },
    { label: "My Shop", href: "/vendor/shop", icon: Store, badge: false },
    { label: "Products", href: "/vendor/products", icon: ShoppingCart, badge: false },
    { label: "Orders", href: "/vendor/orders", icon: ClipboardList, badge: false },
  ];

  const NAV = role === "vendor" ? VENDOR_NAV : USER_NAV;

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col z-40 shadow-sm"
        style={{ background: "var(--surface)", borderRight: "1px solid var(--border-soft)" }}
      >
        <div className="flex items-center gap-3 px-6 py-5"
          style={{ borderBottom: "1px solid var(--border-soft)" }}>
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <Bike className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold leading-none" style={{ color: "var(--text)" }}>LocalWala</p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-subtle)" }}>Hyperlocal Delivery</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ label, href, icon: Icon, badge }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  active ? "bg-brand-50 text-brand-600" : "hover:opacity-80"
                )}
                style={!active ? { color: "var(--text-muted)" } : {}}
              >
                <Icon className={clsx("w-5 h-5 shrink-0", active ? "text-brand-500" : "")}
                  style={!active ? { color: "var(--text-subtle)" } : {}} />
                <span className="flex-1">{label}</span>
                {badge && role !== "vendor" && itemCount > 0 && (
                  <span className="bg-brand-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4" style={{ borderTop: "1px solid var(--border-soft)" }}>
          {isLoggedIn ? (
            <div onClick={logout}
              className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors hover:opacity-80 group">
              <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-sm shrink-0">
                {(userName ?? "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{userName}</p>
                <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                  {role === "vendor" ? "Vendor Account" : t("logout")}
                </p>
              </div>
              <LogOut className="w-4 h-4 group-hover:text-red-400 transition-colors"
                style={{ color: "var(--text-subtle)" }} />
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-50 text-brand-600 transition-colors">
              <LogIn className="w-4 h-4" />
              <span className="text-sm font-semibold">{t("signIn")}</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile bottom nav ────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
        style={{ background: "var(--surface)", borderTop: "1px solid var(--border-soft)" }}>
        {NAV.map(({ label, href, icon: Icon, badge }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors relative"
              style={{ color: active ? "var(--brand)" : "var(--text-subtle)" }}
            >
              <Icon className="w-5 h-5" />
              {label.split(" ")[0]}
              {badge && role !== "vendor" && itemCount > 0 && (
                <span className="absolute top-1.5 right-[20%] bg-brand-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          );
        })}
        {isLoggedIn ? (
          <button onClick={logout}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium"
            style={{ color: "var(--text-subtle)" }}>
            <div className="w-5 h-5 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-[10px]">
              {(userName ?? "U")[0].toUpperCase()}
            </div>
            <span>{t("logout")}</span>
          </button>
        ) : (
          <button onClick={() => setShowAuth(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium text-brand-500">
            <User className="w-5 h-5" />
            <span>{t("signIn")}</span>
          </button>
        )}
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}