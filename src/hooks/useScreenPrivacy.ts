import * as ScreenCapture from 'expo-screen-capture';
import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * TEMP for client demo recording / screenshots.
 * Set to `true` again after demos to restore §7 screen privacy (FLAG_SECURE).
 */
export const SCREEN_PRIVACY_ENABLED = false;

/** Keys used across the app — each must be allowed to fully clear FLAG_SECURE. */
const KNOWN_PRIVACY_KEYS = [
  'default',
  'phi',
  'auth-login',
  'settings-profile',
  'notifications',
  'chat-inbox',
  'chat-conversation',
  'chat-create-group',
] as const;

/**
 * Ref-count iOS app-switcher blur so nested PHI screens
 * don't clear protection when one of them unmounts.
 */
let iosAppSwitcherHolders = 0;

async function allowAllKnownKeys() {
  await Promise.all(
    KNOWN_PRIVACY_KEYS.map((key) => ScreenCapture.allowScreenCaptureAsync(key).catch(() => {})),
  );
  if (Platform.OS === 'ios') {
    await ScreenCapture.disableAppSwitcherProtectionAsync().catch(() => {});
  }
}

/** Call once at app start while demos need screenshots/recordings. */
export function clearScreenPrivacyForDemo() {
  if (SCREEN_PRIVACY_ENABLED) return;
  void allowAllKnownKeys();
}

/**
 * §7 Screen privacy — blocks screenshots/recordings while mounted
 * (Android FLAG_SECURE via preventScreenCapture; iOS capture block + app-switcher blur).
 *
 * Disabled while SCREEN_PRIVACY_ENABLED is false (demo recording / screenshots).
 */
export function useScreenPrivacy(key = 'phi') {
  useEffect(() => {
    if (!SCREEN_PRIVACY_ENABLED) {
      void allowAllKnownKeys();
      return undefined;
    }

    void ScreenCapture.preventScreenCaptureAsync(key).catch(() => {});

    if (Platform.OS === 'ios') {
      iosAppSwitcherHolders += 1;
      if (iosAppSwitcherHolders === 1) {
        void ScreenCapture.enableAppSwitcherProtectionAsync(0.7).catch(() => {});
      }
    }

    return () => {
      void ScreenCapture.allowScreenCaptureAsync(key).catch(() => {});

      if (Platform.OS === 'ios') {
        iosAppSwitcherHolders = Math.max(0, iosAppSwitcherHolders - 1);
        if (iosAppSwitcherHolders === 0) {
          void ScreenCapture.disableAppSwitcherProtectionAsync().catch(() => {});
        }
      }
    };
  }, [key]);
}
