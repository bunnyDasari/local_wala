"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

// Pages that use the full sidebar+topbar shell
const SHELL_ROUTES = ["/dashboard", "/shop", "/cart", "/orders", "/tracking", "/vendor"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const useShell = SHELL_ROUTES.some((r) => pathname.startsWith(r));

  if (!useShell) {
    // Homepage and other public pages render without sidebar
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <TopBar />
        <main className="flex-1 p-4 md:p-8 page-enter">{children}</main>
      </div>
    </div>
  );
}
