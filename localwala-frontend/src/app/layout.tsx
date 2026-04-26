import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AppShell from "@/components/layout/AppShell";

// Poppins — bold headings, punchy feel like food delivery apps
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

// DM Sans — clean, modern body text
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LocalWala — Hyperlocal Delivery",
  description: "Order from local shops near you. Fresh groceries, vegetables, medicines and more delivered fast.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var saved = localStorage.getItem('lw_theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (saved === 'dark' || (!saved && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body style={{ background: "var(--bg)", color: "var(--text)" }}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "14px",
              fontFamily: "var(--font-dm-sans), sans-serif",
              background: "var(--bg-card)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              fontWeight: "600",
            }
          }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
