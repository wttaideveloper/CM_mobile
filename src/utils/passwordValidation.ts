import type { PasswordRequirements } from '@/types/auth.types';

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialCharacter: true,
  summary:
    'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
  tokenExpiry: {
    emailOtpSeconds: 600,
    emailOtpResendCooldownSeconds: 60,
    inviteLinkSeconds: 604800,
    passwordResetSeconds: 900,
  },
};

const SPECIAL_CHAR_PATTERN = /[^A-Za-z0-9]/;

export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS,
): string | null {
  if (password.length < requirements.minLength) {
    return `Password must be at least ${requirements.minLength} characters long.`;
  }

  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter.';
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    return 'Password must include at least one lowercase letter.';
  }

  if (requirements.requireNumber && !/\d/.test(password)) {
    return 'Password must include at least one number.';
  }

  if (requirements.requireSpecialCharacter && !SPECIAL_CHAR_PATTERN.test(password)) {
    return 'Password must include at least one special character.';
  }

  return null;
}
