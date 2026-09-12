import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

/**
 * Remote push via expo-notifications is unavailable in Expo Go on Android (SDK 53+).
 * Importing the package there throws at module load — skip push entirely in that environment.
 */
export function isRemotePushSupported(): boolean {
  return !(Platform.OS === 'android' && isRunningInExpoGo());
}
