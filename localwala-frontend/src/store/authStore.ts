import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/lib/api";
import type { TokenResponse } from "@/types";

interface AuthState {
  token: string | null;
  userId: number | null;
  userName: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  setUser: (res: TokenResponse) => void;   // ← used after OTP verify
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      userName: null,
      isLoggedIn: false,

      login: async (email, password) => {
        const res: TokenResponse = await authApi.login(email, password);
        if (typeof window !== "undefined") localStorage.setItem("lw_token", res.access_token);
        set({ token: res.access_token, userId: res.user_id, userName: res.name, isLoggedIn: true });
      },

      register: async (data) => {
        const res: TokenResponse = await authApi.register(data);
        if (typeof window !== "undefined") localStorage.setItem("lw_token", res.access_token);
        set({ token: res.access_token, userId: res.user_id, userName: res.name, isLoggedIn: true });
      },

      setUser: (res: TokenResponse) => {
        if (typeof window !== "undefined") localStorage.setItem("lw_token", res.access_token);
        set({ token: res.access_token, userId: res.user_id, userName: res.name, isLoggedIn: true });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("lw_token");
          localStorage.removeItem("lw_user");
        }
        set({ token: null, userId: null, userName: null, isLoggedIn: false });
      },
    }),
    { name: "lw_auth" }
  )
);