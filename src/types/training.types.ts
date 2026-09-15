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
  file_size?: string | null;
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

export type TrainingSectionApi = {
  id: string;
  type?: string | null;
  order?: number | null;
  title?: string | null;
  lessons?: TrainingLessonApi[] | null;
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
  description?: string | null;
  category?: string | null;
  subcategory?: string | null;
  tags?: string[] | null;
  instructor_id?: string | null;
  instructor_name?: string | null;
  instructor_bio?: string | null;
  instructor?: {
    id?: string | null;
    name?: string | null;
    bio?: string | null;
    role?: string | null;
  } | null;
  delivery_mode?: string | null;
  delivery_instructions?: string | null;
  access_information?: string | null;
  meeting_link?: string | null;
  meeting_provider?: string | null;
  venue?: string | null;
  address?: string | null;
  course_type?: string | null;
  capacity?: string | number | null;
  enrolled_count?: string | number | null;
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
  requirements?: string | null;
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
  offline_enabled?: boolean | null;
  offline_access_enabled?: boolean | null;
  notes_pdf_url?: string | null;
  reviews?: {
    id?: string;
    author?: string | null;
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
export type TrainingContentLessonApi = {
  id: string;
  type?: string | null;
  title?: string | null;
  duration?: string | null;
  detail?: string | null;
  thumbnail_url?: string | null;
  content_url?: string | null;
  video_url?: string | null;
  is_preview?: boolean | null;
  is_mandatory?: boolean | null;
  is_downloadable?: boolean | null;
  is_locked?: boolean | null;
  is_completed?: boolean | null;
  completed_at?: string | null;
  meeting_link?: string | null;
  join_meta?: string | null;
  venue?: string | null;
  address?: string | null;
  pass_code?: string | null;
  check_in_window?: string | null;
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
  is_unlocked?: boolean | null;
  unlock_hint?: string | null;
  lessons?: TrainingContentLessonApi[] | null;
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
  qr_code?: string | null;
  sections?: TrainingContentSectionApi[] | null;
};

export type TrainingDetailView = {
  id: string;
  title: string;
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
  venue: string;
  address: string;
  priceLabel: string;
  priceType: string;
  discountLabel: string;
  capacityMax: string;
  enrolled: string;
  available: string;
  enrolmentDeadline: string;
  registrationStatus: string;
  requiresApproval: boolean;
  prerequisites: string;
  objectives: string[];
  enterpriseName: string;
  enterpriseId: string;
  trainerName: string;
  trainerBio: string;
  trainerRole: string;
  sessions: {
    id: string;
    name: string;
    when: string;
    duration: string;
    status: string;
    concepts: string[];
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
};
