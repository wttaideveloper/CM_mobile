import type { MarketOffer } from '@/components/market/marketDashboardData';
import { MARKET_OFFERS } from '@/components/market/marketDashboardData';
import type { OfferListItem } from '@/components/market/marketOfferListData';
import { MARKET_OFFERS_ALL } from '@/components/market/marketOfferListData';
import type { ProductListItem } from '@/types/product.types';
import type { ServiceListItem } from '@/types/service.types';
import { formatMoney } from '@/utils/currency';

/** Mapper placeholders — treat as missing so market cards fall back to icons. */
const PLACEHOLDER_IMAGES = new Set([
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=160&h=160&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=375&h=350&fit=crop',
]);

const PRODUCT_DASHBOARD_STYLE = {
  kindColor: '#257d3f',
  kindBg: '#e6f4e8',
  mediaBg: '#e6f4e8',
  iconColor: '#257d3f',
  icon: 'bag' as const,
};

const SERVICE_DASHBOARD_STYLE = {
  kindColor: '#8352c0',
  kindBg: '#f2e9fb',
  mediaBg: '#f2e9fb',
  iconColor: '#8352c0',
  icon: 'user' as const,
};

const SERVICE_LIST_STYLES = [
  {
    kindColor: '#c07c27',
    kindBg: '#fdf0e3',
    mediaBg: '#fdf0e3',
    iconColor: '#c07c27',
    icon: 'bowl' as const,
  },
  {
    kindColor: '#8352c0',
    kindBg: '#f2e9fb',
    mediaBg: '#f2e9fb',
    iconColor: '#8352c0',
    icon: 'user' as const,
  },
  {
    kindColor: '#3c63c8',
    kindBg: '#eaf1ff',
    mediaBg: '#eaf1ff',
    iconColor: '#3c63c8',
    icon: 'monitor' as const,
  },
] as const;

function textOrFallback(value: string | null | undefined, fallback: string): string {
  if (value == null) return fallback;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'NA') return fallback;
  return trimmed;
}

function pickOfferImageUrl(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'NA') return null;
  if (PLACEHOLDER_IMAGES.has(trimmed)) return null;
  return trimmed;
}

export function mapProductToMarketOffer(
  item: ProductListItem,
  fallback: MarketOffer = MARKET_OFFERS[0],
): MarketOffer {
  return {
    id: item.id || fallback.id,
    kind: 'PRODUCT',
    title: textOrFallback(item.name, fallback.title),
    vendor: textOrFallback(item.enterpriseName, fallback.vendor),
    price: formatMoney(item.price ?? 0, item.currency),
    ...PRODUCT_DASHBOARD_STYLE,
    // product_images / image_urls → item.image (must come after style spread)
    imageUrl: pickOfferImageUrl(item.image),
  };
}

export function mapServiceToMarketOffer(
  item: ServiceListItem,
  fallback: MarketOffer = MARKET_OFFERS[1] ?? MARKET_OFFERS[0],
): MarketOffer {
  return {
    id: item.id || fallback.id,
    kind: 'SERVICE',
    title: textOrFallback(item.name, fallback.title),
    vendor: textOrFallback(
      item.enterpriseName !== 'NA' ? item.enterpriseName : item.provider,
      fallback.vendor,
    ),
    price: formatMoney(item.price ?? 0, item.currency),
    ...SERVICE_DASHBOARD_STYLE,
    imageUrl: pickOfferImageUrl(item.image),
  };
}

/** Market home: first product + first service (static fill if either list is empty). */
export function mapFeaturedMarketOffers(
  product: ProductListItem | null | undefined,
  service: ServiceListItem | null | undefined,
): MarketOffer[] {
  const offers: MarketOffer[] = [];

  if (product) {
    offers.push(mapProductToMarketOffer(product, MARKET_OFFERS[0]));
  }
  if (service) {
    offers.push(
      mapServiceToMarketOffer(service, MARKET_OFFERS[1] ?? MARKET_OFFERS[0]),
    );
  }

  if (offers.length > 0) return offers;
  return MARKET_OFFERS;
}

/** Market home search: map all matching products + services to offer cards. */
export function mapMarketHomeOffers(
  products: ProductListItem[],
  services: ServiceListItem[],
): MarketOffer[] {
  const mapped = [
    ...products.map((item, index) =>
      mapProductToMarketOffer(
        item,
        MARKET_OFFERS[index % MARKET_OFFERS.length] ?? MARKET_OFFERS[0],
      ),
    ),
    ...services.map((item, index) =>
      mapServiceToMarketOffer(
        item,
        MARKET_OFFERS[(index + 1) % MARKET_OFFERS.length] ?? MARKET_OFFERS[0],
      ),
    ),
  ];

  return mapped;
}

function productSubtitle(item: ProductListItem, fallback: string): string {
  const category = textOrFallback(item.category, '');
  if (category) return `Product · ${category}`;
  return fallback;
}

function serviceSubtitle(item: ServiceListItem, fallback: string): string {
  const duration = textOrFallback(item.duration, '');
  const format = textOrFallback(item.format, '').toLowerCase();
  if (duration && format) return `${duration} · ${format}`;
  if (duration) return duration;
  if (format) return format;
  return fallback;
}

export function mapProductToOfferListItem(
  item: ProductListItem,
  fallback: OfferListItem = MARKET_OFFERS_ALL.find((o) => o.kind === 'PRODUCT') ??
    MARKET_OFFERS_ALL[0],
): OfferListItem {
  return {
    id: item.id || fallback.id,
    kind: 'PRODUCT',
    kindColor: PRODUCT_DASHBOARD_STYLE.kindColor,
    kindBg: PRODUCT_DASHBOARD_STYLE.kindBg,
    title: textOrFallback(item.name, fallback.title),
    vendor: textOrFallback(item.enterpriseName, fallback.vendor),
    price: formatMoney(item.price ?? 0, item.currency),
    subtitle: productSubtitle(item, fallback.subtitle),
    mediaBg: PRODUCT_DASHBOARD_STYLE.mediaBg,
    iconColor: PRODUCT_DASHBOARD_STYLE.iconColor,
    icon: 'bag',
    route: 'listing',
    imageUrl: pickOfferImageUrl(item.image),
  };
}

export function mapServiceToOfferListItem(
  item: ServiceListItem,
  index = 0,
  fallback: OfferListItem = MARKET_OFFERS_ALL.find((o) => o.kind === 'SERVICE') ??
    MARKET_OFFERS_ALL[0],
): OfferListItem {
  const style = SERVICE_LIST_STYLES[index % SERVICE_LIST_STYLES.length];

  return {
    id: item.id || fallback.id,
    kind: 'SERVICE',
    kindColor: style.kindColor,
    kindBg: style.kindBg,
    title: textOrFallback(item.name, fallback.title),
    vendor: textOrFallback(
      item.enterpriseName !== 'NA' ? item.enterpriseName : item.provider,
      fallback.vendor,
    ),
    price: formatMoney(item.price ?? 0, item.currency),
    subtitle: serviceSubtitle(item, fallback.subtitle),
    mediaBg: style.mediaBg,
    iconColor: style.iconColor,
    icon: style.icon,
    route: 'service',
    imageUrl: pickOfferImageUrl(item.image),
  };
}

export function mapProductsAndServicesToOfferList(
  products: ProductListItem[],
  services: ServiceListItem[],
): OfferListItem[] {
  const mapped = [
    ...products.map((item) => mapProductToOfferListItem(item)),
    ...services.map((item, index) => mapServiceToOfferListItem(item, index)),
  ];

  return mapped.length > 0 ? mapped : MARKET_OFFERS_ALL;
}
