export type TrainingPagination = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type TrainingLessonApi = {
  id: string;
  type?: string | null;
  title?: string | null;
  duration?: string | null;
  is_preview?: boolean | null;
  is_downloadable?: boolean | null;
  is_locked?: boolean | null;
  is_completed?: boolean | null;
  file_size?: string | null;
  video_url?: string | null;
  videos?: string[] | null;
  content_url?: string | null;
  documents?: TrainingContentMediaFileApi[] | null;
  notes?: TrainingContentMediaFileApi[] | null;
  topics?: { id: string; title?: string | null }[] | null;
  assessment_id?: string | null;
  assessment?: {
    id?: string;
    type?: string | null;
    title?: string | null;
    questions?:
      | {
          id?: string;
          question_text?: string | null;
          question_type?: string | null;
        }[]
      | null;
  } | null;
};

export type TrainingCurriculumItemType =
  | 'topic'
  | 'video'
  | 'youtube'
  | 'live'
  | 'venue'
  | 'pdf'
  | 'notes'
  | 'quiz'
  | 'assignment';

export type TrainingSectionApi = {
  id: string;
  type?: string | null;
  order?: number | null;
  title?: string | null;
  lessons?: TrainingLessonApi[] | null;
  /** Preferred ordered curriculum list (same shape as lessons). */
  items?: TrainingLessonApi[] | null;
  schedule?: string | null;
  instructor_id?: string | null;
  assessment?: TrainingLessonApi['assessment'];
};

export type TrainingDocumentApi = {
  id?: string;
  title?: string | null;
  name?: string | null;
  type?: string | null;
  size?: string | null;
  url?: string | null;
  visibility?: string | null;
  downloadable?: boolean | null;
};

export type TrainingApiItem = {
  id: string;
  tenant_id?: string | null;
  enterprise_id?: string | null;
  enterprise_name?: string | null;
  location_id?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  category?: string | null;
  subcategory?: string | null;
  tags?: string[] | null;
  instructor_id?: string | null;
  instructor_name?: string | null;
  instructor_bio?: string | null;
  instructor_photo?: string | null;
  instructor_credentials?: string | null;
  instructor?: {
    id?: string | null;
    name?: string | null;
    bio?: string | null;
    role?: string | null;
    photo?: string | null;
    credentials?: string | null;
  } | null;
  delivery_mode?: string | null;
  delivery_instructions?: string | null;
  access_information?: string | null;
  meeting_link?: string | null;
  meeting_provider?: string | null;
  meeting_platform?: string | null;
  meeting_id?: string | null;
  meeting_passcode?: string | null;
  venue?: string | null;
  address?: string | null;
  course_type?: string | null;
  capacity?: string | number | null;
  enrolled_count?: string | number | null;
  /** Alias used by list/detail payloads when `enrolled_count` is absent. */
  current_participants?: string | number | null;
  available_slots?: string | number | null;
  waitlist_count?: string | number | null;
  price?: string | number | null;
  currency?: string | null;
  status?: string | null;
  is_deleted?: boolean | null;
  primary_image?: string | null;
  gallery_images?: string[] | null;
  promotional_video?: string | null;
  documents?: TrainingDocumentApi[] | null;
  duration?: string | null;
  time_zone?: string | null;
  enrolment_start?: string | null;
  enrolment_end?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  recurring?: string | null;
  schedule_exceptions?: string | null;
  promo_price?: string | number | null;
  coupon_code?: string | null;
  access_duration_days?: string | number | null;
  access_expiry_days?: string | number | null;
  requirements?: string | null;
  faqs?: {
    question?: string | null;
    answer?: string | null;
  }[] | null;
  learning_objectives?: string[] | null;
  requires_approval?: boolean | null;
  target_audience?: string | null;
  difficulty_level?: string | null;
  /** Alias used by list/detail payloads (`beginner`, etc.). */
  level?: string | null;
  language?: string | null;
  average_rating?: string | number | null;
  review_count?: string | number | null;
  reviews_count?: string | number | null;
  /** Signed-in viewer enrolment on GET /trainings/{id} */
  is_enrolled?: boolean | string | null;
  enrolment_status?: string | null;
  rejection_reason?: string | null;
  offline_enabled?: boolean | null;
  offline_access_enabled?: boolean | null;
  notes_pdf_url?: string | null;
  /** Course notes files from detail API. */
  notes?: TrainingContentMediaFileApi[] | null;
  notes_documents?: TrainingContentMediaFileApi[] | null;
  reviews?: {
    id?: string;
    author?: string | null;
    participant_name?: string | null;
    participant_email?: string | null;
    rating?: string | number | null;
    comment?: string | null;
    created_at?: string | null;
    verified?: boolean | null;
  }[] | null;
  instructor_notes?: {
    id?: string;
    title?: string | null;
    url?: string | null;
  }[] | null;
  sections?: TrainingSectionApi[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TrainingEnrollmentBody = {
  promo_code?: string | null;
  coupon_code?: string | null;
  payment_method_id?: string | null;
  form_configuration_version_id?: string | null;
  custom_values?: Record<string, unknown> | null;
  participant_email?: string | null;
  participant_name?: string | null;
};

/** POST …/enroll 201 response (live API shape). */
export type TrainingEnrollmentResult = {
  id: string;
  training_id: string;
  status: string;
  participant_email?: string | null;
  participant_name?: string | null;
  group_enrol?: boolean;
  coupon_code?: string | null;
  access_expires_at?: string | null;
  created_at?: string | null;
  /** Legacy / optional aliases */
  enrollment_code?: string | null;
  enrolled_at?: string | null;
  message?: string | null;
};

/** GET/POST /api/v1/trainings/{id}/discussions */
export type TrainingDiscussionApiItem = {
  id: string;
  author?: string | null;
  question?: string | null;
  /** Reply body from POST …/replies (API field name). */
  answer?: string | null;
  /** Optional alias some payloads may send instead of `answer`. */
  reply?: string | null;
  created_at?: string | null;
};

/** GET /api/v1/trainings/{id}/announcements */
export type TrainingAnnouncementApiItem = {
  id: string;
  title?: string | null;
  author?: string | null;
  channel?: string | null;
  message?: string | null;
  sent_at?: string | null;
  training_id?: string | null;
};

export type TrainingDiscussionCreateBody = {
  question: string;
  /** Alias some backends accept alongside `question`. */
  text?: string;
};

export type TrainingDiscussionReplyBody = {
  answer: string;
};

/** POST/GET wishlist item from /trainings/.../wishlist */
export type TrainingWishlistApiItem = {
  id: string;
  training_id: string;
  title?: string | null;
  primary_image?: string | null;
  price?: string | number | null;
  currency?: string | null;
  average_rating?: string | number | null;
  reviews_count?: string | number | null;
  added_at?: string | null;
  /** Optional — ask backend if missing */
  delivery_mode?: string | null;
  enterprise_name?: string | null;
  duration?: string | null;
  status?: string | null;
};

/** GET/POST /api/v1/trainings/{id}/reviews */
export type TrainingReviewApiItem = {
  id: string;
  training_id: string;
  rating: number;
  comment?: string | null;
  participant_email?: string | null;
  participant_name?: string | null;
  verified?: boolean | null;
  created_at?: string | null;
};

export type TrainingReviewsApiResponse = {
  reviews: TrainingReviewApiItem[];
  average_rating: number;
  count: number;
};

export type TrainingReviewCreateBody = {
  rating: number;
  comment: string;
  participant_email: string;
  participant_name?: string | null;
};

export type TrainingReviewView = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
};

/** GET /api/v1/trainings/my/enrolments item (shape may vary slightly). */
export type TrainingEnrolmentApiItem = {
  id?: string;
  enrol_id?: string;
  enrollment_id?: string;
  enrolment_id?: string;
  training_id?: string;
  status?: string | null;
  enrollment_code?: string | null;
  qr_code?: string | null;
  enrolled_at?: string | null;
  created_at?: string | null;
  title?: string | null;
  primary_image?: string | null;
  enterprise_name?: string | null;
  delivery_mode?: string | null;
  price?: string | number | null;
  currency?: string | null;
  duration?: string | null;
  progress_percent?: string | number | null;
  completed_lessons?: string | number | null;
  total_lessons?: string | number | null;
  training?: {
    id?: string;
    title?: string | null;
    primary_image?: string | null;
    delivery_mode?: string | null;
  } | null;
};

export type TrainingsListApiResponse = {
  items: TrainingApiItem[];
  pagination: TrainingPagination;
};

export type TrainingListQuery = {
  search?: string;
  category?: string;
  provider?: string;
  tenant_id?: string;
  enterprise_id?: string;
  location_id?: string;
  status?: string;
  delivery_mode?: string;
  min_price?: string;
  max_price?: string;
  duration?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
};

export type TrainingListResult = {
  items: TrainingApiItem[];
  pagination: TrainingPagination;
};

/** GET /api/v1/trainings/{id}/content */
/** Content API may send plain URL strings or { url, name, ... } objects. */
export type TrainingContentMediaFileApi =
  | string
  | {
      id?: string | null;
      url?: string | null;
      name?: string | null;
      title?: string | null;
      type?: string | null;
      size?: string | number | null;
      file_size?: string | number | null;
      visibility?: string | null;
      downloadable?: boolean | null;
    };

export type TrainingContentLessonApi = {
  id: string;
  type?: string | null;
  title?: string | null;
  duration?: string | null;
  detail?: string | null;
  thumbnail_url?: string | null;
  content_url?: string | null;
  content?: string | null;
  video_url?: string | null;
  videos?: string[] | null;
  documents?: TrainingContentMediaFileApi[] | null;
  notes?: TrainingContentMediaFileApi[] | null;
  is_preview?: boolean | null;
  is_mandatory?: boolean | null;
  is_downloadable?: boolean | null;
  is_locked?: boolean | null;
  is_completed?: boolean | null;
  completed_at?: string | null;
  /** Resume watch position (seconds) from progress tracking */
  progress_seconds?: number | string | null;
  position_seconds?: number | string | null;
  duration_seconds?: number | string | null;
  last_accessed_at?: string | null;
  meeting_link?: string | null;
  join_meta?: string | null;
  venue?: string | null;
  address?: string | null;
  pass_code?: string | null;
  check_in_window?: string | null;
  /** Optional live/venue schedule fields */
  schedule?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  scheduled_at?: string | null;
  /** Lesson-wise live/venue attendance from content API */
  is_attended?: boolean | null;
  attended_at?: string | null;
  qr_code?: string | null;
  qr_image_base64?: string | null;
  assessment?: TrainingContentAssessmentApi | null;
  assessment_id?: string | null;
};

export type TrainingContentAssessmentQuestionApi = {
  id: string;
  points?: number | null;
  options?:
    | { id?: string; label?: string | null }[]
    | string[]
    | null;
  question_text?: string | null;
  question_type?: string | null;
  correct_option_id?: string | null;
  correct_answer?: string | null;
};

export type TrainingContentAssessmentApi = {
  id: string;
  type?: string | null;
  title?: string | null;
  pass_percent?: number | null;
  is_submitted?: boolean | null;
  score_percent?: number | null;
  passed?: boolean | null;
  questions?: TrainingContentAssessmentQuestionApi[] | null;
};

export type TrainingContentSectionApi = {
  id: string;
  type?: string | null;
  order?: number | null;
  title?: string | null;
  summary?: string | null;
  schedule?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  scheduled_at?: string | null;
  is_unlocked?: boolean | null;
  unlock_hint?: string | null;
  meeting_link?: string | null;
  venue?: string | null;
  address?: string | null;
  /** Live / venue session attendance from content API */
  is_attended?: boolean | null;
  attended_at?: string | null;
  qr_code?: string | null;
  /** Data-URI or raw base64 PNG for venue / session check-in QR */
  qr_image_base64?: string | null;
  lessons?: TrainingContentLessonApi[] | null;
  items?: TrainingContentLessonApi[] | null;
  assessment?: TrainingContentAssessmentApi | null;
  assessments?: TrainingContentAssessmentApi[] | null;
};

export type TrainingContentApiResponse = {
  training_id: string;
  title?: string | null;
  primary_image?: string | null;
  enterprise_name?: string | null;
  instructor_name?: string | null;
  delivery_mode?: string | null;
  progress_percent?: number | null;
  completed_lessons?: number | null;
  total_lessons?: number | null;
  completed_items?: number | null;
  total_items?: number | null;
  total_required_items?: number | null;
  completed_required_items?: number | null;
  /** Resume targets from progress tracking */
  resume_section_id?: string | null;
  resume_lesson_id?: string | null;
  resume_lesson?: string | null;
  qr_code?: string | null;
  /** Optional training-level QR image (same shape as section `qr_image_base64`). */
  qr_image_base64?: string | null;
  sections?: TrainingContentSectionApi[] | null;
  /** Course-level auto notes PDF (outside sections). */
  notes_pdf_url?: string | null;
  /** Course-level documents (outside sections). */
  documents?: TrainingContentMediaFileApi[] | null;
  /** Course-level notes files (outside sections). */
  notes?: TrainingContentMediaFileApi[] | null;
  assessments?: TrainingContentAssessmentApi[] | null;
  assignments?: unknown[] | null;
};

export type TrainingAssessmentDetailQuestionApi = {
  id: string;
  question_text?: string | null;
  question_type?: string | null;
  options?:
    | string[]
    | { id?: string; label?: string | null }[]
    | null;
  correct_answer?: string | null;
  points?: number | null;
  explanation?: string | null;
};

/** GET /api/v1/trainings/{training_id}/assignments */
export type TrainingAssignmentListItemApi = {
  id: string;
  title?: string | null;
  type?: string | null;
  instructions?: string | null;
  due_date?: string | null;
  max_score?: number | string | null;
  accepted_file_types?: string[] | null;
  allow_late_submissions?: boolean | null;
  description?: string | null;
  attempts_made?: number | null;
  lesson_id?: string | null;
  module_id?: string | null;
  section_id?: string | null;
  pass_percent?: number | string | null;
  passing_score?: number | string | null;
  attempts_allowed?: number | string | null;
  time_limit_minutes?: number | string | null;
  is_published?: boolean | null;
  questions?: unknown[] | null;
};

/** GET /api/v1/trainings/{training_id}/assessments/{aid} */
export type TrainingAssessmentDetailApi = {
  id: string;
  title?: string | null;
  module_id?: string | null;
  pass_percentage?: number | null;
  pass_percent?: number | null;
  max_attempts?: number | null;
  time_limit_minutes?: number | null;
  publication?: string | null;
  questions?: TrainingAssessmentDetailQuestionApi[] | null;
};

export type TrainingAssessmentSubmitAnswer = {
  question_id: string;
  /** Always a string — multi-select joined as "2,3". */
  answer: string;
};

export type TrainingAssessmentSubmitRequest = {
  answers: TrainingAssessmentSubmitAnswer[];
  started_at?: string | null;
};

export type TrainingAssessmentSubmitResponse = {
  assessment_id?: string;
  submission_id?: string | null;
  /** Points earned (new submit response). */
  score?: number | null;
  /** Legacy / alternate percent field. */
  score_percent?: number | null;
  total_points?: number | null;
  passed?: boolean | null;
  feedback?: string | null;
  publication?: string | null;
  needs_manual?: boolean | null;
  attempts_made?: number | null;
  attempts_allowed?: number | null;
  is_submitted?: boolean | null;
  [key: string]: unknown;
};

/** POST /api/v1/trainings/{training_id}/progress/complete-lesson */
export type TrainingCompleteLessonRequest = {
  lesson_id: string;
};

/** Response from complete-lesson (Swagger). */
export type TrainingCompleteLessonResponse = {
  lesson_id: string;
  lessons_done: number;
  mandatory_done: number;
  mandatory_total: number;
  overall_percent: number;
  resume_lesson: string;
  total_lessons: number;
  completed_at?: string | null;
  certificate_url?: string | null;
};

/** POST /api/v1/trainings/{training_id}/lessons/{lesson_id}/progress */
export type TrainingLessonProgressSaveRequest = {
  position_seconds: number;
  duration_seconds?: number;
  section_id?: string;
};

export type TrainingLessonProgressSaveResponse = {
  message?: string;
  data?: {
    training_id?: string;
    section_id?: string | null;
    lesson_id?: string;
    position_seconds?: number;
    duration_seconds?: number | null;
    progress_percent?: number | null;
    is_completed?: boolean;
    last_accessed_at?: string | null;
  };
  training_id?: string;
  section_id?: string | null;
  lesson_id?: string;
  position_seconds?: number;
  duration_seconds?: number | null;
  progress_percent?: number | null;
  is_completed?: boolean;
  last_accessed_at?: string | null;
};

/** GET /api/v1/trainings/{training_id}/progress */
export type TrainingProgressLessonApi = {
  lesson_id: string;
  section_id?: string | null;
  position_seconds?: number | string | null;
  duration_seconds?: number | string | null;
  is_completed?: boolean | null;
  last_accessed_at?: string | null;
};

export type TrainingProgressApiResponse = {
  training_id: string;
  progress_percent?: number | string | null;
  completed_lessons?: number | string | null;
  total_lessons?: number | string | null;
  resume_section_id?: string | null;
  resume_lesson_id?: string | null;
  resume_lesson?: string | null;
  lessons?: TrainingProgressLessonApi[] | null;
};

/** GET /api/v1/trainings/{training_id}/certificate — 404 until eligible. */
export type TrainingCertificateApi = {
  training_id: string;
  participant_email?: string | null;
  certificate_url?: string | null;
  completed_at?: string | null;
  overall_percent?: string | number | null;
};

export type TrainingDetailView = {
  id: string;
  title: string;
  /** Enterprise `subtitle` — shown under the title when present. */
  subtitle: string;
  description: string;
  category: string;
  subcategory: string;
  courseType: string;
  tags: string[];
  status: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  sideBg: string;
  sideTopColor: string;
  sideBottomColor: string;
  sideTop: string;
  sideBottom: string;
  imageUrl: string | null;
  duration: string;
  timezone: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  recurring: string;
  exceptions: string;
  deliveryMode: string;
  deliveryInstructions: string;
  accessInfo: string;
  meetingProvider: string;
  meetingLink: string;
  meetingId: string;
  meetingPasscode: string;
  venue: string;
  address: string;
  priceLabel: string;
  priceType: string;
  promoPriceLabel: string;
  couponCode: string;
  discountLabel: string;
  capacityMax: string;
  enrolled: string;
  available: string;
  enrolmentDeadline: string;
  /** Enrolment window / capacity gate for detail CTA. */
  enrolmentGate: 'open' | 'not_yet_open' | 'closed' | 'full';
  enrolmentGateMessage: string;
  enrolmentOpensLabel: string;
  registrationStatus: string;
  requiresApproval: boolean;
  prerequisites: string;
  faqs: {
    id: string;
    question: string;
    answer: string;
  }[];
  objectives: string[];
  enterpriseName: string;
  enterpriseId: string;
  trainerName: string;
  trainerBio: string;
  trainerRole: string;
  trainerPhoto: string;
  trainerCredentials: string;
  sessions: {
    id: string;
    name: string;
    when: string;
    duration: string;
    status: string;
    concepts: string[];
    items: {
      id: string;
      type: TrainingCurriculumItemType;
      title: string;
      meta: string;
      locked?: boolean;
      completed?: boolean;
      /** Free preview lesson (self-paced detail unlock). */
      isPreview?: boolean;
      videoUrl?: string;
      fileUrl?: string;
      /** Assessment id for quiz items (opens training-exam). */
      examId?: string;
    }[];
  }[];
  materials: {
    id: string;
    title: string;
    type: string;
    size: string;
    visible: string;
    url: string;
    downloadable: boolean;
  }[];
  targetAudience: string;
  difficulty: string;
  language: string;
  accessDuration: string;
  accessExpiry: string;
  averageRating: number | null;
  reviewCount: number;
  offlineEnabled: boolean;
  notesPdfAvailable: boolean;
  reviews: {
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
  }[];
  downloadableLessons: {
    id: string;
    title: string;
    size: string;
    downloadable: boolean;
  }[];
  instructorNotes: {
    id: string;
    title: string;
    url: string;
  }[];
  /** Course notes from API (`notes`, `notes_pdf_url`, `notes_documents`). */
  notes: {
    id: string;
    title: string;
    url: string;
    /** Human-readable size when API sends `size` / `file_size`. */
    sizeLabel?: string;
  }[];
  /** Viewer enrolment from GET /trainings/{id} (`is_enrolled`, `enrolment_status`). */
  hasViewerEnrolment: boolean;
  isEnrolled: boolean;
  canContinueLearning: boolean;
  isPendingApproval: boolean;
  enrolmentStatus: string | null;
  rejectionReason: string;
};
