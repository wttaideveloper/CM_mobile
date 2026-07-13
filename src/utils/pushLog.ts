function formatPushError(error: unknown): unknown {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      message?: string;
      response?: { status?: number; data?: unknown };
    };

    return {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    };
  }

  if (error instanceof Error) {
    return { message: error.message, name: error.name };
  }

  return error;
}

export function pushLog(message: string, data?: unknown): void {
  if (!__DEV__) return;

  if (data !== undefined) {
    console.log(`[PUSH] ${message}`, data);
    return;
  }

  console.log(`[PUSH] ${message}`);
}

export function pushWarn(message: string, data?: unknown): void {
  if (!__DEV__) return;

  if (data !== undefined) {
    console.warn(`[PUSH] ${message}`, data);
    return;
  }

  console.warn(`[PUSH] ${message}`);
}

export function pushError(message: string, error?: unknown): void {
  if (!__DEV__) return;

  if (error !== undefined) {
    console.error(`[PUSH] ${message}`, formatPushError(error));
    return;
  }

  console.error(`[PUSH] ${message}`);
}
