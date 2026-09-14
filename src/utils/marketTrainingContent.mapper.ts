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

const FALLBACK_BANNER =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80';

function text(value: string | null | undefined, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
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
  return 'Virtual';
}

/** Infer UI lesson kind when API sends type "text" or empty. */
function resolveLessonKind(lesson: TrainingContentLessonApi): LessonKind {
  const type = text(lesson.type).toLowerCase();
  if (type === 'exam' || type === 'quiz' || type === 'assessment') return 'exam';
  if (type === 'live' || type === 'zoom' || type === 'meeting') return 'live';
  if (type === 'venue' || type === 'in_person' || type === 'physical') {
    return 'venue';
  }
  if (
    type === 'video' ||
    type === 'audio' ||
    type === 'pdf' ||
    type === 'document'
  ) {
    return 'video';
  }

  if (lesson.assessment || lesson.assessment_id) return 'exam';
  if (text(lesson.meeting_link) || text(lesson.join_meta)) return 'live';
  if (text(lesson.venue) || text(lesson.pass_code) || text(lesson.address)) {
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
    return {
      id: text(q.id, `q-${index}`),
      prompt: text(q.question_text, `Question ${index + 1}`),
      options,
      correctOptionId: text(
        q.correct_option_id || q.correct_answer,
        options[0]?.id ?? '',
      ),
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

function mapLesson(
  lesson: TrainingContentLessonApi,
  sectionLocked: boolean,
  exams: Record<string, TrainingExam>,
): TrainingLesson {
  const kind = resolveLessonKind(lesson);
  const assessment = lesson.assessment;
  if (assessment?.id) {
    exams[assessment.id] = mapAssessmentToExam(assessment);
  }

  const duration = text(lesson.duration, kind === 'exam' ? 'Quiz' : '—');
  const detail =
    text(lesson.detail) ||
    (kind === 'live'
      ? 'Online live · join below'
      : kind === 'venue'
        ? 'Show QR at venue'
        : kind === 'exam'
          ? 'Complete after session lessons'
          : 'Open this lesson');

  return {
    id: lesson.id,
    kind,
    title: text(lesson.title, 'Lesson'),
    duration,
    detail,
    imageUrl: text(lesson.thumbnail_url) || undefined,
    videoUrl: text(lesson.content_url) || undefined,
    joinUrl: text(lesson.meeting_link) || undefined,
    joinMeta: text(lesson.join_meta) || undefined,
    venue: text(lesson.venue) || undefined,
    address: text(lesson.address) || undefined,
    passCode: text(lesson.pass_code) || undefined,
    checkInWindow: text(lesson.check_in_window) || undefined,
    examId: assessment?.id || text(lesson.assessment_id) || undefined,
    locked: Boolean(lesson.is_locked) || sectionLocked,
    apiCompleted: Boolean(lesson.is_completed),
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
): TrainingDay {
  const title = text(section.title, `Session ${index + 1}`);
  const { dayLabel, name } = splitSectionTitle(title);
  const sectionLocked = section.is_unlocked === false;
  const lessons = (section.lessons ?? []).map((lesson) =>
    mapLesson(lesson, sectionLocked, exams),
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
        apiCompleted: Boolean(assessment.is_submitted && assessment.passed),
      });
    }
  }

  return {
    id: section.id || `section-${index}`,
    dayLabel: dayLabel || `Session ${index + 1}`,
    title: name,
    summary: text(section.summary, `${lessons.length} lessons`),
    unlockHint: text(
      section.unlock_hint,
      'Finish this session’s content to continue',
    ),
    lessons,
  };
}

export function mapTrainingContentToProgressPath(
  data: TrainingContentApiResponse,
): TrainingProgressPath {
  const exams: Record<string, TrainingExam> = {};
  const sections = Array.isArray(data.sections) ? [...data.sections] : [];
  sections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const days = sections.map((section, index) =>
    mapSection(section, index, exams),
  );

  return {
    trainingId: String(data.training_id),
    title: text(data.title, 'Training'),
    vendor: text(data.enterprise_name, 'Training'),
    instructor: text(data.instructor_name, 'Instructor'),
    bannerUrl: text(data.primary_image) || FALLBACK_BANNER,
    deliveryMode: resolveDeliveryMode(data.delivery_mode),
    days,
    exams,
  };
}
