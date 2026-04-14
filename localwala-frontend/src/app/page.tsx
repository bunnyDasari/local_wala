"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function RootPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if we are actually at root "/"
    if (pathname === "/") {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  return null;
}