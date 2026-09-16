import * as FileSystem from 'expo-file-system/legacy';

import type {
  EventApiResponse,
  EventCancelRegistrationResponse,
  EventCheckoutRequest,
  EventContactOrganizerApiResponse,
  EventContactOrganizerRequest,
  EventContactOrganizerResult,
  EventFeedbackApiResponse,
  EventFeedbackRequest,
  EventFeedbackResult,
  EventListQuery,
  EventMeetingAccess,
  EventMeetingLinkApiResponse,
  EventMyRegistrationApiResponse,
  EventOrderApiResponse,
  EventRegistrationApiResponse,
  EventRegistrationForm,
  EventRegistrationFormApiResponse,
  EventRegistrationRequest,
  EventRegistrationResult,
  EventsPaginatedApiResponse,
  EventWaitlistApiResponse,
  EventWaitlistEntryResult,
  EventWaitlistJoinRequest,
  MyEventRegistration,
  MyWaitlistApiResponse,
  MyWaitlistEntry,
} from '@/types/event.types';
import {
  mapEventApiToItem,
  mapEventMeetingLink,
  mapEventRegistrationForm,
  mapEventsApiResponse,
  mapMyRegistrationsApiResponse,
  mapMyWaitlistApiResponse,
} from '@/utils/event.mapper';
import type { Event } from '@/constants/events';
import { API_CONFIG } from '@/config';
import { downloadAuthenticatedImage } from '@/utils/attachmentImage';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

/** PNG magic-number check, base64-encoded — same technique already used for
 * the PDF check in attachmentImage.ts, applied here because the QR endpoint
 * falls back to a plain JSON body (not an image) when the server-side
 * `qrcode` package isn't installed. */
async function isPngFile(localUri: string): Promise<boolean> {
  try {
    const header = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
      length: 8,
      position: 0,
    });
    return header.startsWith('iVBORw0KGgo');
  } catch {
    return false;
  }
}

// EventsScreen renders a single non-paginated FlatList (no infinite scroll in the
// existing UI), so fetch one reasonably-sized page rather than adding pagination UX.
export const EVENT_PAGE_SIZE = 50;

function buildListParams(query: EventListQuery) {
  // Backend does NOT default to published-only — this must always be sent,
  // otherwise draft/pending/suspended events would be visible to end users.
  const params: Record<string, string | number> = {
    status: query.status?.trim() || 'published',
  };

  if (query.page != null) {
    params.page = query.page;
  }

  if (query.page_size != null) {
    params.page_size = query.page_size;
  }

  return params;
}

export const eventService = {
  getList: async (query: EventListQuery = {}): Promise<Event[]> => {
    const params = buildListParams(query);

    if (__DEV__) {
      console.log('[Events API] GET list params:', params);
    }

    const response = await apiClient.get<EventsPaginatedApiResponse>(
      ENDPOINTS.EVENTS.GET_ALL,
      { params },
    );

    return mapEventsApiResponse(response.data.items);
  },

  getById: async (id: string): Promise<Event> => {
    if (__DEV__) {
      console.log('[Events API] GET by id:', id);
    }

    const response = await apiClient.get<EventApiResponse>(
      ENDPOINTS.EVENTS.GET_BY_ID(id),
    );
    return mapEventApiToItem(response.data);
  },

  /**
   * GET /api/v1/events/{id}/registration-form — the event's dynamic
   * registration questions (Phase 5B). Customer-safe: 403 for non-published
   * events, 404 if the event doesn't exist.
   */
  getRegistrationForm: async (id: string): Promise<EventRegistrationForm> => {
    if (__DEV__) {
      console.log('[Events API] GET registration-form:', id);
    }

    const response = await apiClient.get<EventRegistrationFormApiResponse>(
      ENDPOINTS.EVENTS.REGISTRATION_FORM(id),
    );
    return mapEventRegistrationForm(response.data);
  },

  /**
   * POST /api/v1/events/{id}/registrations — free registration only.
   * No response_model on the backend, so parse the body defensively rather
   * than trusting a specific shape (same approach as trainingService.enroll).
   */
  register: async (
    id: string,
    payload: EventRegistrationRequest,
  ): Promise<EventRegistrationResult> => {
    if (__DEV__) {
      console.log('[Events API] POST register:', id, payload);
    }

    const response = await apiClient.post<EventRegistrationApiResponse>(
      ENDPOINTS.EVENTS.REGISTER(id),
      payload,
    );
    const data = response.data ?? {};

    return {
      id: data.id != null ? String(data.id) : null,
      status: String(data.status ?? 'confirmed'),
      qrCode: data.qr_code != null ? String(data.qr_code) : null,
    };
  },

  /** GET /api/v1/events/my/registrations — the signed-in user's own registrations. */
  getMyRegistrations: async (status?: string): Promise<MyEventRegistration[]> => {
    if (__DEV__) {
      console.log('[Events API] GET my/registrations, status:', status);
    }

    const response = await apiClient.get<EventMyRegistrationApiResponse[]>(
      ENDPOINTS.EVENTS.MY_REGISTRATIONS,
      { params: status ? { status } : undefined },
    );

    return mapMyRegistrationsApiResponse(
      Array.isArray(response.data) ? response.data : [],
    );
  },

  /**
   * GET /api/v1/events/my/waitlist — the signed-in user's own waitlist
   * entries (waiting/promoted/left). Real response_model on the backend,
   * unlike getMyRegistrations' underlying endpoint — trusted directly.
   */
  getMyWaitlist: async (status?: string): Promise<MyWaitlistEntry[]> => {
    if (__DEV__) {
      console.log('[Events API] GET my/waitlist, status:', status);
    }

    const response = await apiClient.get<MyWaitlistApiResponse[]>(
      ENDPOINTS.EVENTS.MY_WAITLIST,
      { params: status ? { status } : undefined },
    );

    return mapMyWaitlistApiResponse(Array.isArray(response.data) ? response.data : []);
  },

  /** DELETE /api/v1/events/{id}/registrations/{registrationId} — cancel own registration. */
  cancelRegistration: async (
    eventId: string,
    registrationId: string,
  ): Promise<EventCancelRegistrationResponse> => {
    if (__DEV__) {
      console.log('[Events API] DELETE registration:', eventId, registrationId);
    }

    const response = await apiClient.delete<EventCancelRegistrationResponse>(
      ENDPOINTS.EVENTS.REGISTRATION(eventId, registrationId),
    );

    return { message: response.data?.message ?? 'Registration cancelled' };
  },

  /**
   * GET /api/v1/events/{id}/registrations/{registrationId}/qr — downloads and
   * caches the real QR image, reusing the same authenticated-download utility
   * chat attachments already use (token attach + one refresh-and-retry).
   * Returns a local file:// URI, or throws if the backend didn't actually
   * return an image (e.g. its `qrcode` package fallback path).
   */
  getRegistrationQrImageUri: async (
    eventId: string,
    registrationId: string,
  ): Promise<string> => {
    const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.EVENTS.REGISTRATION_QR(eventId, registrationId)}`;
    const localUri = await downloadAuthenticatedImage(url);

    if (!(await isPngFile(localUri))) {
      throw new Error('QR code image is not available for this registration.');
    }

    return localUri;
  },

  /**
   * POST /api/v1/events/{id}/checkout — paid registration (Phase 3, demo
   * payment only). Unlike register(), this endpoint has a real response_model
   * (EventOrderResponse) so the response can be trusted directly.
   */
  checkout: async (
    id: string,
    payload: EventCheckoutRequest,
  ): Promise<EventOrderApiResponse> => {
    if (__DEV__) {
      console.log('[Events API] POST checkout:', id, payload);
    }

    const response = await apiClient.post<EventOrderApiResponse>(
      ENDPOINTS.EVENTS.CHECKOUT(id),
      payload,
    );

    return response.data;
  },

  /**
   * POST /api/v1/events/{id}/waitlist — join. No response_model on the
   * backend (same risk as register()), so parse defensively.
   */
  joinWaitlist: async (
    id: string,
    payload: EventWaitlistJoinRequest,
  ): Promise<EventWaitlistEntryResult> => {
    if (__DEV__) {
      console.log('[Events API] POST waitlist:', id, payload);
    }

    const response = await apiClient.post<EventWaitlistApiResponse>(
      ENDPOINTS.EVENTS.WAITLIST(id),
      payload,
    );
    const data = response.data ?? {};

    return { id: data.id != null ? String(data.id) : null };
  },

  /** DELETE /api/v1/events/{id}/waitlist/{entryId} — leave. */
  leaveWaitlist: async (
    id: string,
    entryId: string,
  ): Promise<EventCancelRegistrationResponse> => {
    if (__DEV__) {
      console.log('[Events API] DELETE waitlist entry:', id, entryId);
    }

    const response = await apiClient.delete<EventCancelRegistrationResponse>(
      ENDPOINTS.EVENTS.WAITLIST_ENTRY(id, entryId),
    );

    return { message: response.data?.message ?? 'Removed from waitlist' };
  },

  /**
   * GET /api/v1/events/{id}/meeting-link — registered-participant/admin/
   * provider only; the backend 403s everyone else (Phase 5C). This is the
   * ONLY meeting-link source the app trusts — the general event detail/list
   * responses also carry a raw meeting_link field, but that one is returned
   * unauthenticated with no eligibility check, so it is never mapped or
   * displayed anywhere (see event.mapper.ts, mapEventApiToItem).
   *
   * Deliberately logs only the event id, never response.data — that body
   * carries the real meeting URL and must not reach logs/analytics.
   */
  getMeetingLink: async (id: string): Promise<EventMeetingAccess> => {
    if (__DEV__) {
      console.log('[Events API] GET meeting-link:', id);
    }

    const response = await apiClient.get<EventMeetingLinkApiResponse>(
      ENDPOINTS.EVENTS.MEETING_LINK(id),
    );
    return mapEventMeetingLink(response.data);
  },

  /**
   * POST /api/v1/events/{id}/contact — one-way message relay to the event
   * organiser (Phase 5D-2). This is NOT a chat/conversation: the backend
   * (event_service.py, contact_organiser_service) only best-effort emails/
   * notifies the organiser and records an audit row — there is no thread
   * the customer can revisit, so this deliberately does not touch the
   * app's existing conversation/chat architecture. No response_model on
   * the backend, so parse the body defensively.
   *
   * Deliberately logs only the event id — never the message body (may
   * contain whatever the user wrote) and never response.data (which
   * includes the organiser's raw contact string).
   */
  contactOrganizer: async (
    id: string,
    payload: EventContactOrganizerRequest,
  ): Promise<EventContactOrganizerResult> => {
    if (__DEV__) {
      console.log('[Events API] POST contact:', id);
    }

    const response = await apiClient.post<EventContactOrganizerApiResponse>(
      ENDPOINTS.EVENTS.CONTACT(id),
      payload,
    );

    return { message: String(response.data?.message ?? 'Message sent to organiser') };
  },

  /**
   * POST /api/v1/events/{id}/feedback (open to any authenticated user) or
   * POST /api/v1/events/{id}/reviews (requires participant_email to match a
   * confirmed/attended registration — the backend 403s otherwise)
   * (Phase 5D-3). Both routes are backed by the identical
   * create_feedback_service; only the URL (and therefore is_review)
   * differs. No response_model on either, so parse the body defensively.
   *
   * Deliberately logs only the event id and which endpoint was used —
   * never the rating/comment content.
   */
  submitFeedback: async (
    id: string,
    payload: EventFeedbackRequest,
    asReview: boolean,
  ): Promise<EventFeedbackResult> => {
    if (__DEV__) {
      console.log('[Events API] POST', asReview ? 'reviews' : 'feedback', ':', id);
    }

    const response = await apiClient.post<EventFeedbackApiResponse>(
      asReview ? ENDPOINTS.EVENTS.REVIEWS(id) : ENDPOINTS.EVENTS.FEEDBACK(id),
      payload,
    );
    const data = response.data ?? {};

    return {
      id: data.id != null ? String(data.id) : null,
      isReview: Boolean(data.is_review ?? asReview),
    };
  },
};
