"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [dark, setDark] = useState(false);

    // On mount — read saved preference or system preference
    useEffect(() => {
        const saved = localStorage.getItem("lw_theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isDark = saved ? saved === "dark" : prefersDark;
        setDark(isDark);
        document.documentElement.classList.toggle("dark", isDark);
    }, []);

    const toggle = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("lw_theme", next ? "dark" : "light");
    };

    return (
        <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
            style={{
                background: dark
                    ? "linear-gradient(135deg, #1e293b, #334155)"
                    : "linear-gradient(135deg, #fed7aa, #fb923c)",
            }}
        >
            {/* Track icons */}
            <Sun className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-80" />
            <Moon className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-80" />

            {/* Thumb */}
            <span
                className={`absolute top-0.5 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center
          ${dark ? "translate-x-7 bg-slate-800" : "translate-x-0.5 bg-white"}`}
            >
                {dark
                    ? <Moon className="w-3.5 h-3.5 text-brand-400" />
                    : <Sun className="w-3.5 h-3.5 text-brand-500" />
                }
            </span>
        </button>
    );
}