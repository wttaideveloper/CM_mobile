import type { ServiceDetailItem, ServiceDetailSlot } from '@/types/service.types';
import { formatServicePrice, normalizeDetailSlot } from '@/utils/service.mapper';

export type SelectedBooking = {
  dateId: string;
  timeSlot: string;
};

export type ServiceViewModel = {
  name: string;
  category: string;
  provider: string | null;
  enterprise: string;
  duration: string;
  price: string;
  unit: string;
  sessionType: string;
  format: string;
  description: string;
  image: string;
  availability: ServiceDetailSlot[];
};

export function providerInitial(name: string | null): string {
  if (!name?.trim()) {
    return '?';
  }
  return name.trim().charAt(0).toUpperCase();
}

function formatUnitLabel(unit: string): string {
  const trimmed = unit.trim();
  if (trimmed.startsWith('/')) {
    return `per ${trimmed.slice(1)}`;
  }
  return trimmed;
}

export function formatTimeSlotDisplay(timeSlot: string): string {
  const start = timeSlot.split('-')[0]?.trim() ?? timeSlot;
  const [hoursRaw, minutesRaw] = start.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (Number.isNaN(hours)) {
    return timeSlot;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  const displayMinutes = Number.isNaN(minutes) ? '00' : String(minutes).padStart(2, '0');

  return `${displayHour}:${displayMinutes} ${period}`;
}

export function mapApiServiceToViewModel(
  service: ServiceDetailItem,
  enterpriseFallback?: string,
): ServiceViewModel {
  const enterprise =
    service.enterpriseName !== 'NA'
      ? service.enterpriseName
      : enterpriseFallback && enterpriseFallback !== 'NA'
        ? enterpriseFallback
        : service.enterpriseName;

  return {
    name: service.name,
    category: service.category,
    provider: service.provider,
    enterprise,
    duration: service.duration,
    price: formatServicePrice(service.price, service.currency),
    unit: formatUnitLabel(service.unit),
    sessionType: service.sessionType,
    format: service.format,
    description: service.description,
    image: service.bannerImage,
    availability: service.availabilitySlots.map((slot) =>
      normalizeDetailSlot(slot, new Date()),
    ),
  };
}
