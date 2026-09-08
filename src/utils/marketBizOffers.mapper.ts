import type { BizProfileOffer } from '@/components/market/marketBusinessProfileData';
import type { ProductListItem } from '@/types/product.types';
import type { ServiceListItem } from '@/types/service.types';
import { formatMoney } from '@/utils/currency';

const PRODUCT_STYLE = {
  iconBg: '#e6f4e8',
  iconColor: '#257d3f',
  icon: 'bag' as const,
};

const SERVICE_STYLES = [
  {
    iconBg: '#fdf0e3',
    iconColor: '#c07c27',
    icon: 'bowl' as const,
  },
  {
    iconBg: '#eaf1ff',
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

export function mapProductToBizOffer(item: ProductListItem): BizProfileOffer {
  const category = textOrFallback(item.category, 'Product');
  return {
    id: item.id,
    title: textOrFallback(item.name, 'Product'),
    subtitle: `Product · ${category}`,
    price: formatMoney(item.price ?? 0, item.currency),
    ...PRODUCT_STYLE,
    kind: 'product',
  };
}

export function mapServiceToBizOffer(
  item: ServiceListItem,
  index = 0,
): BizProfileOffer {
  const duration = textOrFallback(item.duration, '0 min');
  const format = textOrFallback(item.format, '').toLowerCase();
  const subtitle = format
    ? `Service · ${duration}, ${format}`
    : `Service · ${duration}`;
  const style = SERVICE_STYLES[index % SERVICE_STYLES.length];

  return {
    id: item.id,
    title: textOrFallback(item.name, 'Service'),
    subtitle,
    price: formatMoney(item.price ?? 0, item.currency),
    ...style,
    kind: 'service',
  };
}

export function mapProductsAndServicesToBizOffers(
  products: ProductListItem[],
  services: ServiceListItem[],
): BizProfileOffer[] {
  return [
    ...products.map(mapProductToBizOffer),
    ...services.map((item, index) => mapServiceToBizOffer(item, index)),
  ];
}
