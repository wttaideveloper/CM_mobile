export type EventVenue = {
  address?: string | null;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
  instructions?: string | null;
  map_url?: string | null;
};

export type EventSessionApiResponse = {
  id?: string;
  session_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  title?: string | null;
  speaker?: string | null;
  location?: string | null;
  meeting_link?: string | null;
};

/**
 * Shape of a single item returned by GET /api/v1/events/ and GET /api/v1/events/{id}.
 * `enterprise_name` is only present on the detail response but is safe to type as
 * optional on both since the list response simply omits it.
 */
export type EventApiResponse = {
  id: string;
  tenant_id?: string | null;
  enterprise_id?: string | null;
  location_id?: string | null;
  title: string;
  description?: string | null;
  category: string;
  subcategory?: string | null;
  tags?: string[] | null;
  organiser_name?: string | null;
  organiser_contact?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  registration_cutoff?: string | null;
  registration_open_at?: string | null;
  registration_close_at?: string | null;
  duration_type?: string | null;
  time_zone?: string | null;
  primary_image?: string | null;
  gallery_images?: string[] | null;
  videos?: string[] | null;
  documents?: string[] | null;
  delivery_mode?: string | null;
  delivery_mode_display?: string | null;
  venue?: EventVenue | null;
  meeting_link?: string | null;
  meeting_provider?: string | null;
  /** Backend returns price/capacity as strings — parse before using as a number. */
  price?: string | null;
  currency?: string | null;
  ticket_types?: unknown[] | null;
  capacity?: string | null;
  min_participants?: string | null;
  max_participants?: string | null;
  custom_fields?: unknown[] | null;
  custom_values?: unknown[] | null;
  form_configuration_id?: string | null;
  form_configuration_version_id?: string | null;
  sessions?: EventSessionApiResponse[] | null;
  status: string;
  is_deleted?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  requires_reapproval?: boolean | null;
  last_admin_notes?: string | null;
  available_seats?: number | null;
  is_full?: boolean | null;
  registration_open?: boolean | null;
  /** Detail response only. */
  enterprise_name?: string | null;
};

export type EventPagination = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type EventsPaginatedApiResponse = {
  items: EventApiResponse[];
  pagination: EventPagination;
};

export type EventListQuery = {
  status?: string;
  page?: number;
  page_size?: number;
};
