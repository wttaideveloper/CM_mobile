type ApiErrorDetailObject = {
  message?: string;
  code?: string;
  msg?: string;
};

type ApiErrorBody = {
  message?: string;
  code?: string;
  detail?:
    | string
    | ApiErrorDetailObject
    | Array<{ msg?: string; loc?: unknown[] }>;
  errors?: unknown;
};

function detailObjectMessage(detail: ApiErrorDetailObject): string {
  return (
    detail.message?.trim() ||
    detail.msg?.trim() ||
    ''
  );
}

function parseMaybeJsonBody(data: unknown): ApiErrorBody | undefined {
  if (data == null) return undefined;
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed) return undefined;
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === 'object') {
        return parsed as ApiErrorBody;
      }
    } catch {
      return { detail: trimmed };
    }
    return { detail: trimmed };
  }
  if (typeof data === 'object') return data as ApiErrorBody;
  return undefined;
}

/** Maps FastAPI-style `detail` and standard `message` fields to user-facing text. */
export function getApiErrorMessage(
  data: ApiErrorBody | string | undefined,
  fallback = 'An error occurred',
): string {
  const body = parseMaybeJsonBody(data);
  if (!body) return fallback;

  const message = body.message?.trim();
  if (message) return message;

  const { detail } = body;
  if (typeof detail === 'string' && detail.trim()) {
    return detail.trim();
  }

  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const nested = detailObjectMessage(detail);
    if (nested) return nested;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const messages = detail
      .map((item) => item.msg?.trim())
      .filter((item): item is string => Boolean(item));

    if (messages.length > 0) {
      return messages.join('\n');
    }
  }

  return fallback;
}

/** FastAPI nested `detail.code` (e.g. ENROLMENT_PENDING_APPROVAL). */
export function getApiErrorCode(
  data: ApiErrorBody | string | undefined,
): string | undefined {
  const body = parseMaybeJsonBody(data);
  if (!body) return undefined;
  const top = body.code?.trim();
  if (top) return top;
  const { detail } = body;
  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const code = detail.code?.trim();
    if (code) return code;
  }
  return undefined;
}

/**
 * Prefer interceptor-normalized `message`, then Axios `response.data`.
 * Avoids showing "Network error" when the API actually returned a 4xx body.
 */
export function resolveApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Try again.',
): string {
  if (!error) return fallback;
  if (typeof error === 'string' && error.trim()) return error.trim();

  const err = error as {
    message?: string;
    statusCode?: number;
    response?: { status?: number; data?: unknown };
  };

  const status = err.statusCode ?? err.response?.status;
  const fromBody = getApiErrorMessage(
    err.response?.data as ApiErrorBody | string | undefined,
    '',
  );
  if (fromBody) return fromBody;

  const msg = err.message?.trim();
  if (msg) {
    if (status && status >= 400 && /network error/i.test(msg)) {
      return fallback;
    }
    if (!/^request failed with status code/i.test(msg)) {
      return msg;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    const m = error.message.trim();
    if (!/^request failed with status code/i.test(m)) return m;
  }

  return fallback;
}
