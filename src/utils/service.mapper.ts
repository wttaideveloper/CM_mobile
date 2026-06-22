import type {
  ServiceApiResponse,
  ServiceAvailabilityDay,
  ServiceDetailItem,
  ServiceDetailSlot,
  ServiceListItem,
} from '@/types/service.types';

import { getRemainingWeekSlots } from '@/utils/weekAvailability';

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

function pickTrainerName(item: ServiceApiResponse): string {
  return textOrNa(
    item.trainer_name ?? item.provider_name ?? item.instructor_name,
  );
}

function pickSessionType(item: ServiceApiResponse): string {
  return textOrNa(item.type ?? item.service_type ?? item.service_category);
}

function pickFormat(item: ServiceApiResponse): string {
  const raw = item.format ?? item.delivery_format;
  if (raw == null || raw.trim() === '') {
    return 'NA';
  }
  return formatServiceLabel(raw);
}

function pickBannerImage(item: ServiceApiResponse): string {
  if (item.banner_image?.trim()) {
    return item.banner_image.trim();
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

function mapAvailabilityDay(item: ServiceAvailabilityDay): ServiceDetailSlot {
  const parsedDate = new Date(item.date);

  return {
    id: item.date,
    dayShort: toDayShort(item.day),
    date: Number.isNaN(parsedDate.getTime())
      ? 0
      : parsedDate.getDate(),
    slots: item.slots?.length ?? 0,
  };
}

export function mapApiAvailabilityToSlots(
  availability?: ServiceAvailabilityDay[] | null,
  referenceDate = new Date(),
): ServiceDetailSlot[] {
  if (!availability?.length) {
    return getRemainingWeekSlots(referenceDate);
  }

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + (6 - today.getDay()));
  weekEnd.setHours(23, 59, 59, 999);

  const filtered = availability
    .map(mapAvailabilityDay)
    .filter((slot) => {
      const slotDate = new Date(slot.id);
      if (Number.isNaN(slotDate.getTime())) {
        return true;
      }
      slotDate.setHours(0, 0, 0, 0);
      return slotDate >= today && slotDate <= weekEnd;
    });

  if (filtered.length > 0) {
    return filtered;
  }

  return availability.map(mapAvailabilityDay);
}

export function mapServiceApiToListItem(item: ServiceApiResponse): ServiceListItem {
  return {
    id: item.id,
    enterpriseId: item.enterprise_id,
    enterpriseName: textOrNa(item.enterprise_name),
    name: textOrNa(item.service_name),
    description: textOrNa(item.service_description),
    category: textOrNa(item.service_category),
    price: item.service_price ?? 0,
    duration: formatDuration(item.duration),
    provider: pickTrainerName(item),
    unit: '/session',
    isAvailable: item.availability_status,
    isActive: item.service_status,
  };
}

export function mapServiceApiToDetailItem(item: ServiceApiResponse): ServiceDetailItem {
  const base = mapServiceApiToListItem(item);

  return {
    ...base,
    enterpriseName: textOrNa(item.enterprise_name),
    sessionType: pickSessionType(item),
    format: pickFormat(item),
    bannerImage: pickBannerImage(item),
    availabilitySlots: mapApiAvailabilityToSlots(item.availability),
  };
}

export function mapServicesApiResponse(
  items: ServiceApiResponse[],
): ServiceListItem[] {
  return items.map(mapServiceApiToListItem);
}

export function formatServicePrice(price: number): string {
  if (!price) {
    return '$0';
  }

  return `$${price.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
