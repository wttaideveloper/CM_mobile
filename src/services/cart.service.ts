import type {
  AddToCartPayload,
  Cart,
  CartApiResponse,
  CartCheckoutPayload,
  CartCheckoutResult,
  UpdateCartItemPayload,
} from '@/types/cart.types';
import { mapCartApi } from '@/utils/cart.mapper';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

function mapCheckoutResult(data: unknown): CartCheckoutResult {
  if (!data || typeof data !== 'object') {
    return { raw: data };
  }

  const record = data as Record<string, unknown>;
  const id =
    typeof record.id === 'string'
      ? record.id
      : typeof record.order_id === 'string'
        ? record.order_id
        : undefined;

  return {
    id,
    orderId: typeof record.order_id === 'string' ? record.order_id : id,
    status: typeof record.status === 'string' ? record.status : undefined,
    raw: data,
  };
}

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

  checkout: async (payload: CartCheckoutPayload): Promise<CartCheckoutResult> => {
    if (__DEV__) {
      console.log('[Cart API] POST checkout', payload);
    }

    const response = await apiClient.post(ENDPOINTS.CART.CHECKOUT, payload);
    return mapCheckoutResult(response.data);
  },
};
