import type {
  EnterpriseApiResponse,
  EnterpriseListItem,
} from '@/types/enterprise.types';

const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop';

function textOrNa(value?: string | null): string {
  if (value == null || value.trim() === '') {
    return 'NA';
  }
  return value.trim();
}

function numberOrZero(value?: number | null): number {
  return value ?? 0;
}

function pickCategory(item: EnterpriseApiResponse): string {
  return textOrNa(item.category ?? item.business_category);
}

function pickName(item: EnterpriseApiResponse): string {
  return textOrNa(item.business_legal_name || item.business_short_name);
}

function pickShortName(item: EnterpriseApiResponse): string {
  return textOrNa(item.business_short_name);
}

function pickIsVerified(item: EnterpriseApiResponse): boolean {
  const statusLabel = item.status_label?.trim().toLowerCase();
  const statusValue = typeof item.status === 'string' ? item.status.trim().toLowerCase() : '';

  return statusLabel === 'active' || statusValue === 'active';
}

function pickStatusLabel(item: EnterpriseApiResponse): string {
  if (typeof item.status_label === 'string' && item.status_label.trim()) {
    return formatStatusLabel(item.status_label);
  }

  if (typeof item.status === 'string' && item.status.trim()) {
    return formatStatusLabel(item.status);
  }

  return 'NA';
}

function formatStatusLabel(label?: string | null): string {
  if (label == null || label.trim() === '') {
    return 'NA';
  }

  const normalized = label.trim().toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function pickJoinedDate(item: EnterpriseApiResponse): string {
  return formatJoinedDate(item.joined_date ?? item.created_at);
}

function formatJoinedDate(value?: string | null): string {
  if (value == null || value.trim() === '') {
    return 'NA';
  }

  const trimmed = value.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return trimmed;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRating(value?: number | null): string {
  if (value == null) {
    return 'NA';
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(1);
}

function pickLocation(item: EnterpriseApiResponse): string {
  const candidates = [
    item.business_address,
    item.registered_address,
    item.communication_address,
  ];

  for (const address of candidates) {
    if (address?.trim()) {
      return address.trim();
    }
  }

  return 'NA';
}

function pickHeroImage(item: EnterpriseApiResponse): string {
  if (item.banner_url?.trim()) {
    return item.banner_url.trim();
  }

  if (item.logo_url?.trim()) {
    return item.logo_url.trim();
  }

  const firstImage = item.business_images
    ?.split(',')
    .map((image) => image.trim())
    .find(Boolean);

  return firstImage || DEFAULT_HERO_IMAGE;
}

export function mapEnterpriseApiToListItem(
  item: EnterpriseApiResponse,
): EnterpriseListItem {
  return {
    id: item.id,
    name: pickName(item),
    shortName: pickShortName(item),
    tagline: textOrNa(item.tagline),
    description: textOrNa(item.business_description),
    category: pickCategory(item),
    location: pickLocation(item),
    members: numberOrZero(item.members_count),
    revenue: numberOrZero(item.revenue),
    joined: pickJoinedDate(item),
    status: pickStatusLabel(item),
    isVerified: pickIsVerified(item),
    products: 0,
    rating: formatRating(item.rating),
    heroImage: pickHeroImage(item),
    logoUrl: item.logo_url?.trim() || null,
    businessEmail: item.business_email,
    businessPhone: item.business_phone,
    yearFounded: item.year_founded ?? null,
  };
}

export function mapEnterprisesApiResponse(
  items: EnterpriseApiResponse[],
): EnterpriseListItem[] {
  return items
    .filter((item) => {
      const status = (item.status_label ?? item.status ?? '').trim().toLowerCase();
      return status !== 'inactive';
    })
    .map(mapEnterpriseApiToListItem);
}

export function formatRevenue(amount: number): string {
  if (!amount) {
    return '$0';
  }
  return `$${amount.toLocaleString('en-US')}`;
}

export function formatMembersCount(count: number): string {
  return String(count ?? 0);
}

export function formatLocationShort(location: string): string {
  if (!location || location === 'NA') {
    return 'NA';
  }

  const parts = location
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 4) {
    return `${parts[parts.length - 3]}, ${parts[parts.length - 2]}`;
  }

  if (parts.length >= 2) {
    return parts.slice(-2).join(', ');
  }

  return location;
}

export function formatYearsEstablished(yearFounded: number | null): string {
  if (!yearFounded) {
    return '—';
  }

  const years = new Date().getFullYear() - yearFounded;
  if (years <= 0) {
    return '<1yr';
  }

  return `${years}yr`;
}
