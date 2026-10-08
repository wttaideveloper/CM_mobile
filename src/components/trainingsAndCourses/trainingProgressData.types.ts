export type McqOption = {
  id: string;
  label: string;
};

export type McqQuestionType =
  | 'single_choice'
  | 'multiple_select'
  | 'true_false'
  | 'short_answer'
  | 'essay';

export type McqQuestion = {
  id: string;
  prompt: string;
  options: McqOption[];
  /** Present for static/demo exams; API quizzes are scored server-side. */
  correctOptionId?: string;
  questionType?: McqQuestionType;
};

export type TrainingExam = {
  id: string;
  title: string;
  subtitle: string;
  questionCount: number;
  passPercent: number;
  questions: McqQuestion[];
};

export type LessonKind =
  | 'video'
  | 'youtube'
  | 'live'
  | 'venue'
  | 'exam'
  | 'text'
  | 'document';

export type TrainingLesson = {
  id: string;
  kind: LessonKind;
  title: string;
  duration: string;
  /** Short description under the row */
  detail: string;
  /** Thumbnail / cover for the lesson */
  imageUrl?: string;
  /** Video lessons */
  videoUrl?: string;
  /** Text / topic body from content API */
  bodyText?: string;
  /** PDF, notes, and other file URLs */
  documentUrls?: string[];
  /** Original file name from API (for open/share dialogs) */
  documentFileName?: string;
  isDownloadable?: boolean;
  /** Section id from content API (for lesson download endpoint). */
  sectionId?: string;
  /** Live Zoom / Meet */
  joinUrl?: string;
  joinMeta?: string;
  /** Physical venue / QR check-in */
  venue?: string;
  address?: string;
  passCode?: string;
  /** Lesson or inherited section QR image (`qr_image_base64`) */
  qrImageBase64?: string;
  checkInWindow?: string;
  /** Exam lessons */
  examId?: string;
  /** From content API */
  locked?: boolean;
  apiCompleted?: boolean;
  /** Resume position in seconds (from content/progress API) */
  progressSeconds?: number;
  durationSeconds?: number;
  /** Lesson-wise live/venue attendance from content API */
  isAttended?: boolean;
  attendedAt?: string;
  /**
   * Live / venue session start (ISO or parseable datetime).
   * Used to block open/join before the scheduled time.
   */
  startsAt?: string;
};

export type TrainingDay = {
  id: string;
  dayLabel: string;
  title: string;
  summary: string;
  /** Shown when all content lessons in this day are done */
  unlockHint: string;
  /** Section type from content API (`live`, `venue`, …) */
  sectionType?: string;
  /** Live online meeting URL from the section */
  meetingLink?: string;
  /** Session schedule string from the section */
  schedule?: string;
  venue?: string;
  address?: string;
  /** Training-level or section check-in / QR pass code */
  passCode?: string;
  /** Section `qr_image_base64` from content API (data URI or raw base64) */
  qrImageBase64?: string;
  /** From content API section `is_attended` (live/venue join recorded) */
  isAttended?: boolean;
  attendedAt?: string;
  lessons: TrainingLesson[];
};

export type TrainingDeliveryMode =
  | 'Virtual'
  | 'Hybrid'
  | 'Physical'
  | 'Self-paced';

export type TrainingProgressPath = {
  trainingId: string;
  title: string;
  vendor: string;
  instructor: string;
  bannerUrl: string;
  deliveryMode: TrainingDeliveryMode;
  days: TrainingDay[];
  exams: Record<string, TrainingExam>;
  /** Course-level notes / docs from content API (outside sections). */
  courseNotes: {
    id: string;
    title: string;
    url: string;
    kind: 'notes_pdf' | 'note' | 'document';
    sizeLabel?: string;
  }[];
  /** Resume targets from content/progress API */
  resumeSectionId?: string;
  resumeLessonId?: string;
};

