import type {
  ServiceApiResponse,
  ServiceAvailabilityDay,
  ServiceDetailItem,
  ServiceDetailSlot,
  ServiceListItem,
} from '@/types/service.types';

import { formatMoney, normalizeCurrencyCode } from '@/utils/currency';
import { getFullWeekSlots } from '@/utils/weekAvailability';

const DEFAULT_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=375&h=350&fit=crop';

function textOrNa(value?: string | null): string {
  if (value == null || value.trim() === '') {
    return 'NA';
  }
  return value.trim();
}

function formatDuration(minutes: number): string {
  if (!minutes) {
    return 'NA';
  }

  return `${minutes} min`;
}

export function formatServiceLabel(value?: string | null): string {
  if (value == null || value.trim() === '') {
    return 'NA';
  }

  return value
    .trim()
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function pickTrainerName(item: ServiceApiResponse): string | null {
  const raw =
    item.trainer_name ?? item.provider_name ?? item.instructor_name ?? item.provider;
  if (raw == null || raw.trim() === '') {
    return null;
  }
  return raw.trim();
}

function pickSessionType(item: ServiceApiResponse): string {
  return textOrNa(item.sessionType ?? item.type ?? item.service_type ?? item.service_category);
}

function pickFormat(item: ServiceApiResponse): string {
  const raw = item.format ?? item.delivery_format;
  if (raw == null || raw.trim() === '') {
    return 'NA';
  }
  return formatServiceLabel(raw);
}

function pickBannerImage(item: ServiceApiResponse): string {
  // Market / list: use banner_image only (no placeholder so cards can fall back to icon).
  const raw = item.banner_image ?? item.bannerImage ?? item.image;
  if (raw?.trim()) {
    return raw.trim();
  }
  return '';
}

function pickBannerImageOrDefault(item: ServiceApiResponse): string {
  return pickBannerImage(item) || DEFAULT_BANNER_IMAGE;
}

function toDayShort(day: string): string {
  const trimmed = day.trim();
  const short = trimmed.length <= 3 ? trimmed : trimmed.slice(0, 3);
  return short.charAt(0).toUpperCase() + short.slice(1).toLowerCase();
}

/** Parse YYYY-MM-DD as local calendar date (avoid UTC shift). */
function parseLocalDateId(dateStr: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
    );
  }
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function isDatedAvailabilityDay(
  item: ServiceAvailabilityDay | Record<string, unknown>,
): item is ServiceAvailabilityDay {
  return (
    typeof item.date === 'string' &&
    item.date.trim().length > 0 &&
    Array.isArray(item.slots)
  );
}

export function normalizeDetailSlot(
  slot: Omit<ServiceDetailSlot, 'isPast'>,
  referenceDate = new Date(),
): ServiceDetailSlot {
  const slotTimes = Array.isArray(slot.slotTimes) ? slot.slotTimes : [];
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  let isPast = false;
  const slotDate = parseLocalDateId(slot.id);
  if (slotDate) {
    slotDate.setHours(0, 0, 0, 0);
    isPast = slotDate < today;
  }

  return {
    id: slot.id,
    dayShort: slot.dayShort ?? '',
    dayLabel: slot.dayLabel ?? slot.dayShort ?? '',
    date: slot.date ?? 0,
    slots: slot.slots ?? slotTimes.length,
    slotTimes,
    isPast,
  };
}

function mapAvailabilityDay(item: ServiceAvailabilityDay): Omit<ServiceDetailSlot, 'isPast'> {
  const parsedDate = parseLocalDateId(item.date);
  const slotTimes = (item.slots ?? []).map((s) => String(s).trim()).filter(Boolean);

  return {
    id: item.date,
    dayShort: toDayShort(item.day),
    dayLabel: item.day.trim(),
    date: parsedDate ? parsedDate.getDate() : 0,
    slots: slotTimes.length,
    slotTimes,
  };
}

export function mapApiAvailabilityToSlots(
  availability?: ServiceAvailabilityDay[] | null,
  referenceDate = new Date(),
): ServiceDetailSlot[] {
  const datedDays = (availability ?? []).filter(isDatedAvailabilityDay);

  if (!datedDays.length) {
    return getFullWeekSlots(referenceDate).map((slot) =>
      normalizeDetailSlot(
        {
          id: slot.id,
          dayShort: slot.dayShort,
          dayLabel: slot.dayShort,
          date: slot.date,
          slots: slot.slots,
          slotTimes: [],
        },
        referenceDate,
      ),
    );
  }

  return datedDays
    .map(mapAvailabilityDay)
    .map((slot) => normalizeDetailSlot(slot, referenceDate))
    .filter((slot) => slot.slotTimes.length > 0)
    .sort((a, b) => {
      const aDate = parseLocalDateId(a.id);
      const bDate = parseLocalDateId(b.id);
      if (!aDate || !bDate) return 0;
      return aDate.getTime() - bDate.getTime();
    });
}

function pickDuration(item: ServiceApiResponse): string {
  const raw = item.duration ?? item.duration_minutes;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim();
  }
  if (typeof raw === 'number' && raw > 0) {
    return formatDuration(raw);
  }
  return 'NA';
}

function pickAvailabilitySlots(
  item: ServiceApiResponse,
  referenceDate = new Date(),
): ServiceDetailSlot[] {
  if (item.availabilitySlots?.length) {
    return item.availabilitySlots.map((slot) => normalizeDetailSlot(slot, referenceDate));
  }

  return mapApiAvailabilityToSlots(item.availability, referenceDate);
}

export function mapServiceApiToListItem(item: ServiceApiResponse): ServiceListItem {
  const price = item.service_price ?? item.price ?? 0;
  const isActive =
    item.service_status ??
    item.isActive ??
    (typeof item.status === 'string' ? item.status.toLowerCase() === 'active' : false);

  return {
    id: item.id,
    enterpriseId: item.enterprise_id ?? item.enterpriseId ?? '',
    enterpriseName: textOrNa(item.enterprise_name ?? item.enterpriseName),
    name: textOrNa(item.service_name ?? item.name),
    description: textOrNa(item.service_description ?? item.description),
    category: textOrNa(item.service_category ?? item.category),
    price,
    duration: pickDuration(item),
    provider: pickTrainerName(item),
    providerUserId: item.provider_user_id?.trim() || null,
    unit: item.unit?.trim() || '/session',
    image: pickBannerImage(item),
    maxParticipants: item.max_participants ?? item.maxParticipants ?? null,
    isAvailable: item.availability_status ?? item.isAvailable ?? true,
    isActive: Boolean(isActive),
    format: pickFormat(item),
    currency: normalizeCurrencyCode(item.currency),
  };
}

export function mapServiceApiToDetailItem(item: ServiceApiResponse): ServiceDetailItem {
  const base = mapServiceApiToListItem(item);

  return {
    ...base,
    enterpriseName: textOrNa(item.enterprise_name ?? item.enterpriseName),
    sessionType: pickSessionType(item),
    format: pickFormat(item),
    bannerImage: pickBannerImageOrDefault(item),
    availabilitySlots: pickAvailabilitySlots(item),
    cancellationPolicy: textOrNa(item.cancellation_policy ?? item.cancellationPolicy),
    maxParticipants: item.max_participants ?? item.maxParticipants ?? null,
  };
}

export function mapServicesApiResponse(
  items: ServiceApiResponse[],
): ServiceListItem[] {
  return items
    .filter((item) => {
      if (item.service_status === false || item.isActive === false) return false;
      const status = (item.status ?? '').trim().toLowerCase();
      return status !== 'inactive';
    })
    .map(mapServiceApiToListItem);
}

export function formatServicePrice(price: number, currency?: string | null): string {
  return formatMoney(price, currency);
}
