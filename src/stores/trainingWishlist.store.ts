import { create } from 'zustand';

import { useAuthStore } from '@/stores/auth.store';

export type WishlistTraining = {
  id: string;
  title: string;
  detail: string;
  priceLabel: string;
};

type TrainingWishlistState = {
  /** userId → wishlist items */
  byUser: Record<string, WishlistTraining[]>;
  toggle: (item: WishlistTraining) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  itemsForUser: (userId?: string | null) => WishlistTraining[];
};

function currentUserId(): string | null {
  const id = useAuthStore.getState().user?.id?.trim();
  return id || null;
}

export const useTrainingWishlistStore = create<TrainingWishlistState>(
  (set, get) => ({
    byUser: {},

    itemsForUser: (userId) => {
      const uid = userId?.trim() || currentUserId();
      if (!uid) return [];
      return get().byUser[uid] ?? [];
    },

    toggle: (item) => {
      const userId = currentUserId();
      if (!userId) return;
      const current = get().byUser[userId] ?? [];
      const exists = current.some((row) => row.id === item.id);
      set({
        byUser: {
          ...get().byUser,
          [userId]: exists
            ? current.filter((row) => row.id !== item.id)
            : [item, ...current],
        },
      });
    },

    remove: (id) => {
      const userId = currentUserId();
      if (!userId) return;
      const current = get().byUser[userId] ?? [];
      set({
        byUser: {
          ...get().byUser,
          [userId]: current.filter((row) => row.id !== id),
        },
      });
    },

    has: (id) => {
      const userId = currentUserId();
      if (!userId) return false;
      return (get().byUser[userId] ?? []).some((row) => row.id === id);
    },
  }),
);
