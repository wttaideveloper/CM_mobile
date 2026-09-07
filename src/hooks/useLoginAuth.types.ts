export type AuthMode = 'login' | 'signup' | 'verify' | 'forgot' | 'verify-reset' | 'reset-password';

export function isEmailNotVerifiedMessage(message: string): boolean {
  return /not verified|verify your email|email verification|check your inbox for the verification/i.test(
    message,
  );
}
