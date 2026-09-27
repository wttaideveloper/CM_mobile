import type { TrainingListItem } from '@/components/market/marketTrainingData';
import type {
  TrainingApiItem,
  TrainingContentMediaFileApi,
  TrainingCurriculumItemType,
  TrainingDetailView,
  TrainingLessonApi,
} from '@/types/training.types';
import { formatMoney } from '@/utils/currency';
import {
  firstMediaUrl,
  resolveAbsoluteApiUrl,
} from '@/utils/trainingLessonMedia';

const CURRICULUM_TYPES = new Set<TrainingCurriculumItemType>([
  'topic',
  'video',
  'youtube',
  'live',
  'venue',
  'pdf',
  'notes',
  'quiz',
  'assignment',
]);

function normalizeCurriculumType(
  raw?: string | null,
  hasAssessment = false,
): TrainingCurriculumItemType {
  const value = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (CURRICULUM_TYPES.has(value as TrainingCurriculumItemType)) {
    return value as TrainingCurriculumItemType;
  }
  if (hasAssessment || value === 'exam' || value === 'assessment') {
    return 'quiz';
  }
  if (value === 'document' || value === 'file') return 'pdf';
  if (value === 'yt') return 'youtube';
  if (value === 'meeting' || value === 'zoom' || value === 'online') {
    return 'live';
  }
  if (value === 'physical' || value === 'in_person' || value === 'in-person') {
    return 'venue';
  }
  if (value === 'task' || value === 'homework') return 'assignment';
  if (value === 'lesson' || value === 'other' || !value) return 'topic';
  return 'topic';
}

function curriculumMetaFor(
  type: TrainingCurriculumItemType,
  lesson: TrainingLessonApi,
): string {
  const duration = text(lesson.duration);
  if (duration) return duration;
  if (type === 'quiz') {
    const count = Array.isArray(lesson.assessment?.questions)
      ? lesson.assessment.questions.length
      : 0;
    return count > 0
      ? `${count} question${count === 1 ? '' : 's'}`
      : 'Quiz';
  }
  if (type === 'pdf' || type === 'notes') {
    return text(lesson.file_size) || (lesson.is_downloadable ? 'Download' : '');
  }
  if (type === 'live') return 'Live session';
  if (type === 'venue') return 'In-person';
  if (type === 'assignment') return 'Task';
  if (type === 'youtube') return 'YouTube';
  if (type === 'video') return 'Video';
  return '';
}

function mediaEntryUrl(
  entry: TrainingContentMediaFileApi | string | null | undefined,
): string {
  if (typeof entry === 'string') return text(entry);
  if (entry && typeof entry === 'object') return text(entry.url);
  return '';
}

function lessonPreviewVideoUrl(lesson: TrainingLessonApi): string | undefined {
  const raw = firstMediaUrl(lesson.videos) || text(lesson.video_url);
  if (!raw) return undefined;
  const absolute = resolveAbsoluteApiUrl(raw);
  return absolute || undefined;
}

function lessonPreviewFileUrl(lesson: TrainingLessonApi): string | undefined {
  for (const doc of lesson.documents ?? []) {
    const url = mediaEntryUrl(doc);
    if (url) {
      const absolute = resolveAbsoluteApiUrl(url);
      if (absolute) return absolute;
    }
  }
  for (const note of lesson.notes ?? []) {
    const url = mediaEntryUrl(note);
    if (url) {
      const absolute = resolveAbsoluteApiUrl(url);
      if (absolute) return absolute;
    }
  }
  return undefined;
}

function mapSectionCurriculumItems(section: {
  id?: string;
  lessons?: TrainingLessonApi[] | null;
  items?: TrainingLessonApi[] | null;
  assessment?: TrainingLessonApi['assessment'];
}): TrainingDetailView['sessions'][number]['items'] {
  const source =
    Array.isArray(section.items) && section.items.length > 0
      ? section.items
      : Array.isArray(section.lessons)
        ? section.lessons
        : [];

  const items: TrainingDetailView['sessions'][number]['items'] = [];

  source.forEach((lesson, index) => {
    const title = text(lesson.title);
    if (!title) return;

    const locked = Boolean(lesson.is_locked);
    const completed = Boolean(lesson.is_completed);
    const isPreview = Boolean(lesson.is_preview);
    const videoUrl = lessonPreviewVideoUrl(lesson);
    const fileUrl = lessonPreviewFileUrl(lesson);
    const examId =
      text(lesson.assessment?.id) || text(lesson.assessment_id) || undefined;

    const hasAssessment = Boolean(
      lesson.assessment?.id ||
        lesson.assessment_id ||
        lesson.assessment?.title ||
        (Array.isArray(lesson.assessment?.questions) &&
          lesson.assessment.questions.length > 0),
    );
    const type = normalizeCurriculumType(lesson.type, hasAssessment);

    // If API marks a content lesson AND nests assessment, show content then quiz.
    if (
      type !== 'quiz' &&
      hasAssessment &&
      (lesson.assessment?.title || lesson.assessment?.id)
    ) {
      items.push({
        id: lesson.id || `item-${index}`,
        type,
        title,
        meta: curriculumMetaFor(type, lesson),
        locked,
        completed,
        isPreview,
        videoUrl,
        fileUrl,
      });
      const quizTitle = text(lesson.assessment?.title, 'Quiz');
      const questionCount = Array.isArray(lesson.assessment?.questions)
        ? lesson.assessment.questions.length
        : 0;
      items.push({
        id: `${lesson.id || index}-quiz`,
        type: 'quiz',
        title: quizTitle,
        meta:
          questionCount > 0
            ? `${questionCount} question${questionCount === 1 ? '' : 's'}`
            : 'Quiz',
        locked,
        completed,
        isPreview,
        examId,
      });
      return;
    }

    const resolvedType = type === 'quiz' || hasAssessment ? 'quiz' : type;
    items.push({
      id: lesson.id || `item-${index}`,
      type: resolvedType,
      title:
        resolvedType === 'quiz'
          ? text(lesson.assessment?.title, title)
          : title,
      meta: curriculumMetaFor(resolvedType, lesson),
      locked,
      completed,
      isPreview,
      videoUrl,
      fileUrl,
      examId: resolvedType === 'quiz' ? examId : undefined,
    });
  });

  const sectionQuiz = section.assessment;
  if (sectionQuiz && (sectionQuiz.id || sectionQuiz.title)) {
    const questionCount = Array.isArray(sectionQuiz.questions)
      ? sectionQuiz.questions.length
      : 0;
    items.push({
      id: sectionQuiz.id || `section-quiz-${section.id ?? 'x'}`,
      type: 'quiz',
      title: text(sectionQuiz.title, 'Section quiz'),
      meta:
        questionCount > 0
          ? `${questionCount} question${questionCount === 1 ? '' : 's'}`
          : 'Quiz',
      locked: false,
      completed: false,
      examId: text(sectionQuiz.id) || undefined,
    });
  }

  return items;
}

const MODE_STYLES: Record<
  string,
  { badgeColor: string; badgeBg: string; sideBg: string; sideColor: string }
> = {
  instructor_led: {
    badgeColor: '#3c63c8',
    badgeBg: '#eaf1ff',
    sideBg: '#eaf1ff',
    sideColor: '#3c63c8',
  },
  self_paced: {
    badgeColor: '#8352c0',
    badgeBg: '#f2e9fb',
    sideBg: '#f2e9fb',
    sideColor: '#8352c0',
  },
  virtual: {
    badgeColor: '#8352c0',
    badgeBg: '#f2e9fb',
    sideBg: '#f2e9fb',
    sideColor: '#8352c0',
  },
  hybrid: {
    badgeColor: '#3c63c8',
    badgeBg: '#eaf1ff',
    sideBg: '#eaf1ff',
    sideColor: '#3c63c8',
  },
  in_person: {
    badgeColor: '#257d3f',
    badgeBg: '#e6f4e8',
    sideBg: '#e6f4e8',
    sideColor: '#257d3f',
  },
};

const DEFAULT_STYLE = {
  badgeColor: '#257d3f',
  badgeBg: '#e6f4e8',
  sideBg: '#e6f4e8',
  sideColor: '#257d3f',
};

function text(value: string | null | undefined, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function parseAmount(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  const num = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(num) ? num : null;
}

function parseCount(value: string | number | null | undefined): number | null {
  return parseAmount(value);
}

function sideLabel(duration: string, courseType: string): { top: string; bottom: string } {
  if (duration) {
    const parts = duration.split(/\s+/);
    if (parts.length >= 2) {
      return { top: parts.slice(1).join(' ').toUpperCase().slice(0, 6), bottom: parts[0] };
    }
    return { top: 'DUR', bottom: duration.slice(0, 4).toUpperCase() };
  }
  if (courseType) {
    return { top: 'TYPE', bottom: courseType.slice(0, 3).toUpperCase() };
  }
  return { top: 'TRN', bottom: '★' };
}

function formatDateLabel(value?: string | null): string {
  const raw = text(value);
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function mediaFileUrl(entry: TrainingContentMediaFileApi | null | undefined): string {
  if (typeof entry === 'string') return text(entry);
  if (entry && typeof entry === 'object') return text(entry.url);
  return '';
}

function mediaFileName(
  entry: TrainingContentMediaFileApi | null | undefined,
  fallback: string,
): string {
  if (entry && typeof entry === 'object') {
    const name = text(entry.name);
    if (name) return name;
  }
  return fallback;
}

/** Course notes from detail API: notes_pdf_url, notes[], notes_documents[]. */
function mapTrainingNotes(
  item: TrainingApiItem,
): TrainingDetailView['notes'] {
  const items: TrainingDetailView['notes'] = [];
  const seen = new Set<string>();

  const push = (rawUrl: string, title: string, id: string) => {
    const url = resolveAbsoluteApiUrl(rawUrl);
    if (!url || seen.has(url)) return;
    seen.add(url);
    items.push({ id, title, url });
  };

  const notesPdf = text(item.notes_pdf_url);
  if (notesPdf) {
    push(notesPdf, 'Course notes PDF', 'notes-pdf');
  }

  (item.notes ?? []).forEach((entry, index) => {
    push(mediaFileUrl(entry), mediaFileName(entry, `Note ${index + 1}`), `note-${index}`);
  });

  (item.notes_documents ?? []).forEach((entry, index) => {
    push(
      mediaFileUrl(entry),
      mediaFileName(entry, `Notes document ${index + 1}`),
      `notes-doc-${index}`,
    );
  });

  return items;
}

export function mapTrainingApiToListItem(item: TrainingApiItem): TrainingListItem {
  const modeKey = text(item.delivery_mode).toLowerCase().replace(/[\s-]+/g, '_');
  const style =
    MODE_STYLES[modeKey] ??
    (modeKey.includes('self') ? MODE_STYLES.self_paced : undefined) ??
    DEFAULT_STYLE;
  const priceAmount = parseAmount(item.price);
  const priceLabel =
    priceAmount == null || priceAmount <= 0
      ? 'Free'
      : formatMoney(priceAmount, item.currency);
  const paidBadge = priceLabel === 'Free' ? 'FREE' : 'PAID';
  const capacity = text(String(item.capacity ?? ''));
  const category = text(item.category, 'Training');
  const duration = text(item.duration);
  const courseType = text(item.course_type);
  const side = sideLabel(duration, courseType);
  const detailParts = [
    category,
    priceLabel,
    capacity ? `${capacity} seats` : null,
  ].filter(Boolean);

  const resolvedMode = resolveTrainingMode(modeKey, item);
  const modeBadge =
    resolvedMode === 'In-Person'
      ? 'PHYSICAL'
      : resolvedMode === 'Self-paced'
        ? 'SELF-PACED'
        : resolvedMode.toUpperCase();
  const averageRating = parseAmount(item.average_rating);
  const reviewCount = parseCount(item.reviews_count);

  return {
    id: String(item.id),
    badge: `${modeBadge} · ${paidBadge}`,
    badgeColor: style.badgeColor,
    badgeBg: style.badgeBg,
    when: duration || text(item.status, 'Open'),
    title: text(item.title, 'Untitled training'),
    detail: detailParts.join(' · '),
    sideTop: side.top,
    sideBottom: side.bottom,
    sideBg: style.sideBg,
    sideTopColor: style.sideColor,
    sideBottomColor: style.sideColor,
    mode: resolvedMode,
    priceLabel,
    status: text(item.status, 'published'),
    imageUrl: text(item.primary_image) || null,
    averageRating,
    reviewCount,
    isApiItem: true,
  };
}

function resolveTrainingMode(
  modeKey: string,
  item: TrainingApiItem,
): 'In-Person' | 'Virtual' | 'Hybrid' | 'Self-paced' {
  if (modeKey.includes('hybrid')) return 'Hybrid';
  if (
    modeKey.includes('in_person') ||
    modeKey.includes('physical') ||
    modeKey.includes('venue') ||
    modeKey.includes('offline')
  ) {
    return 'In-Person';
  }
  // Recorded / on-demand — not live Virtual
  if (
    modeKey.includes('self_paced') ||
    modeKey.includes('self_placed') ||
    modeKey.includes('on_demand') ||
    modeKey.includes('recorded')
  ) {
    return 'Self-paced';
  }
  if (
    modeKey.includes('virtual') ||
    modeKey.includes('online') ||
    modeKey.includes('remote') ||
    modeKey.includes('live')
  ) {
    return 'Virtual';
  }
  // instructor_led: venue/address → physical, meeting_link → virtual, else virtual
  if (modeKey.includes('instructor')) {
    const hasVenue = Boolean(text(item.venue) || text(item.address));
    const hasMeeting = Boolean(text(item.meeting_link));
    if (hasVenue && hasMeeting) return 'Hybrid';
    if (hasVenue) return 'In-Person';
    return 'Virtual';
  }
  return 'Virtual';
}

export function mapTrainingsApiToListItems(
  items: TrainingApiItem[] | null | undefined,
): TrainingListItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter(
      (item) =>
        Boolean(item?.id) &&
        item.is_deleted !== true &&
        String(item.status ?? '')
          .trim()
          .toLowerCase() === 'published',
    )
    .map(mapTrainingApiToListItem);
}

export function mapTrainingApiToDetailView(item: TrainingApiItem): TrainingDetailView {
  const list = mapTrainingApiToListItem(item);
  const capacityMax = parseCount(item.capacity);
  const enrolled = parseCount(item.enrolled_count);
  const availableFromApi = parseCount(item.available_slots);
  const available =
    availableFromApi != null
      ? availableFromApi
      : capacityMax != null && enrolled != null
        ? Math.max(capacityMax - enrolled, 0)
        : null;

  const trainerName =
    text(item.instructor?.name) ||
    text(item.instructor_name) ||
    text(item.enterprise_name, 'Trainer');
  const trainerBio =
    text(item.instructor?.bio) ||
    text(item.instructor_bio) ||
    (item.enterprise_name
      ? `Hosted by ${item.enterprise_name}`
      : 'Instructor details coming soon');

  const sessions =
    item.sections?.map((section, sectionIndex) => {
      const items = mapSectionCurriculumItems(section);
      const typeCounts = items.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.type] = (acc[entry.type] ?? 0) + 1;
        return acc;
      }, {});
      const metaParts = [
        typeCounts.topic
          ? `${typeCounts.topic} topic${typeCounts.topic === 1 ? '' : 's'}`
          : null,
        typeCounts.video
          ? `${typeCounts.video} video${typeCounts.video === 1 ? '' : 's'}`
          : null,
        typeCounts.live
          ? `${typeCounts.live} live`
          : null,
        typeCounts.venue
          ? `${typeCounts.venue} venue`
          : null,
        typeCounts.pdf
          ? `${typeCounts.pdf} PDF${typeCounts.pdf === 1 ? '' : 's'}`
          : null,
        typeCounts.notes
          ? `${typeCounts.notes} notes`
          : null,
        typeCounts.quiz
          ? `${typeCounts.quiz} quiz${typeCounts.quiz === 1 ? '' : 'zes'}`
          : null,
        typeCounts.assignment
          ? `${typeCounts.assignment} task${typeCounts.assignment === 1 ? '' : 's'}`
          : null,
      ].filter(Boolean);

      return {
        id: section.id || `section-${sectionIndex}`,
        name: text(section.title, `Section ${sectionIndex + 1}`),
        when:
          text(section.schedule) ||
          (metaParts.length > 0
            ? metaParts.join(' · ')
            : text(item.duration, 'Curriculum section')),
        duration:
          metaParts.length > 0
            ? metaParts.join(' · ')
            : text(item.duration, '—'),
        status: text(item.status, 'Open'),
        concepts: items.map((entry) => entry.title),
        items,
      };
    }) ?? [];

  const materials =
    item.documents?.map((doc, index) => ({
      id: text(doc.id, `doc-${index}`),
      title: text(doc.title || doc.name, `Document ${index + 1}`),
      type: text(doc.type, 'File'),
      size: text(doc.size, '—'),
      visible: text(doc.visibility, 'Enrolled'),
      url: text(doc.url),
      downloadable: Boolean(doc.downloadable ?? doc.url),
    })) ?? [];

  const downloadableLessons =
    item.sections?.flatMap((section) =>
      (section.lessons ?? [])
        .filter((lesson) => lesson.is_downloadable)
        .map((lesson, index) => ({
          id: lesson.id || `dl-${section.id}-${index}`,
          title: text(lesson.title, 'Downloadable lesson'),
          size: text(lesson.file_size, '—'),
          downloadable: true,
        })),
    ) ?? [];

  const instructorNotes =
    item.instructor_notes?.map((note, index) => ({
      id: text(note.id, `note-${index}`),
      title: text(note.title, `Instructor note ${index + 1}`),
      url: text(note.url),
    })) ?? [];

  const reviews =
    item.reviews?.map((review, index) => ({
      id: text(review.id, `review-${index}`),
      author: text(review.author, 'Learner'),
      rating: parseAmount(review.rating) ?? 0,
      comment: text(review.comment),
      date: formatDateLabel(review.created_at) || 'Recently',
      verified: Boolean(review.verified),
    })) ?? [];

  const startDate =
    formatDateLabel(item.start_date) || formatDateLabel(item.enrolment_start);
  const endDate = formatDateLabel(item.end_date);
  const enrolmentDeadline = formatDateLabel(item.enrolment_end);
  const averageRating = parseAmount(item.average_rating);
  const reviewCount =
    parseCount(item.reviews_count) ??
    parseCount(item.review_count) ??
    reviews.length;
  const detailPriceAmount = parseAmount(item.price);
  const detailPriceLabel =
    detailPriceAmount == null || detailPriceAmount <= 0
      ? 'Free'
      : formatMoney(detailPriceAmount, item.currency);

  return {
    id: list.id,
    title: list.title,
    description: text(item.description, 'No description available yet.'),
    category: text(item.category, 'Training'),
    subcategory: text(item.subcategory),
    courseType: text(item.course_type, 'Course'),
    tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
    status: list.status,
    badge: list.badge,
    badgeColor: list.badgeColor,
    badgeBg: list.badgeBg,
    sideBg: list.sideBg,
    sideTopColor: list.sideTopColor,
    sideBottomColor: list.sideBottomColor,
    sideTop: list.sideTop,
    sideBottom: list.sideBottom,
    imageUrl: list.imageUrl ?? null,
    duration: text(item.duration, 'Duration TBD'),
    timezone: text(item.time_zone, '—'),
    startDate: startDate || 'Start date TBD',
    endDate: endDate || 'End date TBD',
    startTime: text(item.start_time),
    endTime: text(item.end_time),
    recurring: text(item.recurring),
    exceptions: text(item.schedule_exceptions),
    deliveryMode: resolveTrainingMode(
      text(item.delivery_mode).toLowerCase(),
      item,
    ),
    deliveryInstructions: text(item.delivery_instructions),
    accessInfo: text(item.access_information),
    meetingProvider: text(item.meeting_provider),
    meetingLink: text(item.meeting_link),
    venue: text(item.venue),
    address: text(item.address),
    // Detail shows list `price`, not `promo_price`.
    priceLabel: detailPriceLabel,
    priceType:
      detailPriceAmount == null || detailPriceAmount <= 0 ? 'Free' : 'Paid',
    discountLabel: text(item.coupon_code)
      ? `Code ${text(item.coupon_code)}`
      : parseAmount(item.promo_price) != null
        ? 'Promo price applied'
        : '',
    capacityMax: capacityMax != null ? String(capacityMax) : '—',
    enrolled: enrolled != null ? String(enrolled) : '—',
    available: available != null ? String(available) : '—',
    enrolmentDeadline: enrolmentDeadline || 'Open enrollment',
    registrationStatus: text(item.status, 'Open'),
    requiresApproval: Boolean(item.requires_approval),
    prerequisites: text(item.requirements, 'No prerequisites listed'),
    objectives: Array.isArray(item.learning_objectives)
      ? item.learning_objectives.filter(Boolean)
      : [],
    enterpriseName: text(item.enterprise_name, 'Business'),
    enterpriseId: text(item.enterprise_id),
    trainerName,
    trainerBio,
    trainerRole: text(item.instructor?.role, 'Trainer'),
    sessions,
    materials,
    targetAudience: text(item.target_audience, 'General learners'),
    difficulty: text(
      item.difficulty_level || item.level,
      'All levels',
    ),
    language: text(item.language, 'English'),
    averageRating,
    reviewCount,
    offlineEnabled: Boolean(
      item.offline_enabled ?? item.offline_access_enabled,
    ),
    notesPdfAvailable: Boolean(item.notes_pdf_url),
    reviews,
    downloadableLessons,
    instructorNotes,
    notes: mapTrainingNotes(item),
  };
}
