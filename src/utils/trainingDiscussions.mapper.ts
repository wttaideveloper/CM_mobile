import type { TrainingDiscussionApiItem } from '@/types/training.types';
import { asPlainText, clampDisplayText } from '@/utils/trainingLessonMedia';

const TEXT_MAX = 8_000;

function pickText(...values: unknown[]): string {
  for (const value of values) {
    const text = asPlainText(value);
    if (text) return text;
  }
  return '';
}

function replyFromNested(raw: unknown): string {
  if (!Array.isArray(raw) || raw.length === 0) return '';
  for (let index = raw.length - 1; index >= 0; index -= 1) {
    const entry = raw[index];
    if (typeof entry === 'string') {
      const text = entry.trim();
      if (text) return text;
      continue;
    }
    if (!entry || typeof entry !== 'object') continue;
    const row = entry as Record<string, unknown>;
    const text = pickText(row.answer, row.reply, row.text, row.body, row.message);
    if (text) return text;
  }
  return '';
}

export function normalizeTrainingDiscussion(
  item: unknown,
): TrainingDiscussionApiItem | null {
  if (!item || typeof item !== 'object') return null;
  const row = item as Record<string, unknown>;
  const id = pickText(row.id, row.discussion_id);
  if (!id) return null;
  const author =
    pickText(
      row.author,
      row.participant_name,
      row.user_name,
      row.display_name,
      row.name,
    ) || 'Learner';
  const question = clampDisplayText(
    pickText(row.question, row.text, row.body, row.message, row.title),
    TEXT_MAX,
  );
  const answer = clampDisplayText(
    pickText(row.answer, row.reply, replyFromNested(row.replies)),
    TEXT_MAX,
  );

  return {
    id,
    author,
    question: question || '—',
    answer: answer || undefined,
    created_at:
      pickText(row.created_at, row.createdAt, row.updated_at) || undefined,
  };
}

export function normalizeTrainingDiscussions(
  data: unknown,
): TrainingDiscussionApiItem[] {
  const list = Array.isArray(data)
    ? data
    : data && typeof data === 'object'
      ? ((data as { items?: unknown; discussions?: unknown; results?: unknown })
          .items ??
        (data as { discussions?: unknown }).discussions ??
        (data as { results?: unknown }).results)
      : [];
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => normalizeTrainingDiscussion(item))
    .filter((item): item is TrainingDiscussionApiItem => Boolean(item));
}
