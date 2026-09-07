import { type AuthMode } from '@/hooks/useLoginAuth.types';

type LoginAuthModeSetter = (mode: AuthMode) => void;

type LoginAuthModeResetters = {
  setName: (value: string) => void;
  setOtp: (value: string) => void;
  setForgotEmail: (value: string) => void;
  setResetOtp: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
};

export function createLoginAuthModeActions(
  setAuthMode: LoginAuthModeSetter,
  resetters: LoginAuthModeResetters,
) {
  const openVerifyMode = () => {
    resetters.setOtp('');
    setAuthMode('verify');
  };

  const openLoginMode = () => {
    setAuthMode('login');
    resetters.setName('');
    resetters.setOtp('');
    resetters.setForgotEmail('');
    resetters.setResetOtp('');
    resetters.setNewPassword('');
    resetters.setConfirmPassword('');
  };

  const openForgotMode = () => {
    resetters.setForgotEmail('');
    resetters.setResetOtp('');
    resetters.setNewPassword('');
    resetters.setConfirmPassword('');
    setAuthMode('forgot');
  };

  const openVerifyResetMode = () => {
    resetters.setResetOtp('');
    resetters.setNewPassword('');
    resetters.setConfirmPassword('');
    setAuthMode('verify-reset');
  };

  const openResetPasswordMode = () => {
    resetters.setNewPassword('');
    resetters.setConfirmPassword('');
    setAuthMode('reset-password');
  };

  return {
    openVerifyMode,
    openLoginMode,
    openForgotMode,
    openVerifyResetMode,
    openResetPasswordMode,
  };
}
