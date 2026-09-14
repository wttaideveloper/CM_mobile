import {
  MARKET_CART_GROUPS,
  MARKET_CART_SUMMARY,
  type MarketCartGroup,
  type MarketCartItem,
} from '@/components/market/marketCartData';
import type { Cart, CartItem } from '@/types/cart.types';
import { formatMoney } from '@/utils/currency';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=160&h=160&fit=crop';

function pickImageUrl(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'NA') return null;
  if (trimmed.includes('photo-1571019613454-1cb2f99b2d8b')) return null;
  return trimmed;
}

export function mapCartItemToMarketCartItem(item: CartItem): MarketCartItem {
  return {
    id: item.id,
    productId: item.productId,
    title: item.name,
    subtitle: item.sku ? `SKU · ${item.sku}` : 'Product',
    price: formatMoney(item.unitPrice, item.currency),
    qty: Math.max(1, item.quantity),
    iconBg: '#e6f4e8',
    iconColor: '#257d3f',
    icon: 'bag',
    imageUrl: pickImageUrl(item.image),
    isApiItem: true,
  };
}

/** API cart → one market UI group (empty when no API items). */
export function mapCartToMarketGroups(cart: Cart | null | undefined): MarketCartGroup[] {
  if (!cart?.items.length) return [];

  return [
    {
      id: 'api-cart',
      initials: 'YT',
      name: 'Your items',
      avatarBg: '#e6f4e8',
      avatarColor: '#257d3f',
      items: cart.items.map(mapCartItemToMarketCartItem),
    },
  ];
}

/** Keep static mock groups for UI checking; prepend live API cart groups. */
export function mergeMarketCartGroups(
  cart: Cart | null | undefined,
): MarketCartGroup[] {
  return [...mapCartToMarketGroups(cart), ...MARKET_CART_GROUPS];
}

export function buildMarketCartSummary(cart: Cart | null | undefined) {
  if (!cart || cart.items.length === 0) {
    return MARKET_CART_SUMMARY;
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = formatMoney(cart.subtotal, cart.currency);

  return {
    businesses: 1,
    items: itemCount,
    subtotal,
    delivery: MARKET_CART_SUMMARY.delivery,
    tax: MARKET_CART_SUMMARY.tax,
    total: subtotal,
  };
}

export { PLACEHOLDER_IMAGE };
