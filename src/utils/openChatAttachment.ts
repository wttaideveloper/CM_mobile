import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';
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
  if (type === 'word') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  return 'application/octet-stream';
}

function sanitizeFileName(fileName: string): string {
  const cleaned = fileName.replace(/[\\/:*?"<>|]/g, '_').trim();
  return cleaned || `attachment-${Date.now()}`;
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

  if (Platform.OS === 'ios') {
    const canOpen = await Linking.canOpenURL(localUri);
    if (canOpen) {
      await Linking.openURL(localUri);
      return;
    }
  }

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('No app available to open this file');
  }

  await Sharing.shareAsync(localUri, {
    mimeType,
    UTI: mimeType === 'application/pdf' ? 'com.adobe.pdf' : undefined,
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

async function saveLocalFileToDownloads(
  localUri: string,
  fileName: string,
  mimeType: string,
): Promise<void> {
  const safeName = sanitizeFileName(fileName);

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
    UTI: mimeType.startsWith('image/')
      ? 'public.image'
      : mimeType === 'application/pdf'
        ? 'com.adobe.pdf'
        : undefined,
  });
}

export async function openChatAttachment(args: {
  attachmentId?: string;
  fileName: string;
  uri?: string;
  type?: string;
}): Promise<void> {
  const { attachmentId, fileName, uri, type } = args;

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

/** Download an image/file attachment and save it to the device Downloads folder. */
export async function saveChatAttachmentToDevice(args: {
  attachmentId?: string;
  fileName: string;
  uri?: string;
  type?: string;
}): Promise<void> {
  const { attachmentId, fileName, uri, type } = args;

  if (!useAuthStore.getState().accessToken && !uri?.startsWith('file://') && !uri?.startsWith('content://')) {
    Alert.alert('Unable to download', 'Please sign in again.');
    return;
  }

  let resolvedUrl: string | null = null;

  try {
    const resolved = await resolveLocalAttachmentUri({ attachmentId, fileName, uri });
    resolvedUrl = resolved.resolvedUrl;
    const mimeType = mimeTypeForAttachment(fileName, type);
    await saveLocalFileToDownloads(resolved.localUri, fileName, mimeType);

    if (Platform.OS === 'android') {
      Alert.alert('Downloaded', `${sanitizeFileName(fileName)} saved to Downloads.`);
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
