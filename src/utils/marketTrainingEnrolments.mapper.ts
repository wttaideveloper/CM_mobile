import type { TrainingEnrolmentApiItem } from '@/types/training.types';
import { formatMoney } from '@/utils/currency';

export type MyEnrolmentCardView = {
  id: string;
  enrolmentId: string;
  title: string;
  vendor: string;
  mode: 'Virtual' | 'In-Person' | 'Hybrid';
  progressLabel: string;
  enrollmentCode: string;
  priceLabel: string;
  badgeColor: string;
  badgeBg: string;
  accent: string;
  bannerUrl: string;
  nextSession: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  status: string;
  statusLabel: string;
  disabled: boolean;
};

const MODE_STYLES: Record<
  MyEnrolmentCardView['mode'],
  { badgeColor: string; badgeBg: string; accent: string; progressLabel: string }
> = {
  Virtual: {
    badgeColor: '#8352c0',
    badgeBg: '#f2e9fb',
    accent: '#8352c0',
    progressLabel: 'Virtual · live Zoom sessions',
  },
  Hybrid: {
    badgeColor: '#3c63c8',
    badgeBg: '#eaf1ff',
    accent: '#3c63c8',
    progressLabel: 'Hybrid · Zoom + QR days',
  },
  'In-Person': {
    badgeColor: '#257d3f',
    badgeBg: '#e6f4e8',
    accent: '#257d3f',
    progressLabel: 'Physical · QR check-in',
  },
};

const FALLBACK_BANNER =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80';

function text(value: string | null | undefined, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function parseNumber(value: string | number | null | undefined): number {
  if (value == null || value === '') return 0;
  const num =
    typeof value === 'number'
      ? value
      : Number(String(value).trim().replace(/,/g, ''));
  return Number.isFinite(num) ? num : 0;
}

function resolveMode(
  raw?: string | null,
): MyEnrolmentCardView['mode'] {
  const key = text(raw).toLowerCase().replace(/[\s-]+/g, '_');
  if (key.includes('hybrid')) return 'Hybrid';
  if (
    key.includes('physical') ||
    key.includes('in_person') ||
    key.includes('venue') ||
    key.includes('offline')
  ) {
    return 'In-Person';
  }
  return 'Virtual';
}

function formatStatusLabel(status: string): string {
  const key = status.toLowerCase();
  if (key === 'pending_approval' || key === 'pending') {
    return 'Pending approval';
  }
  if (key === 'enrolled' || key === 'active' || key === 'approved') {
    return 'Enrolled';
  }
  if (key === 'completed') return 'Completed';
  if (key === 'cancelled' || key === 'canceled') return 'Cancelled';
  if (!status) return 'Enrolled';
  return status
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function isEnrolmentDisabled(status: string): boolean {
  const key = status.toLowerCase();
  return key === 'pending_approval' || key === 'pending';
}

export function mapEnrolmentApiToCard(
  item: TrainingEnrolmentApiItem,
): MyEnrolmentCardView | null {
  const id = text(item.training_id || item.training?.id);
  if (!id) return null;

  const mode = resolveMode(
    item.delivery_mode || item.training?.delivery_mode,
  );
  const style = MODE_STYLES[mode];
  const priceAmount = parseNumber(item.price);
  const priceLabel =
    priceAmount <= 0 ? 'Free' : formatMoney(priceAmount, item.currency);

  const completedLessons = Math.max(0, Math.round(parseNumber(item.completed_lessons)));
  const totalLessons = Math.max(0, Math.round(parseNumber(item.total_lessons)));
  let progressPercent = Math.round(parseNumber(item.progress_percent));
  if (
    progressPercent <= 0 &&
    totalLessons > 0 &&
    completedLessons > 0
  ) {
    progressPercent = Math.round((completedLessons / totalLessons) * 100);
  }
  progressPercent = Math.max(0, Math.min(100, progressPercent));

  const duration = text(item.duration);
  const status = text(item.status, 'enrolled');
  const disabled = isEnrolmentDisabled(status);
  const statusLabel = formatStatusLabel(status);

  return {
    id,
    enrolmentId: text(
      item.enrolment_id || item.enrollment_id || item.enrol_id || item.id,
      id,
    ),
    title:
      text(item.title || item.training?.title, 'Untitled training'),
    vendor: text(item.enterprise_name, 'Training'),
    mode,
    progressLabel: style.progressLabel,
    enrollmentCode: text(
      item.qr_code || item.enrollment_code,
      '—',
    ),
    priceLabel,
    badgeColor: style.badgeColor,
    badgeBg: style.badgeBg,
    accent: style.accent,
    bannerUrl:
      text(item.primary_image || item.training?.primary_image) ||
      FALLBACK_BANNER,
    nextSession: disabled
      ? 'Waiting for approval before you can start'
      : duration
        ? `${duration} · Continue in course`
        : 'Open course to continue',
    progressPercent,
    completedLessons,
    totalLessons,
    status,
    statusLabel,
    disabled,
  };
}

export function mapEnrolmentsApiToCards(
  items: TrainingEnrolmentApiItem[] | null | undefined,
): MyEnrolmentCardView[] {
  if (!Array.isArray(items)) return [];
  return items
    .map(mapEnrolmentApiToCard)
    .filter((row): row is MyEnrolmentCardView => row != null);
}
