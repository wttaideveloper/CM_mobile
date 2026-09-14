import type { TrainingWishlistApiItem } from '@/types/training.types';
import { formatMoney } from '@/utils/currency';

export type WishlistTrainingView = {
  id: string;
  title: string;
  detail: string;
  priceLabel: string;
  imageUrl?: string | null;
  modeLabel?: string | null;
  averageRating?: number | null;
  reviewsCount?: number;
  addedAt?: string | null;
};

function formatDeliveryMode(raw?: string | null): string | null {
  const key = (raw ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (!key) return null;
  if (key.includes('hybrid')) return 'Hybrid';
  if (
    key.includes('physical') ||
    key.includes('in_person') ||
    key.includes('venue') ||
    key.includes('offline')
  ) {
    return 'Physical';
  }
  if (
    key.includes('virtual') ||
    key.includes('online') ||
    key.includes('remote') ||
    key.includes('live')
  ) {
    return 'Virtual';
  }
  return raw!.trim();
}

export function mapWishlistApiItem(
  item: TrainingWishlistApiItem,
): WishlistTrainingView {
  const priceRaw = item.price;
  const amount =
    typeof priceRaw === 'number'
      ? priceRaw
      : Number.parseFloat(String(priceRaw ?? '').replace(/[^0-9.-]/g, ''));
  const priceLabel =
    !Number.isFinite(amount) || amount <= 0
      ? 'Free'
      : formatMoney(amount, item.currency ?? undefined);

  const modeLabel = formatDeliveryMode(item.delivery_mode);
  const enterprise = (item.enterprise_name ?? '').trim();
  const duration = (item.duration ?? '').trim();
  const detailParts = [enterprise || null, duration || null]
    .filter(Boolean)
    .join(' · ');

  const rating =
    item.average_rating == null ? null : Number(item.average_rating);
  const reviews =
    item.reviews_count == null ? 0 : Number(item.reviews_count) || 0;

  return {
    id: item.training_id || item.id,
    title: (item.title ?? '').trim() || 'Training',
    detail: detailParts || 'Saved training',
    priceLabel,
    imageUrl: item.primary_image ?? null,
    modeLabel,
    averageRating: rating,
    reviewsCount: reviews,
    addedAt: item.added_at ?? null,
  };
}
