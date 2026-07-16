import * as FileSystem from 'expo-file-system/legacy';

import { API_CONFIG } from '@/config';
import { useAuthStore } from '@/stores/auth.store';

const mediaCache = new Map<string, string>();

function cacheKey(uri: string, accessToken: string): string {
  return `${uri}::${accessToken.slice(0, 12)}`;
}

function extensionFromFileName(fileName?: string, fallback = 'bin'): string {
  if (!fileName) return fallback;
  const parts = fileName.split('.');
  if (parts.length < 2) return fallback;
  return parts.pop()!.toLowerCase();
}

async function assertValidDownloadedFile(localUri: string, extension: string): Promise<void> {
  if (extension !== 'pdf') return;

  // Read only the PDF magic bytes — loading the full file into memory can OOM/crash the app.
  const header = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.UTF8,
    length: 4,
    position: 0,
  });

  if (!header.startsWith('%PDF')) {
    await FileSystem.deleteAsync(localUri, { idempotent: true });
    throw new Error('Downloaded file is not a valid PDF');
  }
}

export function clearAuthenticatedAttachmentCache(uri: string, accessToken: string): void {
  mediaCache.delete(cacheKey(uri, accessToken));
}

export function getCachedAuthenticatedImage(
  uri: string,
  accessToken: string | null | undefined,
): string | null {
  if (!uri || !accessToken) return null;
  return mediaCache.get(cacheKey(uri, accessToken)) ?? null;
}

export function getCachedAuthenticatedAttachment(
  uri: string,
  accessToken: string | null | undefined,
): string | null {
  return getCachedAuthenticatedImage(uri, accessToken);
}

export function attachmentUrlRequiresAuth(uri: string): boolean {
  if (!uri) return false;
  return uri.startsWith(API_CONFIG.BASE_URL);
}

async function resolveAttachmentAccessToken(forceRefresh = false): Promise<string> {
  return useAuthStore.getState().ensureAccessToken(forceRefresh);
}

async function downloadToCache(
  uri: string,
  accessToken: string,
  localPath: string,
): Promise<FileSystem.FileSystemDownloadResult> {
  return FileSystem.downloadAsync(uri, localPath, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function downloadAuthenticatedAttachment(
  uri: string,
  _accessToken?: string | null,
  fileName?: string,
): Promise<string> {
  const token = await resolveAttachmentAccessToken();
  const key = cacheKey(uri, token);
  const cached = mediaCache.get(key);
  if (cached) {
    const extension = extensionFromFileName(fileName, 'bin');
    try {
      await assertValidDownloadedFile(cached, extension);
      return cached;
    } catch {
      mediaCache.delete(key);
    }
  }

  const extension = extensionFromFileName(fileName, 'm4a');
  const localPath = `${FileSystem.cacheDirectory}chat-attach-${Date.now()}.${extension}`;

  let result = await downloadToCache(uri, token, localPath);

  // Retry once with a freshly issued dev-token when auth is rejected.
  if (result.status === 401 || result.status === 403 || result.status === 410) {
    const refreshedToken = await resolveAttachmentAccessToken(true);
    if (refreshedToken !== token) {
      result = await downloadToCache(uri, refreshedToken, localPath);
    }
  }

  if (result.status !== 200) {
    throw new Error(`Attachment download failed with status ${result.status}`);
  }

  await assertValidDownloadedFile(result.uri, extension);

  mediaCache.set(cacheKey(uri, token), result.uri);
  return result.uri;
}

export async function downloadAuthenticatedImage(uri: string): Promise<string> {
  return downloadAuthenticatedAttachment(uri, undefined, 'image.jpg');
}
