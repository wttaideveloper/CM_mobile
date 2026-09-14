import { useEffect } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { addressService } from '@/services/address.service';
import { useMarketCheckoutAddressStore } from '@/stores/marketCheckoutAddress.store';
import type { ApiError } from '@/types/api.types';
import type { CreateAddressPayload, SavedAddress } from '@/types/address.types';

export const addressKeys = {
  all: ['addresses'] as const,
  list: () => [...addressKeys.all, 'list'] as const,
};

function syncAddressStore(addresses: SavedAddress[]) {
  useMarketCheckoutAddressStore.getState().setAddresses(addresses);
}

type UseAddressesOptions = Omit<
  UseQueryOptions<SavedAddress[], ApiError>,
  'queryKey' | 'queryFn'
>;

export function useAddresses(options?: UseAddressesOptions) {
  const query = useQuery<SavedAddress[], ApiError>({
    queryKey: addressKeys.list(),
    queryFn: addressService.getSavedAddresses,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    ...options,
  });

  useEffect(() => {
    if (query.data) {
      syncAddressStore(query.data);
    }
  }, [query.data]);

  return {
    ...query,
    addresses: query.data ?? [],
  };
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation<SavedAddress, ApiError, CreateAddressPayload>({
    mutationFn: addressService.createAddress,
    onSuccess: (address) => {
      const previous =
        queryClient.getQueryData<SavedAddress[]>(addressKeys.list()) ?? [];
      const next = [
        address,
        ...previous.filter((item) => item.id !== address.id),
      ];
      queryClient.setQueryData(addressKeys.list(), next);
      syncAddressStore(next);
      useMarketCheckoutAddressStore.getState().selectAddress(address.id);
    },
  });
}
