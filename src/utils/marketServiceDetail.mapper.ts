import {
  DEFAULT_SERVICE_DETAIL_ID,
  MARKET_SERVICE_DETAILS,
  type MarketServiceDetail,
} from '@/components/market/marketServiceDetailData';
import type { ServiceDetailItem } from '@/types/service.types';
import { formatMoney } from '@/utils/currency';

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

function titleCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function pickServiceIcon(format: string): MarketServiceDetail['icon'] {
  const normalized = format.trim().toLowerCase();
  if (normalized.includes('virtual') || normalized.includes('online')) {
    return 'monitor';
  }
  if (normalized.includes('person') || normalized.includes('studio')) {
    return 'bowl';
  }
  return 'user';
}

function pickServiceColors(icon: MarketServiceDetail['icon']): {
  mediaBg: string;
  mediaIcon: string;
} {
  if (icon === 'monitor') {
    return { mediaBg: '#eaf1ff', mediaIcon: '#3c63c8' };
  }
  if (icon === 'bowl') {
    return { mediaBg: '#fdf0e3', mediaIcon: '#c07c27' };
  }
  return { mediaBg: '#f2e9fb', mediaIcon: '#8352c0' };
}

/** Map GET /services/:id → market service detail UI (static fallbacks for missing). */
export function mapServiceDetailToMarketUI(
  item: ServiceDetailItem,
  fallback: MarketServiceDetail = MARKET_SERVICE_DETAILS[DEFAULT_SERVICE_DETAIL_ID],
): MarketServiceDetail {
  const title = textOrFallback(item.name, fallback.title);
  const category = textOrFallback(item.category, 'Service');
  const duration = textOrFallback(item.duration, '0 min');
  const formatRaw = textOrFallback(item.format, 'Virtual');
  const format = titleCase(formatRaw);
  const price = formatMoney(item.price ?? 0, item.currency);
  const vendorName = textOrFallback(item.enterpriseName, fallback.vendorName);
  const maxParticipants = item.maxParticipants;
  const icon = pickServiceIcon(formatRaw);
  const colors = pickServiceColors(icon);

  const priceMeta =
    formatRaw.toLowerCase().includes('virtual')
      ? 'per visit · video call'
      : fallback.priceMeta;

  return {
    id: item.id || fallback.id,
    title,
    kind: 'SERVICE',
    kindMeta: `${category} · ${duration}, ${formatRaw.toLowerCase()}`,
    price,
    priceMeta,
    bookLabel: `Book · ${price}`,
    vendorInitials: initialsFromName(vendorName),
    vendorName,
    vendorMeta: fallback.vendorMeta,
    description: textOrFallback(item.description, fallback.description),
    mediaBg: colors.mediaBg,
    mediaIcon: colors.mediaIcon,
    icon,
    details: [
      { id: 'duration', label: 'Duration', value: duration },
      { id: 'format', label: 'Format', value: format },
      {
        id: 'group',
        label: 'Group size',
        value:
          maxParticipants != null && maxParticipants > 0
            ? `Up to ${maxParticipants}`
            : fallback.details.find((d) => d.id === 'group')?.value ?? 'Up to 8',
      },
      { id: 'pillar', label: 'Pillar', value: category },
    ],
    // Reviews API not available — keep static review card.
    review: fallback.review,
    enterpriseId: item.enterpriseId || undefined,
  };
}
