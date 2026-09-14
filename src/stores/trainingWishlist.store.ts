import { create } from 'zustand';

export type WishlistTraining = {
  id: string;
  title: string;
  detail: string;
  priceLabel: string;
};

type TrainingWishlistState = {
  items: WishlistTraining[];
  toggle: (item: WishlistTraining) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
};

export const useTrainingWishlistStore = create<TrainingWishlistState>(
  (set, get) => ({
    items: [],
    toggle: (item) => {
      const exists = get().items.some((row) => row.id === item.id);
      set({
        items: exists
          ? get().items.filter((row) => row.id !== item.id)
          : [item, ...get().items],
      });
    },
    remove: (id) =>
      set({ items: get().items.filter((row) => row.id !== id) }),
    has: (id) => get().items.some((row) => row.id === id),
  }),
);
