"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home, Store, ShoppingCart, ClipboardList,
  User, LayoutDashboard, Package, LogOut, LogIn,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import AuthModal from "@/components/ui/AuthModal";

export default function Sidebar() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());
  const { isLoggedIn, userName, role, logout } = useAuthStore();
  const [showAuth, setShowAuth] = useState(false);

  const USER_NAV = [
    { label: "Home",   href: "/dashboard", icon: Home },
    { label: "Shops",  href: "/shop",      icon: Store },
    { label: "Cart",   href: "/cart",      icon: ShoppingCart, badge: true },
    { label: "Orders", href: "/orders",    icon: ClipboardList },
  ];

  const VENDOR_NAV = [
    { label: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
    { label: "Shop",      href: "/vendor/shop",      icon: Store },
    { label: "Products",  href: "/vendor/products",  icon: Package },
    { label: "Orders",    href: "/vendor/orders",    icon: ClipboardList },
  ];

  const NAV = role === "vendor" ? VENDOR_NAV : USER_NAV;

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-full w-60 flex-col z-40"
        style={{ background: "var(--bg-card)", borderRight: "1px solid var(--border)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: "var(--brand)" }}>
            🛵
          </div>
          <div>
            <p className="font-black text-base" style={{ color: "var(--text)" }}>LocalWala</p>
            <p className="text-[11px]" style={{ color: "var(--text-3)" }}>Hyperlocal Delivery</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ label, href, icon: Icon, badge }: any) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all relative"
                style={{
                  background: active ? "var(--brand)" : "transparent",
                  color: active ? "white" : "var(--text-3)",
                  boxShadow: active ? "var(--shadow-brand)" : "none",
                }}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="flex-1">{label}</span>
                {badge && role !== "vendor" && itemCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-brand-600 text-[10px] font-black flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 pb-6" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          {isLoggedIn ? (
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
              style={{ background: "var(--bg-input)", color: "var(--text-2)" }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                style={{ background: "var(--brand)", color: "white" }}>
                {(userName ?? "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{userName}</p>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  {role === "vendor" ? "Vendor" : "Tap to logout"}
                </p>
              </div>
              <LogOut className="w-4 h-4 shrink-0" style={{ color: "var(--text-3)" }} />
            </button>
          ) : (
            <button onClick={() => setShowAuth(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm"
              style={{ background: "var(--brand)", color: "white", boxShadow: "var(--shadow-brand)" }}
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ────────────────────────────────────────── */}
      <nav className="bottom-nav md:hidden">
        {NAV.map(({ label, href, icon: Icon, badge }: any) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`bottom-nav-item ${active ? "active" : ""}`}>
              <div className="relative">
                <Icon />
                {badge && role !== "vendor" && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                    style={{ background: "var(--brand)", color: "white" }}>
                    {itemCount}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
        {isLoggedIn ? (
          <button onClick={logout} className="bottom-nav-item">
            <div className="w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px]"
              style={{ background: "var(--brand)", color: "white" }}>
              {(userName ?? "U")[0].toUpperCase()}
            </div>
            <span>Profile</span>
          </button>
        ) : (
          <button onClick={() => setShowAuth(true)} className="bottom-nav-item">
            <User />
            <span>Sign In</span>
          </button>
        )}
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
