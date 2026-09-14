import type {
  TrainingReviewApiItem,
  TrainingReviewsApiResponse,
  TrainingReviewView,
} from '@/types/training.types';

function formatReviewDate(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function authorFromEmail(email?: string | null): string {
  const raw = (email ?? '').trim();
  if (!raw) return 'Learner';
  const local = raw.split('@')[0]?.trim();
  if (!local) return 'Learner';
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function mapTrainingReviewApiItem(
  item: TrainingReviewApiItem,
): TrainingReviewView {
  return {
    id: item.id,
    author: authorFromEmail(item.participant_email),
    rating: Number(item.rating) || 0,
    comment: (item.comment ?? '').trim() || 'No comment',
    date: formatReviewDate(item.created_at),
    verified: Boolean(item.verified),
  };
}

export function mapTrainingReviewsResponse(data: TrainingReviewsApiResponse) {
  const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
  return {
    reviews: reviews.map(mapTrainingReviewApiItem),
    averageRating:
      data?.average_rating == null ? null : Number(data.average_rating),
    count: data?.count == null ? reviews.length : Number(data.count) || 0,
  };
}
