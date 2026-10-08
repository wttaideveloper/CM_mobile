import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import type { ApiError } from '@/types/api.types';
import type {
  TrainingApiItem,
  TrainingAssessmentDetailApi,
  TrainingAssessmentSubmitRequest,
  TrainingAssessmentSubmitResponse,
  TrainingAssignmentListItemApi,
  TrainingCompleteLessonRequest,
  TrainingCompleteLessonResponse,
  TrainingLessonProgressSaveRequest,
  TrainingLessonProgressSaveResponse,
  TrainingProgressApiResponse,
  TrainingCertificateApi,
  TrainingContentApiResponse,
  TrainingDetailView,
  TrainingAnnouncementApiItem,
  TrainingDiscussionApiItem,
  TrainingDiscussionCreateBody,
  TrainingDiscussionReplyBody,
  TrainingEnrolmentApiItem,
  TrainingEnrollmentBody,
  TrainingEnrollmentResult,
  TrainingListQuery,
  TrainingListResult,
  TrainingReviewCreateBody,
  TrainingReviewApiItem,
  TrainingReviewsApiResponse,
  TrainingWishlistApiItem,
  TrainingsListApiResponse,
} from '@/types/training.types';
import { mapTrainingApiToDetailView } from '@/utils/training.mapper';
import { mapTrainingReviewsResponse } from '@/utils/trainingReviews.mapper';
import { asPlainText } from '@/utils/trainingLessonMedia';
import { normalizeTrainingDiscussion, normalizeTrainingDiscussions } from '@/utils/trainingDiscussions.mapper';

function buildListParams(query: TrainingListQuery) {
  const params: Record<string, string | number> = {};

  const assign = (key: keyof TrainingListQuery, value?: string | number) => {
    if (typeof value === 'number') {
      params[key] = value;
      return;
    }
    if (typeof value === 'string' && value.trim()) {
      params[key] = value.trim();
    }
  };

  assign('search', query.search);
  assign('category', query.category);
  assign('provider', query.provider);
  assign('tenant_id', query.tenant_id);
  assign('enterprise_id', query.enterprise_id);
  assign('location_id', query.location_id);
  assign('status', query.status);
  assign('delivery_mode', query.delivery_mode);
  assign('min_price', query.min_price);
  assign('max_price', query.max_price);
  assign('duration', query.duration);
  assign('date_from', query.date_from);
  assign('date_to', query.date_to);
  if (query.page != null) params.page = query.page;
  if (query.page_size != null) params.page_size = query.page_size;

  return params;
}

function mapEnrollmentResult(
  data: Partial<TrainingEnrollmentResult> & Record<string, unknown>,
  trainingId: string,
): TrainingEnrollmentResult {
  const id = String(
    data.id ?? data.enrol_id ?? data.enrollment_id ?? trainingId,
  );
  return {
    id,
    training_id: String(data.training_id ?? trainingId),
    status: String(data.status ?? 'enrolled'),
    participant_email:
      (data.participant_email as string | null | undefined) ?? null,
    participant_name:
      (data.participant_name as string | null | undefined) ?? null,
    group_enrol: Boolean(data.group_enrol),
    coupon_code: (data.coupon_code as string | null | undefined) ?? null,
    access_expires_at:
      (data.access_expires_at as string | null | undefined) ?? null,
    created_at:
      (data.created_at as string | null | undefined) ??
      (data.enrolled_at as string | null | undefined) ??
      null,
    enrollment_code:
      (data.enrollment_code as string | null | undefined) ??
      (data.enrolment_code as string | null | undefined) ??
      id,
    enrolled_at:
      (data.enrolled_at as string | null | undefined) ??
      (data.created_at as string | null | undefined) ??
      null,
    message: (data.message as string | null | undefined) ?? null,
  };
}

async function postEnroll(
  path: string,
  trainingId: string,
  body: TrainingEnrollmentBody,
) {
  const payload: Record<string, unknown> = {};
  if (body.promo_code) payload.promo_code = body.promo_code;
  if (body.coupon_code) payload.coupon_code = body.coupon_code;
  if (body.payment_method_id) {
    payload.payment_method_id = body.payment_method_id;
  }
  if (body.form_configuration_version_id) {
    payload.form_configuration_version_id = body.form_configuration_version_id;
  }
  if (body.custom_values) payload.custom_values = body.custom_values;
  if (body.participant_email) {
    payload.participant_email = body.participant_email;
  }
  if (body.participant_name) {
    payload.participant_name = body.participant_name;
  }

  const response = await apiClient.post<
    Partial<TrainingEnrollmentResult> & Record<string, unknown>
  >(path, payload);
  return mapEnrollmentResult(response.data ?? {}, trainingId);
}

export const trainingService = {
  getList: async (query: TrainingListQuery = {}): Promise<TrainingListResult> => {
    const params = buildListParams({
      page: 1,
      page_size: 20,
      ...query,
    });

    const response = await apiClient.get<TrainingsListApiResponse>(
      ENDPOINTS.TRAININGS.GET_ALL,
      { params },
    );

    return {
      items: Array.isArray(response.data?.items) ? response.data.items : [],
      pagination: response.data?.pagination ?? {
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 0,
      },
    };
  },

  getById: async (id: string): Promise<TrainingDetailView> => {
    const response = await apiClient.get<TrainingApiItem>(
      ENDPOINTS.TRAININGS.GET_BY_ID(id),
    );
    try {
      return mapTrainingApiToDetailView(response.data);
    } catch (error) {
      if (__DEV__) {
        console.warn('[training-detail] map failed', error);
      }
      throw error;
    }
  },

  /**
   * POST /api/v1/trainings/{training_id}/enroll
   * Required: path `training_id` (UUID). Body optional — `{}` is valid.
   * Falls back to /enrol on 404.
   */
  enroll: async (
    id: string,
    body: TrainingEnrollmentBody = {},
  ): Promise<TrainingEnrollmentResult> => {
    try {
      return await postEnroll(ENDPOINTS.TRAININGS.ENROLL(id), id, body);
    } catch (error) {
      const status =
        (error as ApiError | undefined)?.statusCode ??
        (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return postEnroll(ENDPOINTS.TRAININGS.ENROL(id), id, body);
      }
      throw error;
    }
  },

  getMyWishlist: async (): Promise<TrainingWishlistApiItem[]> => {
    const response = await apiClient.get<TrainingWishlistApiItem[]>(
      ENDPOINTS.TRAININGS.MY_WISHLIST,
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  addToWishlist: async (
    trainingId: string,
  ): Promise<TrainingWishlistApiItem> => {
    const response = await apiClient.post<TrainingWishlistApiItem>(
      ENDPOINTS.TRAININGS.ADD_WISHLIST(trainingId),
    );
    return response.data;
  },

  removeFromWishlist: async (trainingId: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.TRAININGS.REMOVE_WISHLIST(trainingId));
  },

  getMyEnrolments: async (
    status?: string,
  ): Promise<TrainingEnrolmentApiItem[]> => {
    const response = await apiClient.get<
      TrainingEnrolmentApiItem[] | { items?: TrainingEnrolmentApiItem[] }
    >(ENDPOINTS.TRAININGS.MY_ENROLMENTS, {
      params: status ? { status } : undefined,
    });
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  },

  /** GET /api/v1/trainings/{training_id}/content */
  getContent: async (trainingId: string): Promise<TrainingContentApiResponse> => {
    try {
      const response = await apiClient.get<TrainingContentApiResponse>(
        ENDPOINTS.TRAININGS.CONTENT(trainingId),
      );
      return response.data ?? { training_id: trainingId, sections: [] };
    } catch (error) {
      const status =
        (error as ApiError | undefined)?.statusCode ??
        (error as { response?: { status?: number } })?.response?.status;
      // Let React Query surface a retryable error — do not throw raw Axios.
      if (status === 0) {
        throw {
          message: 'Network error. Please check your connection.',
          statusCode: 0,
        };
      }
      throw error;
    }
  },

  /** GET /api/v1/trainings/{training_id}/progress */
  getProgress: async (trainingId: string): Promise<TrainingProgressApiResponse> => {
    try {
      const response = await apiClient.get<TrainingProgressApiResponse>(
        ENDPOINTS.TRAININGS.PROGRESS(trainingId),
      );
      return response.data ?? {};
    } catch (error) {
      const status =
        (error as ApiError | undefined)?.statusCode ??
        (error as { response?: { status?: number } })?.response?.status;
      // Soft-fail network/404 so My Learning still renders from content.
      if (status === 0 || status === 404) return { training_id: trainingId };
      throw error;
    }
  },

  /**
   * POST /api/v1/trainings/{training_id}/lessons/{lesson_id}/progress
   * Saves mid-video (or lesson) resume position.
   */
  saveLessonProgress: async (
    trainingId: string,
    lessonId: string,
    body: TrainingLessonProgressSaveRequest,
  ): Promise<TrainingLessonProgressSaveResponse> => {
    const response = await apiClient.post<TrainingLessonProgressSaveResponse>(
      ENDPOINTS.TRAININGS.LESSON_PROGRESS(trainingId, lessonId),
      body,
    );
    return response.data;
  },

  /**
   * POST /api/v1/trainings/{training_id}/progress/complete-lesson
   * Body: { lesson_id }
   */
  completeLesson: async (
    trainingId: string,
    body: TrainingCompleteLessonRequest,
  ): Promise<TrainingCompleteLessonResponse> => {
    const response = await apiClient.post<TrainingCompleteLessonResponse>(
      ENDPOINTS.TRAININGS.COMPLETE_LESSON(trainingId),
      { lesson_id: body.lesson_id },
    );
    return response.data;
  },

  /**
   * GET /api/v1/trainings/{training_id}/assessments/{aid}
   */
  getAssessment: async (
    trainingId: string,
    assessmentId: string,
  ): Promise<TrainingAssessmentDetailApi> => {
    const response = await apiClient.get<TrainingAssessmentDetailApi>(
      ENDPOINTS.TRAININGS.ASSESSMENT_BY_ID(trainingId, assessmentId),
    );
    return response.data;
  },

  /**
   * GET /api/v1/trainings/{training_id}/assignments
   * Returns mixed assignment + assessment rows for the training.
   */
  getAssignments: async (
    trainingId: string,
  ): Promise<TrainingAssignmentListItemApi[]> => {
    const response = await apiClient.get<TrainingAssignmentListItemApi[]>(
      ENDPOINTS.TRAININGS.ASSIGNMENTS(trainingId),
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * POST /api/v1/trainings/{training_id}/assessments/{aid}/submit
   */
  submitAssessment: async (
    trainingId: string,
    assessmentId: string,
    body: TrainingAssessmentSubmitRequest,
  ): Promise<TrainingAssessmentSubmitResponse> => {
    const response = await apiClient.post<TrainingAssessmentSubmitResponse>(
      ENDPOINTS.TRAININGS.ASSESSMENT_SUBMIT(trainingId, assessmentId),
      {
        answers: body.answers,
        started_at: body.started_at ?? undefined,
      },
    );
    return response.data;
  },

  /**
   * POST /api/v1/trainings/{training_id}/live-sessions/{session_id}/attendance
   * Body optional — `{}` is valid. Session-level join only.
   */
  recordLiveSessionAttendance: async (
    trainingId: string,
    sessionId: string,
    body: Record<string, unknown> = {},
  ): Promise<unknown> => {
    const response = await apiClient.post(
      ENDPOINTS.TRAININGS.LIVE_SESSION_ATTENDANCE(trainingId, sessionId),
      body,
    );
    return response.data;
  },

  /**
   * POST /api/v1/trainings/{training_id}/lessons/{lesson_id}/attendance
   * Body optional — `{}` is valid. Lesson-wise live/venue join.
   */
  recordLessonAttendance: async (
    trainingId: string,
    lessonId: string,
    body: Record<string, unknown> = {},
  ): Promise<unknown> => {
    const response = await apiClient.post(
      ENDPOINTS.TRAININGS.LESSON_ATTENDANCE(trainingId, lessonId),
      body,
    );
    return response.data;
  },

  /** GET /api/v1/trainings/{training_id}/reviews */
  getReviews: async (trainingId: string) => {
    const response = await apiClient.get<TrainingReviewsApiResponse>(
      ENDPOINTS.TRAININGS.REVIEWS(trainingId),
    );
    return mapTrainingReviewsResponse(
      response.data ?? { reviews: [], average_rating: 0, count: 0 },
    );
  },

  /** POST /api/v1/trainings/{training_id}/reviews */
  createReview: async (
    trainingId: string,
    body: TrainingReviewCreateBody,
  ): Promise<TrainingReviewApiItem> => {
    const response = await apiClient.post<TrainingReviewApiItem>(
      ENDPOINTS.TRAININGS.REVIEWS(trainingId),
      {
        rating: body.rating,
        comment: body.comment,
        participant_email: body.participant_email,
        ...(body.participant_name?.trim()
          ? { participant_name: body.participant_name.trim() }
          : {}),
      },
    );
    return response.data;
  },

  /**
   * GET /api/v1/trainings/{training_id}/certificate
   * Returns null when not eligible yet (404).
   */
  getCertificate: async (
    trainingId: string,
  ): Promise<TrainingCertificateApi | null> => {
    try {
      const response = await apiClient.get<TrainingCertificateApi>(
        ENDPOINTS.TRAININGS.CERTIFICATE(trainingId),
      );
      return response.data ?? null;
    } catch (error) {
      const status =
        (error as ApiError | undefined)?.statusCode ??
        (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 0) return null;
      throw error;
    }
  },

  /** GET /api/v1/trainings/{training_id}/discussions */
  getDiscussions: async (
    trainingId: string,
  ): Promise<TrainingDiscussionApiItem[]> => {
    try {
      const response = await apiClient.get<unknown>(
        ENDPOINTS.TRAININGS.DISCUSSIONS(trainingId),
      );
      return normalizeTrainingDiscussions(response.data);
    } catch (error) {
      const status =
        (error as ApiError | undefined)?.statusCode ??
        (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 0) return [];
      throw error;
    }
  },

  /** POST /api/v1/trainings/{training_id}/discussions */
  createDiscussion: async (
    trainingId: string,
    body: TrainingDiscussionCreateBody,
  ): Promise<TrainingDiscussionApiItem> => {
    const question = asPlainText(body.question);
    const response = await apiClient.post<unknown>(
      ENDPOINTS.TRAININGS.DISCUSSIONS(trainingId),
      {
        question,
        text: asPlainText(body.text) || question,
      },
    );
    return (
      normalizeTrainingDiscussion(response.data) ?? {
        id: `discussion-${Date.now()}`,
        question,
        author: 'You',
      }
    );
  },

  /**
   * POST /api/v1/trainings/{training_id}/discussions/{discussion_id}/replies
   */
  replyToDiscussion: async (
    trainingId: string,
    discussionId: string,
    body: TrainingDiscussionReplyBody,
  ): Promise<TrainingDiscussionApiItem> => {
    const id = asPlainText(discussionId);
    if (!id) {
      throw new Error('Missing discussion id');
    }
    const answer = asPlainText(body.answer);
    if (!answer) {
      throw new Error('Reply cannot be empty');
    }
    const response = await apiClient.post<unknown>(
      ENDPOINTS.TRAININGS.DISCUSSION_REPLY(trainingId, id),
      { answer },
    );
    return (
      normalizeTrainingDiscussion(response.data) ?? {
        id,
        answer,
      }
    );
  },

  /** GET /api/v1/trainings/{training_id}/announcements */
  getAnnouncements: async (
    trainingId: string,
  ): Promise<TrainingAnnouncementApiItem[]> => {
    try {
      const response = await apiClient.get<unknown>(
        ENDPOINTS.TRAININGS.ANNOUNCEMENTS(trainingId),
      );
      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : data && typeof data === 'object'
          ? ((data as { items?: unknown }).items ??
            (data as { announcements?: unknown }).announcements)
          : [];
      if (!Array.isArray(list)) return [];
      return list.flatMap((item, index) => {
        if (!item || typeof item !== 'object') return [];
        const row = item as Record<string, unknown>;
        const id = asPlainText(row.id) || `announcement-${index}`;
        return [
          {
            id,
            title: asPlainText(row.title) || 'Announcement',
            author: asPlainText(row.author) || 'Instructor',
            channel: asPlainText(row.channel) || undefined,
            message:
              asPlainText(row.message) ||
              asPlainText(row.description) ||
              asPlainText(row.body) ||
              undefined,
            sent_at:
              asPlainText(row.sent_at) ||
              asPlainText(row.created_at) ||
              undefined,
            training_id: asPlainText(row.training_id) || undefined,
          },
        ];
      });
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) return [];
      throw error;
    }
  },
};
