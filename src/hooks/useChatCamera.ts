import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';

export type ChatCameraResult = {
  uri: string;
  fileName: string;
  fileSizeLabel: string;
};

export function useChatCamera() {
  const openCamera = useCallback(async (): Promise<ChatCameraResult | null> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Camera permission needed',
        'Allow camera access to take photos in chat.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => void Linking.openSettings() },
        ],
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    const fileName = asset.fileName ?? `photo-${Date.now()}.jpg`;
    const fileSizeLabel = asset.fileSize
      ? `${Math.max(1, Math.round(asset.fileSize / 1024))} KB`
      : '—';

    if (__DEV__) {
      console.log('[Chat Camera] Photo captured:', {
        uri: asset.uri,
        fileName,
        width: asset.width,
        height: asset.height,
      });
    }

    return {
      uri: asset.uri,
      fileName,
      fileSizeLabel,
    };
  }, []);

  return { openCamera };
}
