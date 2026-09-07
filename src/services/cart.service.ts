import type {
  AddToCartPayload,
  Cart,
  CartApiResponse,
  UpdateCartItemPayload,
} from '@/types/cart.types';
import { mapCartApi } from '@/utils/cart.mapper';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const cartService = {
  getMyCart: async (): Promise<Cart> => {
    if (__DEV__) {
      console.log('[Cart API] GET my cart');
    }

    const response = await apiClient.get<CartApiResponse>(ENDPOINTS.CART.GET);
    return mapCartApi(response.data);
  },

  addItem: async (payload: AddToCartPayload): Promise<Cart> => {
    if (__DEV__) {
      console.log('[Cart API] POST add item', payload);
    }

    const response = await apiClient.post<CartApiResponse>(ENDPOINTS.CART.ADD, {
      product_id: payload.product_id,
      quantity: Math.max(1, payload.quantity),
    });

    return mapCartApi(response.data);
  },

  updateItemQuantity: async (payload: UpdateCartItemPayload): Promise<Cart> => {
    if (__DEV__) {
      console.log('[Cart API] PATCH item quantity', payload);
    }

    const response = await apiClient.patch<CartApiResponse>(
      ENDPOINTS.CART.UPDATE_ITEM(payload.itemId),
      { quantity: Math.max(1, payload.quantity) },
    );

    return mapCartApi(response.data);
  },

  removeItem: async (itemId: string): Promise<Cart> => {
    if (__DEV__) {
      console.log('[Cart API] DELETE item', itemId);
    }

    const response = await apiClient.delete<CartApiResponse>(
      ENDPOINTS.CART.REMOVE_ITEM(itemId),
    );

    return mapCartApi(response.data);
  },

  clearCart: async (): Promise<Cart> => {
    if (__DEV__) {
      console.log('[Cart API] DELETE clear cart');
    }

    await apiClient.delete(ENDPOINTS.CART.CLEAR);

    try {
      return await cartService.getMyCart();
    } catch {
      return {
        id: '',
        status: 'empty',
        items: [],
        subtotal: 0,
        currency: 'USD',
      };
    }
  },
};
