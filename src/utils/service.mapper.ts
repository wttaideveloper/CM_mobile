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
  const raw = item.banner_image ?? item.bannerImage ?? item.image;
  if (raw?.trim()) {
    return raw.trim();
  }
  return DEFAULT_BANNER_IMAGE;
}

function toDayShort(day: string): string {
  const trimmed = day.trim();
  if (trimmed.length <= 3) {
    return trimmed;
  }
  return trimmed.slice(0, 3);
}

export function normalizeDetailSlot(
  slot: Omit<ServiceDetailSlot, 'isPast'>,
  referenceDate = new Date(),
): ServiceDetailSlot {
  const slotTimes = Array.isArray(slot.slotTimes) ? slot.slotTimes : [];
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  let isPast = false;
  const slotDate = new Date(slot.id);
  if (!Number.isNaN(slotDate.getTime())) {
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
  const parsedDate = new Date(item.date);

  return {
    id: item.date,
    dayShort: toDayShort(item.day),
    dayLabel: item.day.trim(),
    date: Number.isNaN(parsedDate.getTime())
      ? 0
      : parsedDate.getDate(),
    slots: item.slots?.length ?? 0,
    slotTimes: item.slots ?? [],
  };
}

export function mapApiAvailabilityToSlots(
  availability?: ServiceAvailabilityDay[] | null,
  referenceDate = new Date(),
): ServiceDetailSlot[] {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const isInCurrentWeek = (slot: ServiceDetailSlot) => {
    const slotDate = new Date(slot.id);
    if (Number.isNaN(slotDate.getTime())) {
      return true;
    }
    slotDate.setHours(0, 0, 0, 0);
    return slotDate >= weekStart && slotDate <= weekEnd;
  };

  if (!availability?.length) {
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

  const weekSlots = availability
    .map(mapAvailabilityDay)
    .map((slot) => normalizeDetailSlot(slot, referenceDate))
    .filter(isInCurrentWeek)
    .sort((a, b) => {
      const aTime = new Date(a.id).getTime();
      const bTime = new Date(b.id).getTime();
      if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
        return 0;
      }
      return aTime - bTime;
    });

  if (weekSlots.length > 0) {
    return weekSlots;
  }

  return availability
    .map(mapAvailabilityDay)
    .map((slot) => normalizeDetailSlot(slot, referenceDate));
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
    bannerImage: pickBannerImage(item),
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
