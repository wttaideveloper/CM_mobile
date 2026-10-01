export type ApiError = {
  message: string;
  statusCode?: number;
  /** Backend machine code when present (e.g. ENROLMENT_PENDING_APPROVAL). */
  code?: string;
  errors?: unknown;
};
