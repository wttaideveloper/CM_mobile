import { Keyboard } from 'react-native';

import { type AuthMode } from '@/hooks/useLoginAuth.types';

type LoginAuthModeSetter = (mode: AuthMode) => void;

type LoginAuthModeResetters = {
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setName: (value: string) => void;
  setOtp: (value: string) => void;
  setAcceptedTerms: (value: boolean) => void;
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
    Keyboard.dismiss();
    setAuthMode('login');
    resetters.setEmail('');
    resetters.setPassword('');
    resetters.setName('');
    resetters.setOtp('');
    resetters.setAcceptedTerms(false);
    resetters.setForgotEmail('');
    resetters.setResetOtp('');
    resetters.setNewPassword('');
    resetters.setConfirmPassword('');
  };

  const openSignupMode = () => {
    Keyboard.dismiss();
    setAuthMode('signup');
    resetters.setEmail('');
    resetters.setPassword('');
    resetters.setName('');
    resetters.setOtp('');
    resetters.setAcceptedTerms(false);
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
    openSignupMode,
    openForgotMode,
    openVerifyResetMode,
    openResetPasswordMode,
  };
}
