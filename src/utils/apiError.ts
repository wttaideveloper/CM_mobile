type ApiErrorBody = {
  message?: string;
  detail?: string | Array<{ msg?: string; loc?: unknown[] }>;
  errors?: unknown;
};

/** Maps FastAPI-style `detail` and standard `message` fields to user-facing text. */
export function getApiErrorMessage(data: ApiErrorBody | undefined, fallback = 'An error occurred'): string {
  if (!data) return fallback;

  const message = data.message?.trim();
  if (message) return message;

  const { detail } = data;
  if (typeof detail === 'string' && detail.trim()) {
    return detail.trim();
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
