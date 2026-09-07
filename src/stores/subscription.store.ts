import { create } from 'zustand';

import { fetchChatEligibility } from '@/services/subscription.service';
import type { ChatEligibility } from '@/types/subscription.types';

type SubscriptionState = {
  chatEligibility: ChatEligibility | null;
  isLoadingEligibility: boolean;
  loadChatEligibility: () => Promise<ChatEligibility>;
  clear: () => void;
};

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  chatEligibility: null,
  isLoadingEligibility: false,

  loadChatEligibility: async () => {
    set({ isLoadingEligibility: true });

    try {
      const data = await fetchChatEligibility();
      set({ chatEligibility: data, isLoadingEligibility: false });

      if (__DEV__) {
        console.log('✅ Chat eligibility:', {
          eligible: data.eligible,
          plan_type: data.plan_type,
          remaining_messages: data.remaining_messages,
          monthly_limit: data.monthly_limit,
          messages_used: data.messages_used,
          period_end: data.period_end,
          reason: data.reason,
        });
      }

      return data;
    } catch (error) {
      set({ isLoadingEligibility: false });
      throw error;
    }
  },

  clear: () => set({ chatEligibility: null, isLoadingEligibility: false }),
}));
