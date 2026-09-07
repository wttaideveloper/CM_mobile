import { useEffect } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { cartService } from '@/services/cart.service';
import { useCartStore } from '@/stores/cart.store';
import type { ApiError } from '@/types/api.types';
import type {
  AddToCartPayload,
  Cart,
  UpdateCartItemPayload,
} from '@/types/cart.types';

export const cartKeys = {
  all: ['cart'] as const,
  mine: () => [...cartKeys.all, 'mine'] as const,
};

function syncCartStore(cart: Cart) {
  useCartStore.getState().replaceItems(
    cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      image: item.image,
      unitPrice: item.unitPrice,
      currency: item.currency,
      quantity: item.quantity,
      stockQuantity: item.stockQuantity,
    })),
  );
}

function applyCartSuccess(queryClient: ReturnType<typeof useQueryClient>, cart: Cart) {
  queryClient.setQueryData(cartKeys.mine(), cart);
  syncCartStore(cart);
}

type UseCartOptions = Omit<UseQueryOptions<Cart, ApiError>, 'queryKey' | 'queryFn'>;

export function useCart(options?: UseCartOptions) {
  const query = useQuery<Cart, ApiError>({
    queryKey: cartKeys.mine(),
    queryFn: cartService.getMyCart,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    ...options,
  });

  useEffect(() => {
    if (query.data) {
      syncCartStore(query.data);
    }
  }, [query.data]);

  return {
    ...query,
    cart: query.data,
    items: query.data?.items ?? [],
  };
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation<Cart, ApiError, AddToCartPayload>({
    mutationFn: cartService.addItem,
    onSuccess: (cart) => applyCartSuccess(queryClient, cart),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation<Cart, ApiError, UpdateCartItemPayload>({
    mutationFn: cartService.updateItemQuantity,
    onSuccess: (cart) => applyCartSuccess(queryClient, cart),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation<Cart, ApiError, string>({
    mutationFn: cartService.removeItem,
    onSuccess: (cart) => applyCartSuccess(queryClient, cart),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation<Cart, ApiError, void>({
    mutationFn: cartService.clearCart,
    onSuccess: (cart) => applyCartSuccess(queryClient, cart),
  });
}
