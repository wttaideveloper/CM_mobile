import type {
  TrainingContentLessonApi,
  TrainingContentMediaFileApi,
  TrainingContentApiResponse,
} from '@/types/training.types';
import { API_CONFIG } from '@/config';

function trim(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function mediaEntryUrl(entry: TrainingContentMediaFileApi | null | undefined): string {
  if (typeof entry === 'string') return trim(entry);
  if (entry && typeof entry === 'object') return trim(entry.url);
  return '';
}

function mediaEntryName(
  entry: TrainingContentMediaFileApi | null | undefined,
): string | undefined {
  if (entry && typeof entry === 'object') {
    const name = trim(entry.name);
    return name || undefined;
  }
  return undefined;
}

export function firstMediaUrl(values?: string[] | null): string | undefined {
  if (!Array.isArray(values)) return undefined;
  for (const entry of values) {
    const url = trim(entry);
    if (url) return url;
  }
  return undefined;
}

export function resolveLessonVideoUrl(
  lesson: TrainingContentLessonApi,
): string | undefined {
  const raw =
    firstMediaUrl(lesson.videos) ||
    trim(lesson.video_url) ||
    trim(lesson.content_url) ||
    '';
  if (!raw) return undefined;
  return resolveAbsoluteApiUrl(raw) || undefined;
}

export type ResolvedLessonDocument = {
  url: string;
  name?: string;
};

export function resolveLessonDocuments(
  lesson: TrainingContentLessonApi,
): ResolvedLessonDocument[] {
  const type = trim(lesson.type).toLowerCase();
  const docs: ResolvedLessonDocument[] = [];
  const push = (
    entry: TrainingContentMediaFileApi | string | null | undefined,
  ) => {
    const url = typeof entry === 'string' ? trim(entry) : mediaEntryUrl(entry);
    if (!url || docs.some((d) => d.url === url)) return;
    docs.push({
      url,
      name: typeof entry === 'string' ? undefined : mediaEntryName(entry),
    });
  };

  for (const doc of lesson.documents ?? []) push(doc);
  if (type === 'notes') {
    for (const note of lesson.notes ?? []) push(note);
  }

  const contentUrl = trim(lesson.content_url);
  if (
    contentUrl &&
    (type === 'pdf' ||
      type === 'document' ||
      type === 'file' ||
      type === 'notes' ||
      contentUrl.toLowerCase().includes('.pdf'))
  ) {
    push(contentUrl);
  }

  return docs;
}

export function resolveLessonDocumentUrls(
  lesson: TrainingContentLessonApi,
): string[] {
  return resolveLessonDocuments(lesson).map((doc) => doc.url);
}

export function resolveLessonBodyText(
  lesson: TrainingContentLessonApi,
): string | undefined {
  const raw = lesson.content;
  if (raw == null) return undefined;
  const text = trim(raw);
  return text || undefined;
}

/** Turn relative API paths into absolute URLs for download/open. */
export function resolveAbsoluteApiUrl(url: string): string {
  const trimmed = trim(url);
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(file|content|asset|ph|assets-library):/i.test(trimmed)) return trimmed;
  const base = API_CONFIG.BASE_URL.replace(/\/$/, '');
  return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

export type CourseNoteMaterial = {
  id: string;
  title: string;
  url: string;
  kind: 'notes_pdf' | 'note' | 'document';
};

/**
 * Course-level notes/docs from content API (outside sections).
 * Uses notes_pdf_url, root notes[], and root documents[].
 */
export function resolveCourseNoteMaterials(
  data: TrainingContentApiResponse,
): CourseNoteMaterial[] {
  const items: CourseNoteMaterial[] = [];
  const seen = new Set<string>();

  const push = (
    rawUrl: string | null | undefined,
    title: string,
    kind: CourseNoteMaterial['kind'],
    id: string,
  ) => {
    const absolute = resolveAbsoluteApiUrl(rawUrl ?? '');
    if (!absolute || seen.has(absolute)) return;
    seen.add(absolute);
    items.push({ id, title, url: absolute, kind });
  };

  const notesPdf = trim(data.notes_pdf_url);
  if (notesPdf) {
    push(notesPdf, 'Course notes PDF', 'notes_pdf', 'notes-pdf');
  }

  (data.notes ?? []).forEach((entry, index) => {
    const url = mediaEntryUrl(entry);
    const name = mediaEntryName(entry) || `Note ${index + 1}`;
    push(url, name, 'note', `note-${index}`);
  });

  (data.documents ?? []).forEach((entry, index) => {
    const url = mediaEntryUrl(entry);
    const name = mediaEntryName(entry) || `Document ${index + 1}`;
    push(url, name, 'document', `doc-${index}`);
  });

  return items;
}

