import { useEffect, useState } from 'react';

import { useAuthStore } from '@/stores/auth.store';
import {
  attachmentUrlRequiresAuth,
  downloadAuthenticatedAttachment,
  getCachedAuthenticatedAttachment,
} from '@/utils/attachmentImage';

type Result = {
  uri: string | null;
  loading: boolean;
  error: boolean;
};

export function useAuthenticatedAttachmentUri(
  remoteUri?: string,
  fileName?: string,
  options?: { enabled?: boolean },
): Result {
  const enabled = options?.enabled ?? true;
  const accessToken = useAuthStore((state) => state.accessToken);
  const [uri, setUri] = useState<string | null>(() => {
    if (!remoteUri) return null;
    if (!attachmentUrlRequiresAuth(remoteUri)) return remoteUri;
    return getCachedAuthenticatedAttachment(remoteUri, accessToken);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!enabled) {
      setUri(null);
      setLoading(false);
      setError(false);
      return undefined;
    }

    if (!remoteUri) {
      setUri(null);
      setLoading(false);
      setError(false);
      return undefined;
    }

    if (!attachmentUrlRequiresAuth(remoteUri)) {
      setUri(remoteUri);
      setLoading(false);
      setError(false);
      return undefined;
    }

    const cached = getCachedAuthenticatedAttachment(remoteUri, accessToken);
    if (cached) {
      setUri(cached);
      setLoading(false);
      setError(false);
      return undefined;
    }

    setUri(null);
    setLoading(true);
    setError(false);

    void downloadAuthenticatedAttachment(remoteUri, undefined, fileName)
      .then((localUri) => {
        if (!cancelled) {
          setUri(localUri);
          setLoading(false);
        }
      })
      .catch((downloadError) => {
        if (__DEV__) {
          console.warn('[useAuthenticatedAttachmentUri] Download failed:', remoteUri, downloadError);
        }
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, enabled, fileName, remoteUri]);

  return { uri, loading, error };
}
