import { create } from "zustand";
import { cartApi } from "@/lib/api";
import type { Cart } from "@/types";

interface CartStore {
  cart: Cart | null;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const cart = await cartApi.get();
      set({ cart });
    } catch {
      set({ cart: null });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    const cart = await cartApi.add(productId, quantity);
    set({ cart });
  },

  updateItem: async (itemId, quantity) => {
    const cart = await cartApi.update(itemId, quantity);
    set({ cart });
  },

  clearCart: async () => {
    await cartApi.clear();
    set({ cart: null });
  },

  itemCount: () => {
    const { cart } = get();
    return cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  },
}));
