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

function formatStatusLabel(label?: string | null): string {
  if (label == null || label.trim() === '') {
    return 'NA';
  }

  const normalized = label.trim().toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatJoinedDate(value?: string | null): string {
  if (value == null || value.trim() === '') {
    return 'NA';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.trim();
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
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
    name: textOrNa(item.business_legal_name),
    description: textOrNa(item.business_description),
    category: pickCategory(item),
    location: pickLocation(item),
    members: numberOrZero(item.members_count),
    revenue: numberOrZero(item.revenue),
    joined: formatJoinedDate(item.joined_date),
    status: formatStatusLabel(item.status_label),
    isVerified: false,
    products: 0,
    rating: formatRating(item.rating),
    heroImage: pickHeroImage(item),
    businessEmail: item.business_email,
    businessPhone: item.business_phone,
  };
}

export function mapEnterprisesApiResponse(
  items: EnterpriseApiResponse[],
): EnterpriseListItem[] {
  return items.map(mapEnterpriseApiToListItem);
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
