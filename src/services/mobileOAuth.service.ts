import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { API_CONFIG } from '@/config';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { SocialAuthProvider } from '@/types/auth.types';

WebBrowser.maybeCompleteAuthSession();

const log = (provider: SocialAuthProvider, step: string, ...args: unknown[]) => {
  console.log(`[Social OAuth:${provider}] ${step}`, ...args);
};

export class MobileOAuthCancelledError extends Error {
  constructor() {
    super('Social login was cancelled.');
    this.name = 'MobileOAuthCancelledError';
  }
}

export class MobileOAuthRedirectError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MobileOAuthRedirectError';
  }
}

function oauthPath(provider: SocialAuthProvider): string {
  return provider === 'google' ? ENDPOINTS.AUTH.MOBILE_GOOGLE : ENDPOINTS.AUTH.MOBILE_FACEBOOK;
}

/** Deep link that must match app.json scheme and backend FRONTEND_ORIGINS. */
export function getOAuthRedirectUri(): string {
  return API_CONFIG.OAUTH_FRONTEND_ORIGIN;
}

export function buildMobileOAuthUrl(
  provider: SocialAuthProvider,
  rememberMe: boolean,
): string {
  const params = new URLSearchParams({
    frontend_origin: getOAuthRedirectUri(),
    module: 'enterprise',
    rememberMe: rememberMe ? 'true' : 'false',
  });

  return `${API_CONFIG.AUTH_BASE_URL}${oauthPath(provider)}?${params.toString()}`;
}

function readQueryParam(url: string, key: string): string | null {
  try {
    const parsed = Linking.parse(url);
    const value = parsed.queryParams?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) {
      return value[0].trim();
    }
  } catch {
    // fall through to URL parsing
  }

  try {
    const match = url.match(new RegExp(`[?&#]${key}=([^&#]+)`));
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Opens system auth browser for Google/Facebook and returns he_session_code
 * from the deep-link redirect.
 */
export async function openMobileSocialLogin(
  provider: SocialAuthProvider,
  rememberMe: boolean,
): Promise<string> {
  log(provider, 'STEP 2 — build OAuth URL inputs', {
    authBaseUrl: API_CONFIG.AUTH_BASE_URL,
    path: oauthPath(provider),
    frontend_origin: getOAuthRedirectUri(),
    module: 'enterprise',
    rememberMe,
  });

  const authUrl = buildMobileOAuthUrl(provider, rememberMe);
  const redirectUri = getOAuthRedirectUri();

  log(provider, 'STEP 2 — OAuth start URL (open in browser)', authUrl);
  log(provider, 'STEP 2 — expected redirect deep link', redirectUri);

  log(provider, 'STEP 3 — calling WebBrowser.openAuthSessionAsync…');
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  const resultUrl = 'url' in result ? (result as { url?: string }).url : undefined;
  log(provider, 'STEP 3 — WebBrowser result', {
    type: result.type,
    fullResult: result,
    url: resultUrl ?? null,
  });

  if (result.type === 'cancel' || result.type === 'dismiss') {
    log(provider, 'STEP 3 — user cancelled / dismissed browser', { type: result.type });
    throw new MobileOAuthCancelledError();
  }

  if (result.type !== 'success' || !resultUrl) {
    log(provider, 'STEP 3 — FAILED — no success redirect URL', {
      type: result.type,
      result,
    });
    throw new MobileOAuthRedirectError(
      'Social login did not return to the app. Ask backend to allowlist the app deep link.',
    );
  }

  log(provider, 'STEP 4 — parsing redirect URL for he_session_code', resultUrl);

  const sessionCode = readQueryParam(resultUrl, 'he_session_code');
  const error = readQueryParam(resultUrl, 'error');
  const description = readQueryParam(resultUrl, 'error_description');

  log(provider, 'STEP 4 — parsed redirect params', {
    has_he_session_code: Boolean(sessionCode),
    he_session_code_preview: sessionCode
      ? `${sessionCode.slice(0, 8)}…(${sessionCode.length} chars)`
      : null,
    error,
    error_description: description,
  });

  if (!sessionCode) {
    console.warn(
      `[Social OAuth:${provider}] STEP 4 — FAILED — missing he_session_code. Full redirect:`,
      resultUrl,
    );
    throw new MobileOAuthRedirectError(
      description || error || 'Missing he_session_code in OAuth redirect.',
    );
  }

  log(provider, 'STEP 4 — OK — he_session_code received');
  return sessionCode;
}
