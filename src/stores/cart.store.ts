import { create } from 'zustand';

export type MockCartItem = {
  /** Cart line item id from API — required for PATCH/DELETE item. */
  id?: string;
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  currency: string;
  quantity: number;
  stockQuantity?: number;
};

export const CHECKOUT_SHIPPING = 6;

export function getCheckoutTotals(items: MockCartItem[]) {
  const currency = items[0]?.currency ?? 'USD';
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = items.length > 0 ? CHECKOUT_SHIPPING : 0;
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    currency,
    subtotal,
    shipping,
    total: subtotal + shipping,
    count,
  };
}

type CartState = {
  items: MockCartItem[];
  checkoutItems: MockCartItem[];
  replaceItems: (items: MockCartItem[]) => void;
  addItem: (item: Omit<MockCartItem, 'quantity'>, quantity: number) => void;
  setItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  startCartCheckout: () => void;
  startBuyNow: (item: Omit<MockCartItem, 'quantity'>, quantity: number) => void;
  clearCheckout: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  checkoutItems: [],
  replaceItems: (items) => set({ items }),
  addItem: (item, quantity) => {
    const nextQty = Math.max(1, quantity);
    const existing = get().items.find((entry) => entry.productId === item.productId);

    if (!existing) {
      set({ items: [...get().items, { ...item, quantity: nextQty }] });
      return;
    }

    set({
      items: get().items.map((entry) =>
        entry.productId === item.productId
          ? { ...entry, quantity: entry.quantity + nextQty }
          : entry,
      ),
    });
  },
  setItemQuantity: (productId, quantity) => {
    const nextQty = Math.max(1, quantity);
    set({
      items: get().items.map((entry) =>
        entry.productId === productId ? { ...entry, quantity: nextQty } : entry,
      ),
    });
  },
  removeItem: (productId) => {
    set({ items: get().items.filter((entry) => entry.productId !== productId) });
  },
  startCartCheckout: () => {
    set({ checkoutItems: [...get().items] });
  },
  startBuyNow: (item, quantity) => {
    const nextQty = Math.max(1, quantity);
    set({ checkoutItems: [{ ...item, quantity: nextQty }] });
  },
  clearCheckout: () => set({ checkoutItems: [] }),
}));
