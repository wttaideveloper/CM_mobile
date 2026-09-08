import { MARKET_BIZ_PROFILE } from '@/components/market/marketBusinessProfileData';
import type { EnterpriseListItem } from '@/types/enterprise.types';

export type MarketBizProfileView = {
  eyebrow: string;
  shortName: string;
  fullName: string;
  initials: string;
  rating: string;
  reviewsMeta: string;
  about: string;
  addressLine: string;
  addressMeta: string;
  website: string;
  websiteUrl: string | null;
  email: string;
  hours: string;
  offerCount: string;
  logoUrl: string | null;
};

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

function textOrFallback(value: string | null | undefined, fallback: string): string {
  if (value == null) return fallback;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'NA') return fallback;
  return trimmed;
}

function normalizeWebsiteDisplay(value: string | null | undefined, fallback: string): string {
  const raw = textOrFallback(value, fallback);
  return raw.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

function normalizeWebsiteUrl(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'NA') return null;
  // API sometimes returns email in website fields — ignore those.
  if (trimmed.includes('@')) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes('.')) return `https://${trimmed}`;
  return null;
}

function pickLogoUrl(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'NA') return null;
  return trimmed;
}

/** Map GET /enterprises/:id → business profile UI (static fallbacks for missing fields). */
export function mapEnterpriseToBizProfile(
  item: EnterpriseListItem,
): MarketBizProfileView {
  const fullName = textOrFallback(item.name, MARKET_BIZ_PROFILE.fullName);
  const shortName = textOrFallback(item.shortName, MARKET_BIZ_PROFILE.shortName);
  const category = textOrFallback(item.category, 'Business');
  const verifiedLabel = item.isVerified ? 'Verified' : 'Business';
  const websiteSource = item.website;

  return {
    eyebrow: `${category} · ${verifiedLabel}`,
    shortName,
    fullName,
    // e.g. "Tester Shop" → "TS"
    initials: initialsFromName(fullName),
    rating: formatRating(item.rating),
    // reviews_count / distance not on API yet
    reviewsMeta: MARKET_BIZ_PROFILE.reviewsMeta,
    about: textOrFallback(item.description, MARKET_BIZ_PROFILE.about),
    addressLine: textOrFallback(item.location, MARKET_BIZ_PROFILE.addressLine),
    addressMeta: MARKET_BIZ_PROFILE.addressMeta,
    website: normalizeWebsiteDisplay(websiteSource, MARKET_BIZ_PROFILE.website),
    websiteUrl: normalizeWebsiteUrl(websiteSource),
    email: textOrFallback(item.businessEmail, MARKET_BIZ_PROFILE.email),
    // business hours not on API yet
    hours: MARKET_BIZ_PROFILE.hours,
    offerCount: MARKET_BIZ_PROFILE.offerCount,
    logoUrl: pickLogoUrl(item.logoUrl),
  };
}

export const STATIC_BIZ_PROFILE_VIEW: MarketBizProfileView = {
  ...MARKET_BIZ_PROFILE,
  websiteUrl: `https://${MARKET_BIZ_PROFILE.website}`,
  logoUrl: null,
};
