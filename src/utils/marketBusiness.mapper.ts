import type { MarketBusiness } from '@/components/market/marketDashboardData';
import { MARKET_BUSINESSES } from '@/components/market/marketDashboardData';
import type { EnterpriseListItem } from '@/types/enterprise.types';

function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'BZ';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase() || 'BZ';
}

function formatMarketRating(value: string | null | undefined): string {
  if (value == null || value === '' || value === 'NA') {
    return '0.0';
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return '0.0';
  }
  return num.toFixed(1);
}

function buildSubtitle(item: EnterpriseListItem, fallback: string): string {
  const tagline =
    item.tagline && item.tagline !== 'NA' ? item.tagline.trim() : '';
  const category =
    item.category && item.category !== 'NA' ? item.category.trim() : '';

  if (tagline && category) {
    return `${tagline} · ${category}`;
  }
  if (tagline) return tagline;
  if (category) return category;
  return fallback;
}

/** Map enterprises API item → Market featured card, filling gaps with static copy. */
export function mapEnterpriseToMarketBusiness(
  item: EnterpriseListItem,
  fallback: MarketBusiness = MARKET_BUSINESSES[0],
): MarketBusiness {
  const name =
    item.name && item.name !== 'NA' ? item.name : fallback.name;

  return {
    id: item.id || fallback.id,
    // e.g. "Tester Shop" → "TS" when no logo is shown on the card
    initials: initialsFromName(name),
    name,
    verified: item.isVerified,
    subtitle: buildSubtitle(item, fallback.subtitle),
    rating: formatMarketRating(item.rating),
    // Not on enterprises list yet — keep static label from design mock.
    reviews: fallback.reviews,
    meta: fallback.meta,
    avatarBg: fallback.avatarBg,
    avatarColor: fallback.avatarColor,
  };
}

export function mapEnterprisesToFeaturedBusinesses(
  items: EnterpriseListItem[],
  limit = 2,
): MarketBusiness[] {
  return items.slice(0, limit).map((item, index) =>
    mapEnterpriseToMarketBusiness(
      item,
      MARKET_BUSINESSES[index] ?? MARKET_BUSINESSES[0],
    ),
  );
}
