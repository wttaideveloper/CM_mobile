import type {
  Cart,
  CartApiResponse,
  CartItem,
  CartItemApiResponse,
} from '@/types/cart.types';
import { normalizeCurrencyCode } from '@/utils/currency';

const DEFAULT_CART_IMAGE =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=160&h=160&fit=crop';

function pickCartImage(raw?: string | null): string {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return DEFAULT_CART_IMAGE;
  }

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed) && typeof parsed[0] === 'string' && parsed[0].trim()) {
        return parsed[0].trim();
      }
    } catch {
      // fall through
    }
  }

  const first = trimmed.split(/[,;|]/)[0]?.trim();
  return first || DEFAULT_CART_IMAGE;
}

export function mapCartItemApi(item: CartItemApiResponse): CartItem {
  const quantity = Math.max(0, item.quantity ?? 0);
  const unitPrice = item.unit_price ?? 0;
  const currency = normalizeCurrencyCode(item.currency);

  return {
    id: item.id,
    productId: item.product_id,
    name: item.product_name?.trim() || 'Product',
    image: pickCartImage(item.product_images),
    sku: item.sku?.trim() || '',
    quantity,
    unitPrice,
    currency,
    lineTotal: item.line_total ?? unitPrice * quantity,
    stockQuantity: item.stock_quantity ?? 0,
  };
}

export function mapCartApi(response: CartApiResponse): Cart {
  const items = (response.items ?? []).map(mapCartItemApi);
  const currency = normalizeCurrencyCode(response.currency ?? items[0]?.currency);

  return {
    id: response.id,
    status: response.status?.trim() || 'active',
    items,
    subtotal:
      response.subtotal ??
      items.reduce((sum, item) => sum + item.lineTotal, 0),
    currency,
  };
}
