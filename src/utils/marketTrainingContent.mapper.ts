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
  resolveCourseNoteMaterials,
  resolveLessonBodyText,
  resolveLessonDocuments,
  resolveLessonVideoUrl,
} from '@/utils/trainingLessonMedia';

const FALLBACK_BANNER =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80';

function text(value: string | null | undefined, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
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
  if (!value) return undefined;
  if (
    value.startsWith('data:image/') ||
    value.startsWith('http://') ||
    value.startsWith('https://')
  ) {
    return value;
  }
  return `data:image/png;base64,${value}`;
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
  if (type === 'text' || type === 'topic') return 'text';
  // Assignments open as readable items so complete-lesson can advance the path.
  if (type === 'assignment' || type === 'task') return 'text';
  if (type === 'youtube' || type === 'yt') return 'youtube';
  if (type === 'video' || type === 'audio') return 'video';

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
  return 'video';
}

function mapAssessmentToExam(
  assessment: TrainingContentAssessmentApi,
): TrainingExam {
  const questions = (assessment.questions ?? []).map((q, index) => {
    const rawOptions = q.options;
    let options: { id: string; label: string }[] = [];
    if (Array.isArray(rawOptions)) {
      options = rawOptions.map((opt, optIndex) => {
        if (typeof opt === 'string') {
          return { id: `opt-${optIndex}`, label: opt };
        }
        return {
          id: text(opt.id, `opt-${optIndex}`),
          label: text(opt.label, `Option ${optIndex + 1}`),
        };
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
      prompt: text(q.question_text, `Question ${index + 1}`),
      options,
      correctOptionId: correct || undefined,
      questionType,
    };
  });

  return {
    id: assessment.id,
    title: text(assessment.title, 'Quiz'),
    subtitle: 'Session quiz',
    questionCount: questions.length,
    passPercent: assessment.pass_percent ?? 67,
    questions,
  };
}

function sectionItemsOf(
  section: TrainingContentSectionApi,
): TrainingContentLessonApi[] {
  return (section.lessons?.length ? section.lessons : section.items) ?? [];
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
    ...(previous.assessments ?? []),
  ];
  if (nested.length > 0) {
    return nested.every((a) => Boolean(a.is_submitted));
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
    exams[assessment.id] = mapAssessmentToExam(assessment);
  }

  const duration =
    text(lesson.duration) ||
    (kind === 'exam'
      ? `${(assessment?.questions ?? []).length || '—'} questions`
      : '—');
  const detail =
    text(lesson.detail) ||
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
  const videoUrl = resolveLessonVideoUrl(lesson);
  const quizSubmitted =
    Boolean(lesson.is_completed) || Boolean(assessment?.is_submitted);
  const lessonQrCode = text(lesson.qr_code) || text(lesson.pass_code);
  const progressSeconds =
    num(lesson.progress_seconds) ?? num(lesson.position_seconds);
  const durationSeconds = num(lesson.duration_seconds);

  return {
    id: lesson.id,
    kind,
    title: text(lesson.title, 'Lesson'),
    duration,
    detail,
    imageUrl: text(lesson.thumbnail_url) || undefined,
    videoUrl: kind === 'document' ? undefined : videoUrl,
    bodyText: resolveLessonBodyText(lesson),
    documentUrls: documents.length
      ? documents.map((doc) => doc.url)
      : undefined,
    documentFileName: documents[0]?.name,
    isDownloadable: lesson.is_downloadable ?? undefined,
    sectionId: sectionId || undefined,
    joinUrl: text(lesson.meeting_link),
    joinMeta: text(lesson.join_meta),
    venue: text(lesson.venue) || undefined,
    address: text(lesson.address) || undefined,
    passCode:
      lessonQrCode ||
      (kind === 'venue' ? trainingQrCode : '') ||
      undefined,
    qrImageBase64:
      resolveQrImageUri(lesson.qr_image_base64) ||
      (kind === 'venue' ? sectionQrImage : undefined) ||
      undefined,
    checkInWindow: text(lesson.check_in_window) || undefined,
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
  const title = text(section.title, `Session ${index + 1}`);
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
  const lessons = sectionItems.map((lesson) =>
    mapLesson(
      lesson,
      sectionLocked,
      exams,
      deliveryMode,
      sectionQrCode,
      section.id,
      forceUnlock,
      sectionQrImage,
    ),
  );

  const nestedAssessments = [
    ...(section.assessment ? [section.assessment] : []),
    ...(section.assessments ?? []),
  ];
  for (const assessment of nestedAssessments) {
    if (!assessment?.id) continue;
    exams[assessment.id] = mapAssessmentToExam(assessment);
    const already = lessons.some((l) => l.examId === assessment.id);
    if (!already) {
      lessons.push({
        id: `exam-${assessment.id}`,
        kind: 'exam',
        title: text(assessment.title, 'Session quiz'),
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
  const rawSummary = text(section.summary);
  const summary =
    !rawSummary || /^0\s+lessons?$/i.test(rawSummary)
      ? lessonCountLabel
      : rawSummary;

  return {
    id: section.id || `section-${index}`,
    dayLabel: dayLabel || `Session ${index + 1}`,
    title: name,
    summary,
    unlockHint: forceUnlock
      ? 'Continue with this session'
      : text(
          section.unlock_hint,
          'Finish this session’s content to continue',
        ),
    sectionType: text(section.type) || undefined,
    meetingLink: isVenueSection
      ? undefined
      : text(section.meeting_link) || undefined,
    schedule: text(section.schedule) || undefined,
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
  const sections = Array.isArray(data.sections) ? [...data.sections] : [];
  sections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const deliveryMode = resolveDeliveryMode(data.delivery_mode);
  const trainingQrCode = text(data.qr_code);
  const trainingQrImage =
    resolveQrImageUri(data.qr_image_base64) ||
    sections
      .map((section) => resolveQrImageUri(section.qr_image_base64))
      .find(Boolean);

  const days = sections.map((section, index) =>
    mapSection(
      section,
      index,
      exams,
      deliveryMode,
      trainingQrCode,
      index > 0 ? sections[index - 1] : null,
      trainingQrImage,
    ),
  );

  for (const assessment of data.assessments ?? []) {
    if (!assessment?.id) continue;
    exams[assessment.id] = mapAssessmentToExam(assessment);
  }

  return {
    trainingId: String(data.training_id),
    title: text(data.title, 'Training'),
    vendor: text(data.enterprise_name, 'Training'),
    instructor: text(data.instructor_name, 'Instructor'),
    bannerUrl: text(data.primary_image) || FALLBACK_BANNER,
    deliveryMode,
    days,
    exams,
    courseNotes: resolveCourseNoteMaterials(data),
    resumeSectionId:
      text(data.resume_section_id) || undefined,
    resumeLessonId:
      text(data.resume_lesson_id) || text(data.resume_lesson) || undefined,
  };
}
