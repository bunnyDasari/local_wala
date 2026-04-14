// src/store/langStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { translations, type Language, type TranslationKey } from "@/lib/translations";

interface LangStore {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

export const useLangStore = create<LangStore>()(
    persist(
        (set, get) => ({
            lang: "en",
            setLang: (lang) => set({ lang }),
            t: (key) => translations[get().lang][key] as string,
        }),
        { name: "lw_lang" }
    )
);