import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'invigorate.auth.session';

export type StoredAuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export async function saveAuthSession(session: StoredAuthSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function loadAuthSession(): Promise<StoredAuthSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredAuthSession;
    if (!parsed.accessToken?.trim() || !parsed.refreshToken?.trim()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
