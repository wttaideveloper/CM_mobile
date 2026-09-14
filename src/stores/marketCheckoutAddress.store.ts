import { create } from 'zustand';

import type { MarketSavedAddress } from '@/components/market/marketAddressData';

type MarketCheckoutAddressState = {
  selectedAddressId: string;
  savedAddresses: MarketSavedAddress[];
  setAddresses: (addresses: MarketSavedAddress[]) => void;
  selectAddress: (id: string) => void;
  getSelectedAddress: () => MarketSavedAddress | undefined;
};

function pickSelectedId(
  addresses: MarketSavedAddress[],
  preferredId?: string,
): string {
  if (preferredId && addresses.some((item) => item.id === preferredId)) {
    return preferredId;
  }
  const defaultAddress = addresses.find((item) => item.isDefault);
  return defaultAddress?.id ?? addresses[0]?.id ?? '';
}

export const useMarketCheckoutAddressStore = create<MarketCheckoutAddressState>(
  (set, get) => ({
    selectedAddressId: '',
    savedAddresses: [],
    setAddresses: (addresses) =>
      set((state) => ({
        savedAddresses: addresses,
        selectedAddressId: pickSelectedId(addresses, state.selectedAddressId),
      })),
    selectAddress: (id) => set({ selectedAddressId: id }),
    getSelectedAddress: () => {
      const { selectedAddressId, savedAddresses } = get();
      return (
        savedAddresses.find((item) => item.id === selectedAddressId) ??
        savedAddresses[0]
      );
    },
  }),
);
