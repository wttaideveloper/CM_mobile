import * as FileSystem from 'expo-file-system/legacy';

import { clearAuthSession } from '@/services/authSession.storage';
import { clearRememberedLogin } from '@/services/rememberedLogin.storage';

/**
 * App sandbox file — wiped when the user deletes the app.
 * iOS Keychain (SecureStore) often survives reinstall; this marker does not.
 */
const INSTALL_MARKER_PATH = `${FileSystem.documentDirectory ?? ''}invigorate.install.marker`;

/**
 * On a fresh install (no sandbox marker), clear any Keychain session left from a
 * previous install so the user must log in again.
 */
export async function clearStaleKeychainSessionOnFreshInstall(): Promise<void> {
  if (!FileSystem.documentDirectory) return;

  try {
    const info = await Promise.race([
      FileSystem.getInfoAsync(INSTALL_MARKER_PATH),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('install marker read timeout')), 3_000);
      }),
    ]);
    if (info.exists) return;

    await clearAuthSession().catch(() => {});
    await clearRememberedLogin().catch(() => {});
    await FileSystem.writeAsStringAsync(INSTALL_MARKER_PATH, '1').catch(() => {});

    if (__DEV__) {
      console.log(
        '[Auth] Fresh install detected — cleared Keychain session (require login)',
      );
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[Auth] Fresh-install Keychain clear failed:', error);
    }
  }
}
