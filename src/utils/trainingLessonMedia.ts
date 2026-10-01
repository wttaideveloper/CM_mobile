import type {
  TrainingContentLessonApi,
  TrainingContentMediaFileApi,
  TrainingContentApiResponse,
} from '@/types/training.types';
import { API_CONFIG } from '@/config';
import { formatTrainingFileSize } from '@/utils/trainingFileSize';

const BODY_TEXT_MAX = 20_000;
const PLAYABLE_URL_MAX = 8_000;

function trim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Coerce API strings, numbers, or { text/html/body } blobs into plain text. */
export function asPlainText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value.trim() || fallback;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (value && typeof value === 'object') {
    const rec = value as Record<string, unknown>;
    for (const key of [
      'text',
      'html',
      'body',
      'content',
      'description',
      'name',
      'title',
    ]) {
      if (typeof rec[key] === 'string' && rec[key].trim()) {
        return rec[key].trim();
      }
    }
  }
  return fallback;
}

export function clampDisplayText(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}…`;
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
    const name = trim(entry.name) || trim(entry.title);
    return name || undefined;
  }
  return undefined;
}

function mediaEntrySizeLabel(
  entry: TrainingContentMediaFileApi | null | undefined,
): string | undefined {
  if (!entry || typeof entry === 'string') return undefined;
  const label = formatTrainingFileSize(
    entry.size ?? entry.file_size ?? null,
  );
  return label || undefined;
}

export function firstMediaUrl(
  values?: Array<string | TrainingContentMediaFileApi | null | undefined> | null,
): string | undefined {
  if (!Array.isArray(values)) return undefined;
  for (const entry of values) {
    const url = mediaEntryUrl(entry);
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
  if (!raw || raw.length > PLAYABLE_URL_MAX) return undefined;
  return resolveAbsoluteApiUrl(raw) || undefined;
}

/** True when expo-video can safely attempt this URI (not notes/HTML dumps). */
export function isPlayableVideoUrl(url?: string | null): boolean {
  const value = trim(url);
  if (!value || value.length > PLAYABLE_URL_MAX) return false;
  if (isYoutubeUrl(value)) return false;
  if (value.startsWith('data:')) return false;
  if (/^(file|content|asset|ph|assets-library):/i.test(value)) return true;
  if (!/^https?:\/\//i.test(value)) return false;
  const path = value.split('?')[0]?.toLowerCase() ?? '';
  if (/\.(pdf|docx?|txt|html?|png|jpe?g|gif|webp|zip)$/i.test(path)) {
    return false;
  }
  return true;
}

/** YouTube watch/share URLs cannot play in expo-video on iOS. */
export function isYoutubeUrl(url?: string | null): boolean {
  const value = (url ?? '').trim().toLowerCase();
  if (!value) return false;
  return (
    value.includes('youtube.com') ||
    value.includes('youtu.be') ||
    value.includes('youtube-nocookie.com')
  );
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
    const raw = typeof entry === 'string' ? trim(entry) : mediaEntryUrl(entry);
    const url = resolveAbsoluteApiUrl(raw);
    if (!url || docs.some((d) => d.url === url)) return;
    docs.push({
      url,
      name: typeof entry === 'string' ? undefined : mediaEntryName(entry),
    });
  };

  const docsList = Array.isArray(lesson.documents) ? lesson.documents : [];
  const notesList = Array.isArray(lesson.notes) ? lesson.notes : [];
  for (const doc of docsList) push(doc);
  if (type === 'notes') {
    for (const note of notesList) push(note);
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
  const text = asPlainText(lesson.content);
  if (!text) return undefined;
  return clampDisplayText(text, BODY_TEXT_MAX);
}

/**
 * Turn relative API paths into absolute URLs for download/open.
 * Always prefer the HTTPS API host for `/api/v1/...` media so iOS ATS
 * does not block raw `http://IP/...` upload links from the backend.
 */
export function resolveAbsoluteApiUrl(url: string): string {
  const trimmed = trim(url);
  if (!trimmed) return '';
  if (/^(file|content|asset|ph|assets-library):/i.test(trimmed)) return trimmed;

  const configuredBase = API_CONFIG.BASE_URL.replace(/\/$/, '');
  // If env points at an insecure IP, still serve media via the known HTTPS host.
  let httpsOrigin = configuredBase;
  try {
    const configured = new URL(
      /^https?:\/\//i.test(configuredBase)
        ? configuredBase
        : `https://${configuredBase}`,
    );
    if (
      configured.protocol === 'http:' ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(configured.hostname)
    ) {
      httpsOrigin = 'https://chat.wisdomtooth.tech';
    } else {
      httpsOrigin = `https://${configured.host}`;
    }
  } catch {
    httpsOrigin = 'https://chat.wisdomtooth.tech';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const isTrainingApiPath = parsed.pathname.includes('/api/v1/');
      const isIpHost = /^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname);
      // Rewrite insecure / off-host training uploads onto HTTPS API origin.
      if (isTrainingApiPath && (parsed.protocol === 'http:' || isIpHost)) {
        return `${httpsOrigin}${parsed.pathname}${parsed.search}`;
      }
      if (parsed.protocol === 'http:' && !isIpHost) {
        return `https://${parsed.host}${parsed.pathname}${parsed.search}`;
      }
    } catch {
      /* keep original */
    }
    return trimmed;
  }

  return trimmed.startsWith('/')
    ? `${httpsOrigin}${trimmed}`
    : `${httpsOrigin}/${trimmed}`;
}

export type CourseNoteMaterial = {
  id: string;
  title: string;
  url: string;
  kind: 'notes_pdf' | 'note' | 'document';
  /** Human-readable size when API provides `size` / `file_size`. */
  sizeLabel?: string;
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
    sizeLabel?: string,
  ) => {
    const absolute = resolveAbsoluteApiUrl(rawUrl ?? '');
    if (!absolute || seen.has(absolute)) return;
    seen.add(absolute);
    items.push({
      id,
      title,
      url: absolute,
      kind,
      ...(sizeLabel ? { sizeLabel } : {}),
    });
  };

  const notesPdf = trim(data.notes_pdf_url);
  if (notesPdf) {
    push(notesPdf, 'Course notes PDF', 'notes_pdf', 'notes-pdf');
  }

  const notesList = Array.isArray(data.notes) ? data.notes : [];
  notesList.forEach((entry, index) => {
    const url = mediaEntryUrl(entry);
    const name = mediaEntryName(entry) || `Note ${index + 1}`;
    push(url, name, 'note', `note-${index}`, mediaEntrySizeLabel(entry));
  });

  const documentsList = Array.isArray(data.documents) ? data.documents : [];
  documentsList.forEach((entry, index) => {
    const url = mediaEntryUrl(entry);
    const name = mediaEntryName(entry) || `Document ${index + 1}`;
    push(url, name, 'document', `doc-${index}`, mediaEntrySizeLabel(entry));
  });

  return items;
}

