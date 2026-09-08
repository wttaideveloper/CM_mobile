import {
  LISTING_DETAILS,
  LISTING_REVIEW_ITEM,
  MARKET_LISTING,
} from '@/components/market/marketListingData';
import type { ProductDetailItem } from '@/types/product.types';
import { formatMoney } from '@/utils/currency';

export type MarketListingView = {
  id: string;
  title: string;
  kind: string;
  kindMeta: string;
  price: string;
  priceMeta: string;
  cartLabel: string;
  vendorInitials: string;
  vendorName: string;
  vendorMeta: string;
  description: string;
  mediaBg: string;
  mediaIcon: string;
  imageUrl: string | null;
  details: { id: string; label: string; value: string }[];
  review: typeof LISTING_REVIEW_ITEM;
  enterpriseId?: string;
};

function textOrFallback(value: string | null | undefined, fallback: string): string {
  if (value == null) return fallback;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'NA') return fallback;
  return trimmed;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'BZ';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase() || 'BZ';
}

export const STATIC_MARKET_LISTING_VIEW: MarketListingView = {
  id: 'static',
  ...MARKET_LISTING,
  imageUrl: null,
  details: LISTING_DETAILS.map((item) => ({ ...item })),
  review: LISTING_REVIEW_ITEM,
};

/** Map GET /products/:id → market product listing UI (static fallbacks for missing). */
export function mapProductDetailToMarketListing(
  item: ProductDetailItem,
  fallback: MarketListingView = STATIC_MARKET_LISTING_VIEW,
): MarketListingView {
  const title = textOrFallback(item.name, fallback.title);
  const category = textOrFallback(item.category, 'Product');
  const displayPrice = item.salePrice != null && item.salePrice > 0
    ? item.salePrice
    : item.price ?? 0;
  const price = formatMoney(displayPrice, item.currency);
  const vendorName = textOrFallback(item.enterpriseName, fallback.vendorName);
  const imageUrl = item.images.find((url) => url.trim())?.trim() || null;

  return {
    id: item.id || fallback.id,
    title,
    kind: 'PRODUCT',
    kindMeta: `${category} · Product`,
    price,
    priceMeta: fallback.priceMeta,
    cartLabel: `Add to cart · ${price}`,
    vendorInitials: initialsFromName(vendorName),
    vendorName,
    vendorMeta: fallback.vendorMeta,
    description: textOrFallback(item.description, fallback.description),
    mediaBg: fallback.mediaBg,
    mediaIcon: fallback.mediaIcon,
    imageUrl,
    details: [
      {
        id: 'stock',
        label: 'Stock',
        value: String(item.stockCount ?? 0),
      },
      {
        id: 'sku',
        label: 'SKU',
        value: textOrFallback(item.sku, fallback.details[1]?.value ?? '—'),
      },
      {
        id: 'weight',
        label: 'Weight',
        value: textOrFallback(item.weight, '0'),
      },
      {
        id: 'pillar',
        label: 'Pillar',
        value: category,
      },
    ],
    // Reviews API not available — keep static review card.
    review: fallback.review,
    enterpriseId: item.enterpriseId || undefined,
  };
}
