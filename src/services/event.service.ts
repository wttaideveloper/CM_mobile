import * as FileSystem from 'expo-file-system/legacy';

import type {
  EventApiResponse,
  EventCancelRegistrationResponse,
  EventListQuery,
  EventMyRegistrationApiResponse,
  EventRegistrationApiResponse,
  EventRegistrationRequest,
  EventRegistrationResult,
  EventsPaginatedApiResponse,
  MyEventRegistration,
} from '@/types/event.types';
import {
  mapEventApiToItem,
  mapEventsApiResponse,
  mapMyRegistrationsApiResponse,
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
};
