import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

import {
  buildAttachmentDownloadUrl,
  ensureAttachmentDownloadUrl,
  fetchAttachmentById,
} from '@/services/attachments.service';
import { useAuthStore } from '@/stores/auth.store';
import { downloadAuthenticatedAttachment, clearAuthenticatedAttachmentCache } from '@/utils/attachmentImage';

function mimeTypeForAttachment(fileName: string, type?: string): string {
  if (type === 'pdf') return 'application/pdf';
  if (type === 'word') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  return 'application/octet-stream';
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

export async function openChatAttachment(args: {
  attachmentId?: string;
  fileName: string;
  uri?: string;
  type?: string;
}): Promise<void> {
  const { attachmentId, fileName, uri, type } = args;
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    Alert.alert('Unable to open', 'Please sign in again.');
    return;
  }

  let downloadUrl = uri?.trim();
  if (!downloadUrl && attachmentId) {
    try {
      const detail = await fetchAttachmentById(attachmentId, fileName);
      downloadUrl = detail.download_url;
    } catch {
      downloadUrl = buildAttachmentDownloadUrl(attachmentId);
    }
  }

  if (!downloadUrl) {
    Alert.alert('Unable to open', 'Download link is not available.');
    return;
  }

  const resolvedUrl = attachmentId
    ? ensureAttachmentDownloadUrl(downloadUrl, attachmentId)
    : downloadUrl;

  try {
    const localUri = await downloadAuthenticatedAttachment(resolvedUrl, accessToken, fileName);
    const mimeType = mimeTypeForAttachment(fileName, type);
    await openLocalDocument(localUri, mimeType);
  } catch (error) {
    if (attachmentId) {
      clearAuthenticatedAttachmentCache(resolvedUrl, accessToken);
    }
    if (__DEV__) {
      console.warn('[openChatAttachment] Failed:', error);
    }
    Alert.alert('Unable to open', 'Could not open this file. Please try again.');
  }
}
