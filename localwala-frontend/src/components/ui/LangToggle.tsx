// src/components/ui/LangToggle.tsx
"use client";
import { useLangStore } from "@/store/langStore";

export default function LangToggle() {
    const { lang, setLang } = useLangStore();
    const isTelugu = lang === "te";

    return (
        <button
            onClick={() => setLang(isTelugu ? "en" : "te")}
            aria-label="Toggle language"
            className="relative flex items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1 overflow-hidden"
            style={{
                width: "64px",
                height: "28px",
                background: isTelugu
                    ? "linear-gradient(135deg, #f97316, #ea580c)"
                    : "linear-gradient(135deg, #d1d5db, #9ca3af)",
            }}
        >
            {/* Sliding thumb */}
            <span
                className="absolute top-0.5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-md transition-all duration-300"
                style={{
                    width: "28px",
                    height: "24px",
                    background: "white",
                    transform: isTelugu ? "translateX(34px)" : "translateX(2px)",
                    color: isTelugu ? "#ea580c" : "#6b7280",
                }}
            >
                {isTelugu ? "తె" : "EN"}
            </span>

            {/* Background labels */}
            <span
                className="absolute left-1.5 text-[10px] font-bold text-white transition-opacity duration-200"
                style={{ opacity: isTelugu ? 1 : 0 }}
            >
                EN
            </span>
            <span
                className="absolute right-1.5 text-[10px] font-bold text-white transition-opacity duration-200"
                style={{ opacity: isTelugu ? 0 : 1 }}
            >
                తె
            </span>
        </button>
    );
}