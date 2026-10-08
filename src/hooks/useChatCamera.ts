import * as ImagePicker from 'expo-image-picker';
import { AudioModule } from 'expo-audio';
import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';

export type ChatCameraResult = {
  uri: string;
  fileName: string;
  fileSizeLabel: string;
  mimeType?: string;
  kind: 'image' | 'video';
  /** Formatted length for video bubbles, e.g. `0:12`. */
  durationLabel?: string;
};

function formatDurationLabel(seconds: number | null | undefined): string | undefined {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) {
    return undefined;
  }
  const total = Math.max(0, Math.round(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function isVideoAsset(asset: ImagePicker.ImagePickerAsset): boolean {
  const mime = (asset.mimeType ?? '').toLowerCase();
  if (mime.startsWith('video/')) return true;
  if (asset.type === 'video') return true;
  const name = (asset.fileName ?? asset.uri).toLowerCase();
  return /\.(mp4|mov|m4v|webm)(\b|$)/.test(name);
}

function assetToChatResult(
  asset: ImagePicker.ImagePickerAsset,
  fallbackPrefix: string,
): ChatCameraResult {
  const mimeType = asset.mimeType ?? undefined;
  const kind: 'image' | 'video' = isVideoAsset(asset) ? 'video' : 'image';
  const extension =
    kind === 'video'
      ? mimeType === 'video/quicktime'
        ? 'mov'
        : mimeType === 'video/webm'
          ? 'webm'
          : 'mp4'
      : mimeType === 'image/png'
        ? 'png'
        : mimeType === 'image/webp'
          ? 'webp'
          : mimeType === 'image/heic' || mimeType === 'image/heif'
            ? 'heic'
            : 'jpg';
  const fileName =
    asset.fileName ?? `${fallbackPrefix}-${Date.now()}.${extension}`;
  const fileSizeLabel = asset.fileSize
    ? `${Math.max(1, Math.round(asset.fileSize / 1024))} KB`
    : '—';

  return {
    uri: asset.uri,
    fileName,
    fileSizeLabel,
    mimeType:
      mimeType ??
      (kind === 'video'
        ? extension === 'mov'
          ? 'video/quicktime'
          : 'video/mp4'
        : undefined),
    kind,
    durationLabel: kind === 'video' ? formatDurationLabel(asset.duration) : undefined,
  };
}

function showPermissionAlert(title: string, message: string) {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Open Settings', onPress: () => void Linking.openSettings() },
  ]);
}

async function ensureCameraPermission(): Promise<boolean> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    showPermissionAlert(
      'Camera permission needed',
      'Allow camera access to take photos and videos in chat.',
    );
    return false;
  }
  return true;
}

async function ensureMicrophoneForVideo(): Promise<boolean> {
  try {
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      showPermissionAlert(
        'Microphone permission needed',
        'Allow microphone access to record video with sound.',
      );
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

export function useChatCamera() {
  const openCameraPhoto = useCallback(async (): Promise<ChatCameraResult | null> => {
    if (!(await ensureCameraPermission())) return null;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
      cameraType: ImagePicker.CameraType.back,
    });

    if (result.canceled || !result.assets[0]) return null;

    const asset = result.assets[0];
    if (__DEV__) {
      console.log('[Chat Camera] Photo captured:', {
        uri: asset.uri,
        fileName: asset.fileName,
      });
    }

    return assetToChatResult(asset, 'photo');
  }, []);

  const openCameraVideo = useCallback(async (): Promise<ChatCameraResult | null> => {
    if (!(await ensureCameraPermission())) return null;
    if (!(await ensureMicrophoneForVideo())) return null;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      // 0 = no app-side time limit (OS/device may still enforce its own).
      videoMaxDuration: 0,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      allowsEditing: false,
      cameraType: ImagePicker.CameraType.back,
    });

    if (result.canceled || !result.assets[0]) return null;

    const asset = result.assets[0];
    if (__DEV__) {
      console.log('[Chat Camera] Video recorded:', {
        uri: asset.uri,
        fileName: asset.fileName,
        duration: asset.duration,
      });
    }

    return assetToChatResult(asset, 'video');
  }, []);

  const openPhotoLibrary = useCallback(async (): Promise<ChatCameraResult | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showPermissionAlert(
        'Photos permission needed',
        'Allow photo library access to send photos and videos from your gallery.',
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
      allowsEditing: false,
      allowsMultipleSelection: false,
      preferredAssetRepresentationMode: 'current',
      exif: false,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    if (__DEV__) {
      console.log('[Chat Gallery] Media selected:', {
        uri: asset.uri,
        fileName: asset.fileName,
        type: asset.type,
        mimeType: asset.mimeType,
        duration: asset.duration,
      });
    }

    return assetToChatResult(asset, 'gallery');
  }, []);

  return { openCameraPhoto, openCameraVideo, openPhotoLibrary };
}
