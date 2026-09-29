import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

import { useAuthStore } from '@/stores/auth.store';
import {
  ensureTrainingDownloadsDir,
  trainingDownloadId,
  useTrainingDownloadsStore,
  type TrainingDownloadKind,
} from '@/stores/trainingDownloads.store';

const ANDROID_DOWNLOADS_DIR_KEY = 'training.file.downloadsDirUri';

function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, '_').trim();
  return cleaned || `file-${Date.now()}`;
}

function fileNameFromUrl(url: string, fallback: string): string {
  try {
    const path = url.split('?')[0] ?? '';
    const segment = path.split('/').pop();
    if (segment && segment.includes('.')) {
      return sanitizeFileName(decodeURIComponent(segment));
    }
  } catch {
    /* use fallback */
  }
  return sanitizeFileName(fallback);
}

function mimeFromFileName(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  return 'application/octet-stream';
}

async function openLocalFile(localUri: string, mimeType: string): Promise<void> {
  if (Platform.OS === 'android') {
    const contentUri = await FileSystem.getContentUriAsync(localUri);
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: mimeType,
      });
      return;
    } catch {
      /* fall through to share */
    }
  }

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    await Linking.openURL(localUri);
    return;
  }

  await Sharing.shareAsync(localUri, {
    mimeType,
    dialogTitle: 'Open file',
    UTI: mimeType === 'application/pdf' ? 'com.adobe.pdf' : undefined,
  });
}

async function downloadToCache(
  url: string,
  dest: string,
): Promise<FileSystem.FileSystemDownloadResult> {
  const token = await useAuthStore.getState().ensureAccessToken(false);
  let result = await FileSystem.downloadAsync(url, dest, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (result.status === 401 || result.status === 403) {
    const refreshed = await useAuthStore.getState().ensureAccessToken(true);
    result = await FileSystem.downloadAsync(url, dest, {
      headers: { Authorization: `Bearer ${refreshed}` },
    });
  }
  return result;
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

  const initialUrl =
    FileSystem.StorageAccessFramework.getUriForDirectoryInRoot('Download');
  const permissions =
    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
      initialUrl,
    );
  if (!permissions.granted) return null;
  await SecureStore.setItemAsync(
    ANDROID_DOWNLOADS_DIR_KEY,
    permissions.directoryUri,
  );
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

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(localUri, {
    mimeType,
    dialogTitle: 'Save file',
    UTI: mimeType === 'application/pdf' ? 'com.adobe.pdf' : undefined,
  });
}

/**
 * Fetch a training PDF/file with auth into cache, then open it in the
 * system viewer (does not save to Downloads).
 */
export async function openTrainingFile(args: {
  url: string;
  suggestedName?: string;
}): Promise<boolean> {
  const url = args.url.trim();
  if (!url) {
    Alert.alert('File', 'File link is not available yet.');
    return false;
  }

  const fileName = fileNameFromUrl(
    url,
    args.suggestedName?.trim() || 'training-file.pdf',
  );
  const mimeType = mimeFromFileName(fileName);
  const dest = `${FileSystem.cacheDirectory}training-${Date.now()}-${fileName}`;

  try {
    const result = await downloadToCache(url, dest);
    if (result.status !== 200) {
      throw new Error(`Could not open file (${result.status})`);
    }
    await openLocalFile(result.uri, mimeType);
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not open this file.';
    Alert.alert('Unable to open', message);
    return false;
  }
}

/** Open a file already saved in the in-app downloads library. */
export async function openLocalTrainingDownload(args: {
  localUri: string;
  fileName?: string;
}): Promise<boolean> {
  const localUri = args.localUri.trim();
  if (!localUri) {
    Alert.alert('File', 'Downloaded file is missing.');
    return false;
  }
  try {
    const info = await FileSystem.getInfoAsync(localUri);
    if (!info.exists) {
      Alert.alert('File', 'This download is no longer on the device.');
      return false;
    }
    const fileName = args.fileName || localUri.split('/').pop() || 'file';
    await openLocalFile(localUri, mimeFromFileName(fileName));
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not open this file.';
    Alert.alert('Unable to open', message);
    return false;
  }
}

/**
 * Download video/PDF into the app library (shown on My Trainings → Downloads).
 */
export async function downloadTrainingToLibrary(args: {
  trainingId: string;
  trainingTitle: string;
  lessonId: string;
  lessonTitle: string;
  kind: TrainingDownloadKind;
  url: string;
  suggestedName?: string;
}): Promise<boolean> {
  const url = args.url.trim();
  if (!url) {
    Alert.alert('Download', 'File link is not available yet.');
    return false;
  }

  const id = trainingDownloadId(args.trainingId, args.lessonId);
  const fileName = fileNameFromUrl(
    url,
    args.suggestedName?.trim() ||
      (args.kind === 'video'
        ? `${args.lessonTitle}.mp4`
        : `${args.lessonTitle}.pdf`),
  );
  const safeFileName = sanitizeFileName(`${id.replace(':', '_')}-${fileName}`);

  try {
    const dir = await ensureTrainingDownloadsDir();
    const dest = `${dir}${safeFileName}`;

    const existing = useTrainingDownloadsStore
      .getState()
      .getByLesson(args.trainingId, args.lessonId);
    if (existing?.localUri && existing.localUri !== dest) {
      try {
        await FileSystem.deleteAsync(existing.localUri, { idempotent: true });
      } catch {
        /* ignore */
      }
    }

    const result = await downloadToCache(url, dest);
    if (result.status !== 200) {
      throw new Error(`Download failed (${result.status})`);
    }

    await useTrainingDownloadsStore.getState().upsert({
      id,
      trainingId: args.trainingId,
      trainingTitle: args.trainingTitle,
      lessonId: args.lessonId,
      lessonTitle: args.lessonTitle,
      kind: args.kind,
      remoteUrl: url,
      localUri: result.uri,
      fileName: safeFileName,
      downloadedAt: new Date().toISOString(),
    });

    Alert.alert(
      'Downloaded',
      `${args.lessonTitle} is saved in the app. Open it from My Trainings → Downloads.`,
    );
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not download this file.';
    Alert.alert('Download failed', message);
    return false;
  }
}

/** Download PDF/video to device Downloads (Android) or share sheet (iOS). */
export async function saveTrainingFileToDevice(args: {
  url: string;
  suggestedName?: string;
}): Promise<boolean> {
  const url = args.url.trim();
  if (!url) {
    Alert.alert('Download', 'File link is not available yet.');
    return false;
  }

  const fileName = fileNameFromUrl(
    url,
    args.suggestedName?.trim() || 'training-file.bin',
  );
  const mimeType = mimeFromFileName(fileName);
  const dest = `${FileSystem.cacheDirectory}training-dl-${Date.now()}-${fileName}`;

  try {
    const result = await downloadToCache(url, dest);
    if (result.status !== 200) {
      throw new Error(`Download failed (${result.status})`);
    }
    await saveLocalFileToDownloads(result.uri, fileName, mimeType);
    if (Platform.OS === 'android') {
      Alert.alert(
        'Downloaded',
        `${sanitizeFileName(fileName)} saved to Downloads.`,
      );
    }
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not download this file.';
    Alert.alert('Download failed', message);
    return false;
  }
}

/** @deprecated Prefer openTrainingFile — same open-in-viewer behaviour. */
export async function downloadTrainingFile(args: {
  url: string;
  suggestedName?: string;
}): Promise<boolean> {
  return openTrainingFile(args);
}
