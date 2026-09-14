import type { TrainingListItem } from '@/components/market/marketTrainingData';
import type {
  TrainingApiItem,
  TrainingDetailView,
} from '@/types/training.types';
import { formatMoney } from '@/utils/currency';

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

function formatDeliveryMode(mode: string): string {
  return mode
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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

export function mapTrainingApiToListItem(item: TrainingApiItem): TrainingListItem {
  const modeKey = text(item.delivery_mode).toLowerCase();
  const style = MODE_STYLES[modeKey] ?? DEFAULT_STYLE;
  const priceAmount = parseAmount(item.promo_price) ?? parseAmount(item.price);
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

  return {
    id: String(item.id),
    badge: `${resolvedMode === 'In-Person' ? 'PHYSICAL' : resolvedMode.toUpperCase()} · ${paidBadge}`,
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
    isApiItem: true,
  };
}

function resolveTrainingMode(
  modeKey: string,
  item: TrainingApiItem,
): 'In-Person' | 'Virtual' | 'Hybrid' {
  if (modeKey.includes('hybrid')) return 'Hybrid';
  if (
    modeKey.includes('in_person') ||
    modeKey.includes('in-person') ||
    modeKey.includes('physical') ||
    modeKey.includes('venue') ||
    modeKey.includes('offline')
  ) {
    return 'In-Person';
  }
  if (
    modeKey.includes('virtual') ||
    modeKey.includes('online') ||
    modeKey.includes('self_paced') ||
    modeKey.includes('remote')
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
      const lessons = Array.isArray(section.lessons) ? section.lessons : [];
      const lessonTitles = lessons
        .map((lesson) => text(lesson.title))
        .filter(Boolean);
      return {
        id: section.id || `section-${sectionIndex}`,
        name: text(section.title, `Section ${sectionIndex + 1}`),
        when:
          text(section.schedule) ||
          (lessonTitles.length > 0
            ? `${lessonTitles.length} lesson${lessonTitles.length === 1 ? '' : 's'}`
            : text(item.duration, 'Curriculum section')),
        duration:
          lessonTitles.length > 0
            ? `${lessonTitles.length} lesson${lessonTitles.length === 1 ? '' : 's'}`
            : text(item.duration, '—'),
        status: text(item.status, 'Open'),
        concepts: lessonTitles,
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
    deliveryMode: formatDeliveryMode(text(item.delivery_mode, 'training')),
    deliveryInstructions: text(item.delivery_instructions),
    accessInfo: text(item.access_information),
    meetingProvider: text(item.meeting_provider),
    meetingLink: text(item.meeting_link),
    venue: text(item.venue, text(item.enterprise_name, 'Online')),
    address: text(item.address),
    priceLabel: list.priceLabel,
    priceType: list.priceLabel === 'Free' ? 'Free' : 'Paid',
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
  };
}
