import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

import {
  buildAttachmentDownloadUrl,
  ensureAttachmentDownloadUrl,
  fetchAttachmentById,
} from '@/services/attachments.service';
import { useAuthStore } from '@/stores/auth.store';
import { downloadAuthenticatedAttachment, clearAuthenticatedAttachmentCache } from '@/utils/attachmentImage';
import {
  decodeAttachmentFileName,
  sanitizeAttachmentFileName,
} from '@/utils/attachmentFileName';

const ANDROID_DOWNLOADS_DIR_KEY = 'chat.attachment.downloadsDirUri';

function mimeTypeForAttachment(fileName: string, type?: string): string {
  if (type === 'pdf') return 'application/pdf';
  if (type === 'image') {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.gif')) return 'image/gif';
    return 'image/jpeg';
  }
  if (type === 'video') {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.mov')) return 'video/quicktime';
    if (lower.endsWith('.webm')) return 'video/webm';
    if (lower.endsWith('.m4v')) return 'video/x-m4v';
    return 'video/mp4';
  }
  if (type === 'word') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.m4v')) return 'video/x-m4v';
  if (lower.endsWith('.mp4') || lower.endsWith('.m4v')) return 'video/mp4';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  return 'application/octet-stream';
}

function utiForMimeType(mimeType: string): string | undefined {
  if (mimeType === 'application/pdf') return 'com.adobe.pdf';
  if (mimeType === 'application/msword') return 'com.microsoft.word.doc';
  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'org.openxmlformats.wordprocessingml.document';
  }
  if (mimeType.startsWith('image/')) return 'public.image';
  if (mimeType.startsWith('video/')) return 'public.movie';
  return undefined;
}

async function resolveLocalAttachmentUri(args: {
  attachmentId?: string;
  fileName: string;
  uri?: string;
}): Promise<{ localUri: string; resolvedUrl: string | null }> {
  const { attachmentId, fileName, uri } = args;
  const trimmedUri = uri?.trim();

  // Already on device (e.g. just-uploaded local preview).
  if (trimmedUri?.startsWith('file://') || trimmedUri?.startsWith('content://')) {
    return { localUri: trimmedUri, resolvedUrl: null };
  }

  let downloadUrl = trimmedUri;
  if (!downloadUrl && attachmentId) {
    try {
      const detail = await fetchAttachmentById(attachmentId, fileName);
      downloadUrl = detail.download_url;
    } catch {
      downloadUrl = buildAttachmentDownloadUrl(attachmentId);
    }
  }

  if (!downloadUrl) {
    throw new Error('Download link is not available.');
  }

  const resolvedUrl = attachmentId
    ? ensureAttachmentDownloadUrl(downloadUrl, attachmentId)
    : downloadUrl;

  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) {
    throw new Error('Please sign in again.');
  }

  const localUri = await downloadAuthenticatedAttachment(resolvedUrl, accessToken, fileName);
  return { localUri, resolvedUrl };
}

async function openLocalDocument(localUri: string, mimeType: string): Promise<void> {
  if (Platform.OS === 'android') {
    const contentUri = await FileSystem.getContentUriAsync(localUri);

    try {
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: mimeType,
      });
      return;
    } catch (intentError) {
      if (__DEV__) {
        console.warn('[openChatAttachment] Intent VIEW failed, falling back to share:', intentError);
      }
    }
  }

  // iOS: Linking.openURL(file://) often "succeeds" without opening Preview/Files.
  // Always use the share sheet so the user can open in Books, Files, Word, etc.
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('No app available to open this file');
  }

  await Sharing.shareAsync(localUri, {
    mimeType,
    UTI: utiForMimeType(mimeType),
  });
}

async function getAndroidDownloadsDirectoryUri(): Promise<string | null> {
  const cached = await SecureStore.getItemAsync(ANDROID_DOWNLOADS_DIR_KEY);
  if (cached) {
    try {
      await FileSystem.StorageAccessFramework.readDirectoryAsync(cached);
      return cached;
    } catch {
      await SecureStore.deleteItemAsync(ANDROID_DOWNLOADS_DIR_KEY);
    }
  }

  const initialUrl = FileSystem.StorageAccessFramework.getUriForDirectoryInRoot('Download');
  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
    initialUrl,
  );

  if (!permissions.granted) {
    return null;
  }

  await SecureStore.setItemAsync(ANDROID_DOWNLOADS_DIR_KEY, permissions.directoryUri);
  return permissions.directoryUri;
}

/**
 * Save image/video to Photos when the native module is linked.
 * Falls back to share / Downloads if the binary wasn't rebuilt yet
 * (missing ExpoMediaLibraryNext).
 */
async function saveMediaToPhotoLibrary(localUri: string): Promise<'photos' | 'fallback'> {
  try {
    const MediaLibrary = await import('expo-media-library');
    const permission = await MediaLibrary.requestPermissionsAsync(true);
    if (!permission.granted) {
      throw new Error('Permission to save to Photos was not granted.');
    }
    await MediaLibrary.Asset.create(localUri);
    return 'photos';
  } catch (error) {
    const message =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : String(error);

    // Dev client / Expo Go without a native rebuild — don't crash chat.
    if (
      message.includes('ExpoMediaLibraryNext') ||
      message.includes('Cannot find native module')
    ) {
      if (__DEV__) {
        console.warn(
          '[saveChatAttachmentToDevice] expo-media-library native module missing — using share/Downloads. Rebuild with `npx expo run:ios` / `run:android` to save to Photos.',
        );
      }
      return 'fallback';
    }
    throw error;
  }
}

async function saveLocalFileToDownloads(
  localUri: string,
  fileName: string,
  mimeType: string,
): Promise<void> {
  const safeName = sanitizeAttachmentFileName(fileName);

  if (Platform.OS === 'android') {
    const directoryUri = await getAndroidDownloadsDirectoryUri();
    if (!directoryUri) {
      throw new Error('Permission to save into Downloads was not granted.');
    }

    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
      directoryUri,
      safeName,
      mimeType,
    );
    await FileSystem.writeAsStringAsync(destUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return;
  }

  // iOS has no public Downloads folder — share sheet lets the user Save to Files.
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(localUri, {
    mimeType,
    dialogTitle: 'Save attachment',
    UTI: utiForMimeType(mimeType),
  });
}

export async function openChatAttachment(args: {
  attachmentId?: string;
  fileName: string;
  uri?: string;
  type?: string;
}): Promise<void> {
  const { attachmentId, uri, type } = args;
  const fileName = decodeAttachmentFileName(args.fileName);

  if (!useAuthStore.getState().accessToken && !uri?.startsWith('file://')) {
    Alert.alert('Unable to open', 'Please sign in again.');
    return;
  }

  let resolvedUrl: string | null = null;

  try {
    const resolved = await resolveLocalAttachmentUri({ attachmentId, fileName, uri });
    resolvedUrl = resolved.resolvedUrl;
    const mimeType = mimeTypeForAttachment(fileName, type);
    await openLocalDocument(resolved.localUri, mimeType);
  } catch (error) {
    if (attachmentId && resolvedUrl) {
      const accessToken = useAuthStore.getState().accessToken;
      if (accessToken) {
        clearAuthenticatedAttachmentCache(resolvedUrl, accessToken);
      }
    }
    if (__DEV__) {
      console.warn('[openChatAttachment] Failed:', error);
    }
    Alert.alert('Unable to open', 'Could not open this file. Please try again.');
  }
}

function defaultDownloadFileName(type?: string): string {
  if (type === 'image') return `image-${Date.now()}.jpg`;
  if (type === 'video') return `video-${Date.now()}.mp4`;
  if (type === 'pdf') return `document-${Date.now()}.pdf`;
  if (type === 'word') return `document-${Date.now()}.docx`;
  return `attachment-${Date.now()}`;
}

/** Download a chat attachment to Photos (image/video) or Downloads / Files (docs). */
export async function saveChatAttachmentToDevice(args: {
  attachmentId?: string;
  fileName: string;
  uri?: string;
  type?: string;
}): Promise<void> {
  const { attachmentId, uri, type } = args;
  const fileName = decodeAttachmentFileName(
    args.fileName?.trim() || defaultDownloadFileName(type),
  );

  if (!useAuthStore.getState().accessToken && !uri?.startsWith('file://') && !uri?.startsWith('content://')) {
    Alert.alert('Unable to download', 'Please sign in again.');
    return;
  }

  let resolvedUrl: string | null = null;
  const isMedia = type === 'image' || type === 'video';

  try {
    const resolved = await resolveLocalAttachmentUri({ attachmentId, fileName, uri });
    resolvedUrl = resolved.resolvedUrl;
    const mimeType = mimeTypeForAttachment(fileName, type);

    if (isMedia) {
      const destination = await saveMediaToPhotoLibrary(resolved.localUri);
      if (destination === 'photos') {
        Alert.alert(
          'Saved',
          type === 'video' ? 'Video saved to Photos.' : 'Photo saved to Photos.',
        );
        return;
      }
      // Native module not linked yet — same path as documents.
      await saveLocalFileToDownloads(resolved.localUri, fileName, mimeType);
      if (Platform.OS === 'android') {
        Alert.alert(
          'Downloaded',
          `${sanitizeAttachmentFileName(fileName)} saved to Downloads.`,
        );
      }
      return;
    }

    await saveLocalFileToDownloads(resolved.localUri, fileName, mimeType);

    if (Platform.OS === 'android') {
      Alert.alert(
        'Downloaded',
        `${sanitizeAttachmentFileName(fileName)} saved to Downloads.`,
      );
    }
  } catch (error) {
    if (attachmentId && resolvedUrl) {
      const accessToken = useAuthStore.getState().accessToken;
      if (accessToken) {
        clearAuthenticatedAttachmentCache(resolvedUrl, accessToken);
      }
    }
    if (__DEV__) {
      console.warn('[saveChatAttachmentToDevice] Failed:', error);
    }

    const message =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : 'Could not download this file. Please try again.';

    Alert.alert('Download failed', message);
  }
}
