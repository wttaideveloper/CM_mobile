import type { PillarBrowseContent } from '@/components/market/marketPillarData';
import type { EnterpriseListItem } from '@/types/enterprise.types';
import type { ProductListItem } from '@/types/product.types';
import type { ServiceListItem } from '@/types/service.types';
import { formatMoney } from '@/utils/currency';
import { pickEnterpriseAvatarUrl } from '@/utils/marketBusiness.mapper';

type PillarBusiness = PillarBrowseContent['businesses'][number];
type PillarOffer = PillarBrowseContent['offers'][number];

const OFFER_STYLES: Array<
  Pick<PillarOffer, 'mediaBg' | 'iconColor' | 'icon'>
> = [
  { mediaBg: '#e6f4e8', iconColor: '#257d3f', icon: 'bag' },
  { mediaBg: '#fdf0e3', iconColor: '#c07c27', icon: 'bowl' },
  { mediaBg: '#eaf1ff', iconColor: '#3c63c8', icon: 'monitor' },
  { mediaBg: '#f2e9fb', iconColor: '#8352c0', icon: 'user' },
];

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

function formatRating(value: string | null | undefined): string {
  if (value == null || value === '' || value === 'NA') return '0.0';
  const num = Number(value);
  if (!Number.isFinite(num)) return '0.0';
  return num.toFixed(1);
}

function buildSubtitle(item: EnterpriseListItem, fallback: string): string {
  const tagline =
    item.tagline && item.tagline !== 'NA' ? item.tagline.trim() : '';
  const category =
    item.category && item.category !== 'NA' ? item.category.trim() : '';

  if (tagline && category) return `${tagline} · ${category}`;
  if (tagline) return tagline;
  if (category) return category;
  return fallback;
}

function buildMeta(item: EnterpriseListItem, fallback: string): string {
  if (item.isOnline) return 'Online';
  if (item.distanceMiles != null && Number.isFinite(item.distanceMiles)) {
    return `${item.distanceMiles.toFixed(1)} mi`;
  }
  return fallback;
}

export function mapEnterpriseToPillarBusiness(
  item: EnterpriseListItem,
  fallback: PillarBusiness,
): PillarBusiness {
  const name = textOrFallback(item.name, fallback.name);

  return {
    id: item.id || fallback.id,
    initials: initialsFromName(name),
    name,
    subtitle: buildSubtitle(item, fallback.subtitle),
    rating: formatRating(item.rating),
    meta: buildMeta(item, fallback.meta),
    avatarBg: fallback.avatarBg,
    avatarColor: fallback.avatarColor,
    verified: item.isVerified,
    imageUrl: pickEnterpriseAvatarUrl(item),
  };
}

export function mapProductToPillarOffer(
  item: ProductListItem,
  fallback: PillarOffer,
  index: number,
): PillarOffer {
  const style = OFFER_STYLES[index % OFFER_STYLES.length];

  return {
    id: item.id || fallback.id,
    kind: 'PRODUCT',
    title: textOrFallback(item.name, fallback.title),
    vendor: textOrFallback(item.enterpriseName, fallback.vendor),
    price: formatMoney(item.price ?? 0, item.currency),
    mediaBg: style.mediaBg,
    iconColor: style.iconColor,
    icon: 'bag',
    route: 'listing',
  };
}

export function mapServiceToPillarOffer(
  item: ServiceListItem,
  fallback: PillarOffer,
  index: number,
): PillarOffer {
  const style = OFFER_STYLES[(index + 1) % OFFER_STYLES.length];
  const vendor = textOrFallback(
    item.enterpriseName !== 'NA' ? item.enterpriseName : item.provider,
    fallback.vendor,
  );

  return {
    id: item.id || fallback.id,
    kind: 'SERVICE',
    title: textOrFallback(item.name, fallback.title),
    vendor,
    price: formatMoney(item.price ?? 0, item.currency),
    mediaBg: style.mediaBg,
    iconColor: style.iconColor,
    icon: style.icon === 'bag' ? 'bowl' : style.icon,
    route: 'service',
  };
}

function buildStats(
  businessCount: number,
  offerCount: number,
  eventCount: number,
): string {
  return `${businessCount} businesses · ${offerCount} offers · ${eventCount} events`;
}

/** Merge search API results into pillar browse content; keep static when a section is empty. */
export function mapPillarSearchToBrowseContent(
  base: PillarBrowseContent,
  enterprises: EnterpriseListItem[],
  products: ProductListItem[],
  services: ServiceListItem[],
): PillarBrowseContent {
  const businesses =
    enterprises.length > 0
      ? enterprises.map((item, index) =>
          mapEnterpriseToPillarBusiness(
            item,
            base.businesses[index] ?? base.businesses[0],
          ),
        )
      : base.businesses;

  const apiOffers = [
    ...products.map((item, index) =>
      mapProductToPillarOffer(
        item,
        base.offers.find((o) => o.kind === 'PRODUCT') ?? base.offers[0],
        index,
      ),
    ),
    ...services.map((item, index) =>
      mapServiceToPillarOffer(
        item,
        base.offers.find((o) => o.kind === 'SERVICE') ?? base.offers[0],
        index,
      ),
    ),
  ];

  const offers = apiOffers.length > 0 ? apiOffers : base.offers;

  return {
    ...base,
    businesses,
    offers,
    // Events have no search API yet — keep static.
    events: base.events,
    stats: buildStats(businesses.length, offers.length, base.events.length),
  };
}
