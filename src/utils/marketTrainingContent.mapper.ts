import type {
  LessonKind,
  TrainingDay,
  TrainingDeliveryMode,
  TrainingExam,
  TrainingLesson,
  TrainingProgressPath,
} from '@/components/market/marketTrainingProgressData';
import type {
  TrainingContentApiResponse,
  TrainingContentAssessmentApi,
  TrainingContentLessonApi,
  TrainingContentSectionApi,
} from '@/types/training.types';
import {
  asPlainText,
  clampDisplayText,
  isPlayableVideoUrl,
  isYoutubeUrl,
  resolveCourseNoteMaterials,
  resolveLessonBodyText,
  resolveLessonDocuments,
  resolveLessonVideoUrl,
} from '@/utils/trainingLessonMedia';
import { parseSessionStart } from '@/utils/dateTime';

const FALLBACK_BANNER =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80';

const TITLE_MAX = 400;
const DETAIL_MAX = 800;
const QR_URI_MAX = 350_000;

function text(value: unknown, fallback = ''): string {
  return asPlainText(value, fallback);
}

function pickSessionStartRaw(
  ...rows: Array<Record<string, unknown> | null | undefined>
): string {
  for (const row of rows) {
    if (!row) continue;
    for (const key of [
      'starts_at',
      'scheduled_at',
      'start_time',
      'schedule',
    ]) {
      const value = text(row[key]);
      if (value && parseSessionStart(value)) return value;
    }
    const schedule = text(row.schedule);
    if (schedule) return schedule;
  }
  return '';
}

function safeTitle(value: unknown, fallback = 'Lesson'): string {
  return clampDisplayText(text(value, fallback), TITLE_MAX);
}

function safeDetail(value: unknown, fallback = ''): string {
  return clampDisplayText(text(value, fallback), DETAIL_MAX);
}

function num(value: string | number | null | undefined): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/** Normalize content API `qr_image_base64` to an Image-ready URI. */
function resolveQrImageUri(raw?: string | null): string | undefined {
  const value = text(raw);
  if (!value || value.length > QR_URI_MAX) return undefined;
  if (
    value.startsWith('data:image/') ||
    value.startsWith('http://') ||
    value.startsWith('https://')
  ) {
    return value.length > QR_URI_MAX ? undefined : value;
  }
  const uri = `data:image/png;base64,${value}`;
  return uri.length > QR_URI_MAX ? undefined : uri;
}

function resolveDeliveryMode(raw?: string | null): TrainingDeliveryMode {
  const key = text(raw).toLowerCase().replace(/[\s-]+/g, '_');
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
    key.includes('self_paced') ||
    key.includes('self_placed') ||
    key.includes('on_demand') ||
    key.includes('recorded')
  ) {
    return 'Self-paced';
  }
  // online / virtual / live → Virtual (live meeting path)
  return 'Virtual';
}

/** Infer UI lesson kind when API sends type "text", "other", or empty. */
function resolveLessonKind(
  lesson: TrainingContentLessonApi,
  deliveryMode: TrainingDeliveryMode,
): LessonKind {
  const type = text(lesson.type).toLowerCase();
  if (type === 'exam' || type === 'quiz' || type === 'assessment') return 'exam';
  if (
    type === 'live' ||
    type === 'zoom' ||
    type === 'meeting' ||
    type === 'google_meet'
  ) {
    return 'live';
  }
  // Content API uses "other" for in-person / venue lessons (show QR, not meeting link).
  if (
    type === 'other' ||
    type === 'venue' ||
    type === 'in_person' ||
    type === 'physical'
  ) {
    return 'venue';
  }
  if (type === 'pdf' || type === 'document' || type === 'file') {
    return 'document';
  }
  if (type === 'notes') return 'document';
  if (
    type === 'text' ||
    type === 'topic' ||
    type === 'html' ||
    type === 'article' ||
    type === 'reading' ||
    type === 'page'
  ) {
    return 'text';
  }
  // Assignments / ad-hoc tasks open as readable items, not the video player.
  if (type === 'assignment' || type === 'task') return 'text';
  if (type === 'youtube' || type === 'yt') return 'youtube';

  const mediaUrl = resolveLessonVideoUrl(lesson);
  if (isYoutubeUrl(mediaUrl)) return 'youtube';
  if (type === 'video' || type === 'audio') {
    return isPlayableVideoUrl(mediaUrl) ? 'video' : 'text';
  }

  if (lesson.assessment || lesson.assessment_id) return 'exam';
  if (text(lesson.meeting_link) || text(lesson.join_meta)) return 'live';
  if (text(lesson.venue) || text(lesson.pass_code) || text(lesson.address)) {
    return 'venue';
  }

  // Physical trainings default to venue QR when there is no online join link.
  if (deliveryMode === 'Physical' && !text(lesson.meeting_link)) {
    return 'venue';
  }

  const title = text(lesson.title).toLowerCase();
  if (title.includes('live') || title.includes('zoom') || title.includes('meet')) {
    return 'live';
  }
  if (title.includes('venue') || title.includes('qr') || title.includes('studio')) {
    return 'venue';
  }
  if (title.includes('quiz') || title.includes('exam') || title.includes('assessment')) {
    return 'exam';
  }
  if (isPlayableVideoUrl(mediaUrl)) return 'video';
  return 'text';
}

function mapAssessmentToExam(
  assessment: TrainingContentAssessmentApi,
): TrainingExam {
  const questions = (Array.isArray(assessment.questions)
    ? assessment.questions
    : []
  )
    .filter((q): q is NonNullable<typeof q> => Boolean(q && typeof q === 'object'))
    .map((q, index) => {
    const rawOptions = q.options;
    let options: { id: string; label: string }[] = [];
    if (Array.isArray(rawOptions)) {
      options = rawOptions.map((opt, optIndex) => {
        if (typeof opt === 'string') {
          return {
            id: `opt-${optIndex}`,
            label: clampDisplayText(opt, TITLE_MAX),
          };
        }
        if (opt && typeof opt === 'object') {
          return {
            id: text(opt.id, `opt-${optIndex}`),
            label: safeTitle(opt.label, `Option ${optIndex + 1}`),
          };
        }
        return { id: `opt-${optIndex}`, label: `Option ${optIndex + 1}` };
      });
    }

    const rawType = text(q.question_type).toLowerCase();
    let questionType:
      | 'single_choice'
      | 'multiple_select'
      | 'true_false'
      | 'short_answer'
      | 'essay' = 'single_choice';
    if (rawType === 'multiple_select' || rawType === 'multi_select') {
      questionType = 'multiple_select';
    } else if (rawType === 'true_false' || rawType === 'boolean') {
      questionType = 'true_false';
    } else if (rawType === 'short_answer' || rawType === 'text') {
      questionType = 'short_answer';
    } else if (rawType === 'essay' || rawType === 'long_answer') {
      questionType = 'essay';
    } else if (rawType === 'single_choice' || rawType === 'mcq') {
      questionType = 'single_choice';
    } else if (options.length === 0) {
      questionType = 'short_answer';
    }

    const correct = text(q.correct_option_id || q.correct_answer);

    return {
      id: text(q.id, `q-${index}`),
      prompt: safeTitle(q.question_text, `Question ${index + 1}`),
      options,
      correctOptionId: correct || undefined,
      questionType,
    };
  });

  return {
    id: text(assessment.id, 'exam'),
    title: safeTitle(assessment.title, 'Quiz'),
    subtitle: 'Session quiz',
    questionCount: questions.length,
    passPercent: assessment.pass_percent ?? 67,
    questions,
  };
}

function sectionItemsOf(
  section: TrainingContentSectionApi,
): TrainingContentLessonApi[] {
  const raw = (section.lessons?.length ? section.lessons : section.items) ?? [];
  return raw.filter(
    (lesson): lesson is TrainingContentLessonApi =>
      Boolean(lesson && typeof lesson === 'object'),
  );
}

function isQuizLikeLesson(lesson: TrainingContentLessonApi): boolean {
  const type = text(lesson.type).toLowerCase();
  return (
    type === 'quiz' ||
    type === 'exam' ||
    type === 'assessment' ||
    Boolean(lesson.assessment_id) ||
    Boolean(lesson.assessment?.id)
  );
}

/** Quiz gate cleared on submit — do not require `passed`. */
function isQuizSubmitted(lesson: TrainingContentLessonApi): boolean {
  if (lesson.is_completed) return true;
  if (lesson.assessment?.is_submitted) return true;
  return false;
}

/**
 * Previous session’s quiz gate is satisfied when every quiz/exam item was
 * submitted (pass/fail does not matter). Used for self-paced unlock override.
 * If there is no quiz, returns false so API unlock flags stay authoritative.
 */
function previousSessionQuizGateCleared(
  previous?: TrainingContentSectionApi | null,
): boolean {
  if (!previous) return false;
  const items = sectionItemsOf(previous);
  const quizzes = items.filter(isQuizLikeLesson);
  if (quizzes.length > 0) {
    return quizzes.every(isQuizSubmitted);
  }
  const nested = [
    ...(previous.assessment ? [previous.assessment] : []),
    ...(Array.isArray(previous.assessments) ? previous.assessments : []),
  ];
  if (nested.length > 0) {
    return nested.every((a) => Boolean(a && a.is_submitted));
  }
  return false;
}

function mapLesson(
  lesson: TrainingContentLessonApi,
  sectionLocked: boolean,
  exams: Record<string, TrainingExam>,
  deliveryMode: TrainingDeliveryMode,
  trainingQrCode: string,
  sectionId?: string,
  /** When true, ignore API lesson locks (quiz gate cleared without pass). */
  forceUnlock = false,
  sectionQrImage?: string,
): TrainingLesson {
  const kind = resolveLessonKind(lesson, deliveryMode);
  const assessment = lesson.assessment;
  if (assessment?.id) {
    try {
      exams[assessment.id] = mapAssessmentToExam(assessment);
    } catch {
      // Keep the lesson even if the nested quiz payload is malformed.
    }
  }

  const duration = clampDisplayText(
    text(lesson.duration) ||
      (kind === 'exam'
        ? `${(assessment?.questions ?? []).length || '—'} questions`
        : '—'),
    80,
  );
  const detail =
    safeDetail(lesson.detail) ||
    (kind === 'live'
      ? 'Online live · join below'
      : kind === 'venue'
        ? 'Show QR at venue'
        : kind === 'exam'
          ? 'Tap to take this quiz'
          : kind === 'document'
            ? 'Tap to open PDF'
            : kind === 'text'
              ? 'Read this topic'
              : kind === 'youtube'
                ? 'Open on YouTube'
                : 'Watch this lesson');

  const documents = resolveLessonDocuments(lesson);
  const resolvedVideoUrl = resolveLessonVideoUrl(lesson);
  const videoUrl =
    kind === 'youtube' || isPlayableVideoUrl(resolvedVideoUrl)
      ? resolvedVideoUrl
      : undefined;
  const quizSubmitted =
    Boolean(lesson.is_completed) || Boolean(assessment?.is_submitted);
  const lessonQrCode = text(lesson.qr_code) || text(lesson.pass_code);
  const progressSeconds =
    num(lesson.progress_seconds) ?? num(lesson.position_seconds);
  const durationSeconds = num(lesson.duration_seconds);

  return {
    id: text(lesson.id),
    kind,
    title: safeTitle(lesson.title, 'Lesson'),
    duration,
    detail,
    imageUrl: (() => {
      const thumb = text(lesson.thumbnail_url);
      return thumb && thumb.length < 8_000 ? thumb : undefined;
    })(),
    videoUrl: kind === 'document' ? undefined : videoUrl,
    bodyText: resolveLessonBodyText(lesson),
    documentUrls: documents.length
      ? documents.map((doc) => doc.url)
      : undefined,
    documentFileName: documents[0]?.name,
    isDownloadable: lesson.is_downloadable ?? undefined,
    sectionId: sectionId || undefined,
    joinUrl: clampDisplayText(text(lesson.meeting_link), 2_000),
    joinMeta: safeDetail(lesson.join_meta),
    venue: safeDetail(lesson.venue) || undefined,
    address: safeDetail(lesson.address) || undefined,
    passCode:
      clampDisplayText(
        lessonQrCode || (kind === 'venue' ? trainingQrCode : ''),
        80,
      ) || undefined,
    qrImageBase64:
      resolveQrImageUri(lesson.qr_image_base64) ||
      (kind === 'venue' ? sectionQrImage : undefined) ||
      undefined,
    checkInWindow: safeDetail(lesson.check_in_window) || undefined,
    examId: assessment?.id || text(lesson.assessment_id) || undefined,
    locked: sectionLocked || (Boolean(lesson.is_locked) && !forceUnlock),
    apiCompleted:
      kind === 'exam'
        ? quizSubmitted
        : Boolean(lesson.is_completed) ||
          ((kind === 'live' || kind === 'venue') &&
            Boolean(lesson.is_attended)),
    progressSeconds,
    durationSeconds,
    isAttended: Boolean(lesson.is_attended),
    attendedAt: text(lesson.attended_at) || undefined,
    startsAt:
      pickSessionStartRaw(lesson as unknown as Record<string, unknown>) ||
      undefined,
  };
}

function splitSectionTitle(title: string): { dayLabel: string; name: string } {
  const cleaned = title.trim();
  const match = cleaned.match(/^(session\s*\d+)\s*[:.\-–]?\s*(.*)$/i);
  if (match) {
    return {
      dayLabel: match[1].replace(/\s+/g, ' '),
      name: match[2].trim() || cleaned,
    };
  }
  return { dayLabel: 'Session', name: cleaned || 'Session' };
}

function mapSection(
  section: TrainingContentSectionApi,
  index: number,
  exams: Record<string, TrainingExam>,
  deliveryMode: TrainingDeliveryMode,
  trainingQrCode: string,
  previousSection?: TrainingContentSectionApi | null,
  /** Shared QR image when a venue section omits `qr_image_base64`. */
  trainingQrImage?: string,
): TrainingDay {
  const title = safeTitle(section.title, `Session ${index + 1}`);
  const { dayLabel, name } = splitSectionTitle(title);
  const apiSectionLocked = section.is_unlocked === false;
  // Self-paced: submitting the previous session quiz unlocks the next session
  // even when `passed` is false / API still sends is_unlocked: false.
  const forceUnlock =
    deliveryMode === 'Self-paced' &&
    apiSectionLocked &&
    previousSessionQuizGateCleared(previousSection);
  const sectionLocked = apiSectionLocked && !forceUnlock;
  const sectionItems = sectionItemsOf(section);
  const sectionType = text(section.type).toLowerCase();
  const isVenueSection = sectionType === 'venue';
  const sectionQrCode = text(section.qr_code) || trainingQrCode;
  // QR image is for venue check-in only (not live / Zoom sessions).
  const sectionQrImage = isVenueSection
    ? resolveQrImageUri(section.qr_image_base64) || trainingQrImage
    : undefined;
  const sectionKey = text(section.id, `section-${index}`);
  const sectionStartsAt = pickSessionStartRaw(
    section as unknown as Record<string, unknown>,
  );
  const lessons = sectionItems.map((lesson, lessonIndex) => {
    try {
      const mapped = mapLesson(
        lesson,
        sectionLocked,
        exams,
        deliveryMode,
        sectionQrCode,
        sectionKey,
        forceUnlock,
        sectionQrImage,
      );
      const kind = mapped.kind;
      const inheritStart =
        (kind === 'live' || kind === 'venue') &&
        !mapped.startsAt &&
        sectionStartsAt
          ? sectionStartsAt
          : mapped.startsAt;
      return {
        ...mapped,
        id: mapped.id || `${sectionKey}-lesson-${lessonIndex}`,
        startsAt: inheritStart || undefined,
      };
    } catch {
      return {
        id: `${sectionKey}-lesson-${lessonIndex}`,
        kind: 'text' as const,
        title: 'Lesson',
        duration: '—',
        detail: 'This item could not be loaded.',
      };
    }
  });

  const nestedAssessments = [
    ...(section.assessment ? [section.assessment] : []),
    ...(Array.isArray(section.assessments) ? section.assessments : []),
  ];
  for (const assessment of nestedAssessments) {
    if (!assessment?.id) continue;
    exams[assessment.id] = mapAssessmentToExam(assessment);
    const already = lessons.some((l) => l.examId === assessment.id);
    if (!already) {
      lessons.push({
        id: `exam-${assessment.id}`,
        kind: 'exam',
        title: safeTitle(assessment.title, 'Session quiz'),
        duration: `${(assessment.questions ?? []).length || '—'} questions`,
        detail: 'Complete after session lessons',
        examId: assessment.id,
        locked: sectionLocked,
        // Submitted is enough — do not require passed
        apiCompleted: Boolean(assessment.is_submitted),
      });
    }
  }

  const lessonCountLabel = `${lessons.length} lesson${lessons.length === 1 ? '' : 's'}`;
  const rawSummary = safeDetail(section.summary);
  const summary =
    !rawSummary || /^0\s+lessons?$/i.test(rawSummary)
      ? lessonCountLabel
      : rawSummary;

  return {
    id: sectionKey,
    dayLabel: clampDisplayText(dayLabel || `Session ${index + 1}`, TITLE_MAX),
    title: clampDisplayText(name, TITLE_MAX),
    summary,
    unlockHint: forceUnlock
      ? 'Continue with this session'
      : safeDetail(
          section.unlock_hint,
          'Finish this session’s content to continue',
        ),
    sectionType: text(section.type) || undefined,
    meetingLink: isVenueSection
      ? undefined
      : text(section.meeting_link) || undefined,
    schedule: text(section.schedule) || sectionStartsAt || undefined,
    venue: text(section.venue) || undefined,
    address: text(section.address) || undefined,
    passCode: isVenueSection ? sectionQrCode || undefined : undefined,
    qrImageBase64: sectionQrImage,
    isAttended: Boolean(section.is_attended),
    attendedAt: text(section.attended_at) || undefined,
    lessons,
  };
}

export function mapTrainingContentToProgressPath(
  data: TrainingContentApiResponse,
): TrainingProgressPath {
  const exams: Record<string, TrainingExam> = {};
  const sections = Array.isArray(data?.sections)
    ? data.sections.filter(
        (section): section is NonNullable<typeof section> =>
          Boolean(section && typeof section === 'object'),
      )
    : [];
  sections.sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
  const deliveryMode = resolveDeliveryMode(data.delivery_mode);
  const trainingQrCode = text(data.qr_code);
  const trainingQrImage =
    resolveQrImageUri(data.qr_image_base64) ||
    sections
      .map((section) => resolveQrImageUri(section.qr_image_base64))
      .find(Boolean);

  const days = sections.map((section, index) => {
    try {
      return mapSection(
        section,
        index,
        exams,
        deliveryMode,
        trainingQrCode,
        index > 0 ? sections[index - 1] : null,
        trainingQrImage,
      );
    } catch {
      return {
        id: `section-${index}`,
        dayLabel: `Session ${index + 1}`,
        title: 'Session',
        summary: '0 lessons',
        unlockHint: 'Finish this session’s content to continue',
        lessons: [],
      };
    }
  });

  for (const assessment of Array.isArray(data.assessments)
    ? data.assessments
    : []) {
    if (!assessment?.id) continue;
    try {
      exams[assessment.id] = mapAssessmentToExam(assessment);
    } catch {
      // Skip a malformed quiz instead of crashing the course.
    }
  }

  const bannerUrl = text(data.primary_image);
  return {
    trainingId: text(data.training_id) || 'training',
    title: safeTitle(data.title, 'Training'),
    vendor: safeTitle(data.enterprise_name, 'Training'),
    instructor: safeTitle(data.instructor_name, 'Instructor'),
    bannerUrl: bannerUrl && bannerUrl.length < 8_000 ? bannerUrl : FALLBACK_BANNER,
    deliveryMode,
    days,
    exams,
    courseNotes: (() => {
      try {
        return resolveCourseNoteMaterials(data);
      } catch {
        return [];
      }
    })(),
    resumeSectionId:
      text(data.resume_section_id) || undefined,
    resumeLessonId:
      text(data.resume_lesson_id) || text(data.resume_lesson) || undefined,
  };
}
