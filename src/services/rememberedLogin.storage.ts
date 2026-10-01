import * as SecureStore from 'expo-secure-store';

const REMEMBERED_LOGIN_KEY = 'invigorate.auth.remembered-login';

export type RememberedLogin = {
  email: string;
};

export async function saveRememberedLogin(email: string): Promise<void> {
  const trimmed = email.trim();
  if (!trimmed) {
    await clearRememberedLogin();
    return;
  }
  await SecureStore.setItemAsync(
    REMEMBERED_LOGIN_KEY,
    JSON.stringify({ email: trimmed } satisfies RememberedLogin),
  );
}

export async function loadRememberedLogin(): Promise<RememberedLogin | null> {
  const raw = await SecureStore.getItemAsync(REMEMBERED_LOGIN_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as RememberedLogin;
    const email = parsed.email?.trim();
    if (!email) return null;
    return { email };
  } catch {
    return null;
  }
}

export async function clearRememberedLogin(): Promise<void> {
  await SecureStore.deleteItemAsync(REMEMBERED_LOGIN_KEY);
}
