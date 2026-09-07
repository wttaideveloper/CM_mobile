import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export function useLoginAuthCooldown() {
  const [forgotResendCooldown, setForgotResendCooldown] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendCooldownEndsAtRef = useRef(0);
  const forgotResendCooldownEndsAtRef = useRef(0);

  const remainingSecondsUntil = useCallback((endsAt: number) => {
    if (endsAt <= 0) return 0;
    return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
  }, []);

  const startResendCooldown = useCallback((seconds: number) => {
    const endsAt = Date.now() + seconds * 1000;
    resendCooldownEndsAtRef.current = endsAt;
    setResendCooldown(seconds);
  }, []);

  const startForgotResendCooldown = useCallback((seconds: number) => {
    const endsAt = Date.now() + seconds * 1000;
    forgotResendCooldownEndsAtRef.current = endsAt;
    setForgotResendCooldown(seconds);
  }, []);

  const syncCooldownsFromWallClock = useCallback(() => {
    setResendCooldown(remainingSecondsUntil(resendCooldownEndsAtRef.current));
    setForgotResendCooldown(remainingSecondsUntil(forgotResendCooldownEndsAtRef.current));
  }, [remainingSecondsUntil]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;

    const timer = setTimeout(() => {
      setResendCooldown(remainingSecondsUntil(resendCooldownEndsAtRef.current));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown, remainingSecondsUntil]);

  useEffect(() => {
    if (forgotResendCooldown <= 0) return undefined;

    const timer = setTimeout(() => {
      setForgotResendCooldown(remainingSecondsUntil(forgotResendCooldownEndsAtRef.current));
    }, 1000);

    return () => clearTimeout(timer);
  }, [forgotResendCooldown, remainingSecondsUntil]);

  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        syncCooldownsFromWallClock();
      }
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [syncCooldownsFromWallClock]);

  return {
    forgotResendCooldown,
    resendCooldown,
    startResendCooldown,
    startForgotResendCooldown,
  };
}
