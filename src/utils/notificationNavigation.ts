import type { Href } from 'expo-router';

import { chatHref } from '@/utils/chatNavigation';

/** Training notification categories from inbox / push / socket metadata. */
export const TRAINING_NOTIFICATION_CATEGORIES = {
  ENROLMENT_CONFIRMATION: 'training_enrolment_confirmation',
  ENROLMENT_APPROVED: 'enrolment_approved',
  ENROLMENT_REJECTED: 'enrolment_rejected',
  ENROLMENT_CANCELLED: 'enrolment_cancelled',
  TRAINING_NEW: 'training_new',
  TRAINING_CERTIFICATE: 'training_certificate',
  TRAINING_ANNOUNCEMENT: 'training_announcement',
  TRAINING_ANSWER: 'training_answer',
  TRAINING_REMINDER: 'training_reminder',
  TRAINING_FINAL_DAY: 'training_final_day',
  CHAT_MESSAGE: 'chat_message',
} as const;

export type TrainingNotificationFocus =
  | 'content'
  | 'announcements'
  | 'discussions'
  | 'certificate';

export type NotificationRouteFields = {
  category?: string | null;
  trainingId?: string | null;
  enrolmentId?: string | null;
  status?: string | null;
  announcementId?: string | null;
  discussionId?: string | null;
  certificateUrl?: string | null;
  conversationId?: string | null;
};

function trimId(value: string | null | undefined): string | undefined {
  const next = value?.trim();
  return next ? next : undefined;
}

function trainingDetailHref(trainingId: string): Href {
  return {
    pathname: '/(main)/market/training-detail',
    params: { id: trainingId },
  };
}

function myLearningHref(
  trainingId: string,
  focus?: TrainingNotificationFocus,
  extra?: Record<string, string>,
): Href {
  return {
    pathname: '/(main)/market/my-training-progress',
    params: {
      id: trainingId,
      ...(focus ? { focus } : {}),
      ...extra,
    },
  };
}

/**
 * Resolve deep-link target for inbox tap / push tap.
 * Route on `category` + `training_id` (chat uses `conversationId`).
 */
export function resolveNotificationHref(
  fields: NotificationRouteFields,
): Href | null {
  const category = trimId(fields.category)?.toLowerCase();
  const trainingId = trimId(fields.trainingId);
  const conversationId = trimId(fields.conversationId);
  const announcementId = trimId(fields.announcementId);
  const discussionId = trimId(fields.discussionId);
  const certificateUrl = trimId(fields.certificateUrl);

  if (!category) {
    if (conversationId) return chatHref(conversationId);
    return null;
  }

  if (category === TRAINING_NOTIFICATION_CATEGORIES.CHAT_MESSAGE) {
    return conversationId ? chatHref(conversationId) : null;
  }

  if (!trainingId) return null;

  switch (category) {
    case TRAINING_NOTIFICATION_CATEGORIES.ENROLMENT_CONFIRMATION:
    case TRAINING_NOTIFICATION_CATEGORIES.ENROLMENT_REJECTED:
    case TRAINING_NOTIFICATION_CATEGORIES.ENROLMENT_CANCELLED:
    case TRAINING_NOTIFICATION_CATEGORIES.TRAINING_NEW:
    case TRAINING_NOTIFICATION_CATEGORIES.TRAINING_REMINDER:
    case TRAINING_NOTIFICATION_CATEGORIES.TRAINING_FINAL_DAY:
      return trainingDetailHref(trainingId);

    case TRAINING_NOTIFICATION_CATEGORIES.ENROLMENT_APPROVED:
      return myLearningHref(trainingId, 'content');

    case TRAINING_NOTIFICATION_CATEGORIES.TRAINING_CERTIFICATE:
      return myLearningHref(
        trainingId,
        'certificate',
        certificateUrl ? { certificate_url: certificateUrl } : undefined,
      );

    case TRAINING_NOTIFICATION_CATEGORIES.TRAINING_ANNOUNCEMENT:
      return myLearningHref(
        trainingId,
        'announcements',
        announcementId ? { announcement_id: announcementId } : undefined,
      );

    case TRAINING_NOTIFICATION_CATEGORIES.TRAINING_ANSWER:
      return myLearningHref(
        trainingId,
        'discussions',
        discussionId ? { discussion_id: discussionId } : undefined,
      );

    default:
      // Unknown training-ish category with a training_id → detail as safe fallback.
      if (category.startsWith('training_') || category.startsWith('enrolment_')) {
        return trainingDetailHref(trainingId);
      }
      if (conversationId) return chatHref(conversationId);
      return null;
  }
}

/** Pull route fields from inbox `metadata` (or flat push `data`). */
export function notificationFieldsFromRecord(
  category: string | null | undefined,
  data: Record<string, unknown> | null | undefined,
): NotificationRouteFields {
  const source = data ?? {};
  const read = (...keys: string[]): string | undefined => {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
      if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
      }
    }
    return undefined;
  };

  return {
    category:
      trimId(category) ||
      read('category', 'notification_category', 'notificationCategory'),
    trainingId: read('training_id', 'trainingId'),
    enrolmentId: read('enrolment_id', 'enrolmentId', 'enrollment_id'),
    status: read('status'),
    announcementId: read('announcement_id', 'announcementId'),
    discussionId: read('discussion_id', 'discussionId'),
    certificateUrl: read('certificate_url', 'certificateUrl'),
    conversationId: read(
      'conversation_id',
      'conversationId',
      'conversationID',
    ),
  };
}
