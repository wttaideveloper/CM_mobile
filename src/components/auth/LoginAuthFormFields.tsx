import type { AuthMode } from '@/hooks/useLoginAuth.types';

import { LoginAuthAccountFields } from '@/components/auth/LoginAuthAccountFields';
import { LoginAuthFormActions } from '@/components/auth/LoginAuthFormActions';
import { LoginAuthRecoveryFields } from '@/components/auth/LoginAuthRecoveryFields';
import type { PasswordRequirements } from '@/types/auth.types';

type LoginAuthFormFieldsProps = {
  authMode: AuthMode;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  otp: string;
  setOtp: (value: string) => void;
  forgotEmail: string;
  setForgotEmail: (value: string) => void;
  resetOtp: string;
  setResetOtp: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  isPasswordVisible: boolean;
  setIsPasswordVisible: (updater: (prev: boolean) => boolean) => void;
  isNewPasswordVisible: boolean;
  setIsNewPasswordVisible: (updater: (prev: boolean) => boolean) => void;
  isConfirmPasswordVisible: boolean;
  setIsConfirmPasswordVisible: (updater: (prev: boolean) => boolean) => void;
  rememberMe: boolean;
  setRememberMe: (updater: (prev: boolean) => boolean) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (updater: (prev: boolean) => boolean) => void;
  resendCooldown: number;
  forgotResendCooldown: number;
  isResending: boolean;
  isForgotPasswordSending: boolean;
  passwordRequirements: PasswordRequirements;
  isSubmitting: boolean;
  primaryButtonLabel: string;
  onPrimaryAction: () => void;
  onOpenForgotMode: () => void;
  onResendVerification: () => void;
  onResendResetCode: () => void;
  onOpenLoginMode: () => void;
  onOpenSignupMode: () => void;
  /** Signup: scroll heading under hero when Full Name is focused. */
  onSignupNameFocus?: () => void;
  onSocialLogin?: (provider: 'google' | 'facebook') => void;
};

export function LoginAuthFormFields(props: LoginAuthFormFieldsProps) {
  return (
    <>
      <LoginAuthRecoveryFields
        authMode={props.authMode}
        forgotEmail={props.forgotEmail}
        setForgotEmail={props.setForgotEmail}
        resetOtp={props.resetOtp}
        setResetOtp={props.setResetOtp}
        newPassword={props.newPassword}
        setNewPassword={props.setNewPassword}
        confirmPassword={props.confirmPassword}
        setConfirmPassword={props.setConfirmPassword}
        isNewPasswordVisible={props.isNewPasswordVisible}
        setIsNewPasswordVisible={props.setIsNewPasswordVisible}
        isConfirmPasswordVisible={props.isConfirmPasswordVisible}
        setIsConfirmPasswordVisible={props.setIsConfirmPasswordVisible}
        forgotResendCooldown={props.forgotResendCooldown}
        isForgotPasswordSending={props.isForgotPasswordSending}
        passwordRequirements={props.passwordRequirements}
        onResendResetCode={props.onResendResetCode}
      />

      <LoginAuthAccountFields
        authMode={props.authMode}
        email={props.email}
        setEmail={props.setEmail}
        password={props.password}
        setPassword={props.setPassword}
        name={props.name}
        setName={props.setName}
        otp={props.otp}
        setOtp={props.setOtp}
        isPasswordVisible={props.isPasswordVisible}
        setIsPasswordVisible={props.setIsPasswordVisible}
        rememberMe={props.rememberMe}
        setRememberMe={props.setRememberMe}
        acceptedTerms={props.acceptedTerms}
        setAcceptedTerms={props.setAcceptedTerms}
        resendCooldown={props.resendCooldown}
        isResending={props.isResending}
        onOpenForgotMode={props.onOpenForgotMode}
        onResendVerification={props.onResendVerification}
        onSignupNameFocus={props.onSignupNameFocus}
      />

      <LoginAuthFormActions
        authMode={props.authMode}
        isSubmitting={props.isSubmitting}
        primaryButtonLabel={props.primaryButtonLabel}
        onPrimaryAction={props.onPrimaryAction}
        onOpenLoginMode={props.onOpenLoginMode}
        onOpenSignupMode={props.onOpenSignupMode}
        onSocialLogin={props.onSocialLogin}
      />
    </>
  );
}
