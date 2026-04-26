"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, role } = useAuthStore();

  useEffect(() => {
    // Redirect non-vendors to home
    if (!isLoggedIn) {
      router.push("/");
    } else if (role !== "vendor") {
      router.push("/dashboard");
    }
  }, [isLoggedIn, role, router]);

  // Show loading while checking auth
  if (!isLoggedIn || role !== "vendor") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return <>{children}</>;
}
