import type {
  AddressApiItem,
  AddressListApiResponse,
  CreateAddressPayload,
  SavedAddress,
} from '@/types/address.types';
import {
  mapAddressApiItem,
  mapAddressListApi,
} from '@/utils/address.mapper';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const addressService = {
  getSavedAddresses: async (): Promise<SavedAddress[]> => {
    if (__DEV__) {
      console.log('[Address API] GET saved addresses');
    }

    const response = await apiClient.get<AddressListApiResponse | AddressApiItem[]>(
      ENDPOINTS.ADDRESSES.GET_ALL,
    );
    return mapAddressListApi(response.data);
  },

  createAddress: async (payload: CreateAddressPayload): Promise<SavedAddress> => {
    if (__DEV__) {
      console.log('[Address API] POST create address', payload);
    }

    const response = await apiClient.post<AddressApiItem>(
      ENDPOINTS.ADDRESSES.CREATE,
      payload,
    );
    return mapAddressApiItem(response.data);
  },
};
