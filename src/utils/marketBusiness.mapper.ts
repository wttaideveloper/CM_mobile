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

function buildReviewsLabel(
  reviewsCount: number,
  fallback: string,
): string {
  if (reviewsCount > 0) {
    return `(${reviewsCount})`;
  }
  return fallback;
}

function buildMetaLabel(
  item: EnterpriseListItem,
  fallback: string,
): string {
  if (item.isOnline) {
    return 'Online';
  }
  if (item.distanceMiles != null && Number.isFinite(item.distanceMiles)) {
    return `${item.distanceMiles.toFixed(1)} mi`;
  }
  return fallback;
}

/** Prefer banner_url, then logo_url; otherwise null so UI can show initials. */
export function pickEnterpriseAvatarUrl(
  item: EnterpriseListItem,
): string | null {
  const banner = item.bannerUrl?.trim();
  if (banner) return banner;
  const logo = item.logoUrl?.trim();
  if (logo) return logo;
  return null;
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
    // e.g. "Tester Shop" → "TS" when no logo/banner is shown on the card
    initials: initialsFromName(name),
    name,
    verified: item.isVerified,
    subtitle: buildSubtitle(item, fallback.subtitle),
    rating: formatMarketRating(item.rating),
    reviews: buildReviewsLabel(item.reviewsCount, fallback.reviews),
    meta: buildMetaLabel(item, fallback.meta),
    avatarBg: fallback.avatarBg,
    avatarColor: fallback.avatarColor,
    imageUrl: pickEnterpriseAvatarUrl(item),
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

/** Market businesses See all: map full enterprises list with cycling static style fallbacks. */
export function mapEnterprisesToMarketBusinessList(
  items: EnterpriseListItem[],
  styleFallbacks: MarketBusiness[],
): MarketBusiness[] {
  if (items.length === 0) return [];
  const fallbacks =
    styleFallbacks.length > 0 ? styleFallbacks : MARKET_BUSINESSES;

  return items.map((item, index) =>
    mapEnterpriseToMarketBusiness(
      item,
      fallbacks[index % fallbacks.length] ?? fallbacks[0],
    ),
  );
}

export function sortMarketBusinesses(
  list: MarketBusiness[],
  sort: string,
): MarketBusiness[] {
  const sorted = [...list];
  if (sort === 'Top rated') {
    return sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
  }
  if (sort === 'Verified') {
    return sorted.sort((a, b) => Number(!!b.verified) - Number(!!a.verified));
  }
  // Closest — Online last, otherwise keep API order
  return sorted.sort((a, b) => {
    const aOnline = a.meta === 'Online' ? 1 : 0;
    const bOnline = b.meta === 'Online' ? 1 : 0;
    if (aOnline !== bOnline) return aOnline - bOnline;
    return 0;
  });
}
