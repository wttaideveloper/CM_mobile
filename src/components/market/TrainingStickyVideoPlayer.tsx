import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

import {
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/market/marketTrainingData';
import { API_CONFIG } from '@/config';
import { useAuthStore } from '@/stores/auth.store';
import {
  asPlainText,
  clampDisplayText,
  resolveAbsoluteApiUrl,
} from '@/utils/trainingLessonMedia';
import { c, NU } from '@/utils/newUiCompact';

type Props = {
  url: string;
  title: string;
  subtitle?: string;
  /** When false, skip Bearer headers (local downloaded files). Default: true for remote URLs. */
  requiresAuth?: boolean;
  /** Seek here once after load (resume mid-video). */
  initialSeekSeconds?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onWatchPercent?: (percent: number) => void;
  onPlaybackTime?: (currentSeconds: number, durationSeconds: number) => void;
  onClose?: () => void;
};

function isLocalMediaUri(uri: string): boolean {
  const value = uri.trim().toLowerCase();
  return (
    value.startsWith('file:') ||
    value.startsWith('content:') ||
    value.startsWith('asset:') ||
    value.startsWith('ph:') ||
    value.startsWith('assets-library:')
  );
}

function isSignedOrPublicCdnUrl(uri: string): boolean {
  if (
    /[?&](X-Amz-|X-Goog-Algorithm|Signature=|Expires=|Policy=|Key-Pair-Id=)/i.test(
      uri,
    )
  ) {
    return true;
  }
  try {
    const host = new URL(uri).hostname.toLowerCase();
    return (
      host.includes('amazonaws.com') ||
      host.includes('cloudfront.net') ||
      host.includes('youtube.com') ||
      host.includes('youtu.be') ||
      host.includes('vimeo.com')
    );
  } catch {
    return false;
  }
}

function shouldAttachAuthHeader(uri: string): boolean {
  if (isLocalMediaUri(uri)) return false;
  if (isSignedOrPublicCdnUrl(uri)) return false;
  try {
    const parsed = new URL(uri);
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname)) return true;
    if (parsed.pathname.includes('/api/v1/trainings/upload')) return true;
    if (parsed.pathname.startsWith('/api/v1/')) return true;
    const mediaHost = parsed.host.toLowerCase();
    const apiHost = new URL(API_CONFIG.BASE_URL).host.toLowerCase();
    const authHost = new URL(API_CONFIG.AUTH_BASE_URL).host.toLowerCase();
    if (mediaHost === apiHost || mediaHost === authHost) return true;
  } catch {
    return true;
  }
  return true;
}

function inferContentType(uri: string): 'auto' | 'hls' | 'progressive' {
  const path = uri.split('?')[0]?.toLowerCase() ?? '';
  if (path.includes('.m3u8') || path.endsWith('.m3u')) return 'hls';
  if (/\.(mp4|m4v|mov)(\b|$)/.test(path)) return 'progressive';
  return 'auto';
}

/**
 * Sticky course player — keep VideoView mounted and use native controls.
 * Android sticky headers need TextureView or the picture goes black while audio plays.
 */
export function TrainingStickyVideoPlayer({
  url,
  title,
  subtitle,
  requiresAuth,
  initialSeekSeconds,
  onWatchPercent,
  onPlaybackTime,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [keyboardUp, setKeyboardUp] = useState(false);
  const needsAuth = requiresAuth ?? shouldAttachAuthHeader(url);
  const didSeekRef = useRef(false);
  const loadingSourceRef = useRef(false);
  const bufferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const player = useVideoPlayer(null, (instance) => {
    instance.loop = false;
    instance.muted = false;
    instance.timeUpdateEventInterval = 0.5;
    instance.bufferOptions = {
      preferredForwardBufferDuration: Platform.OS === 'android' ? 12 : 0,
      minBufferForPlayback: 0.5,
      prioritizeTimeOverSizeThreshold: true,
      waitsToMinimizeStalling: false,
    };
  });

  useEffect(() => {
    didSeekRef.current = false;
    setLoading(true);
    setReady(false);
    setBuffering(false);
    setLoadError(null);
  }, [url, initialSeekSeconds, reloadToken]);

  useEffect(() => {
    return () => {
      if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
      try {
        player.pause();
      } catch {
        // Native player may already be released.
      }
    };
  }, [player]);

  useEffect(() => {
    if (Platform.OS !== 'ios') return undefined;
    const pauseForKeyboard = () => {
      try {
        player.pause();
      } catch {
        // Ignore.
      }
      setKeyboardUp(true);
    };
    const resumeAfterKeyboard = () => setKeyboardUp(false);
    const show = Keyboard.addListener('keyboardWillShow', pauseForKeyboard);
    const hide = Keyboard.addListener('keyboardWillHide', resumeAfterKeyboard);
    return () => {
      show.remove();
      hide.remove();
    };
  }, [player]);

  useEffect(() => {
    let cancelled = false;
    loadingSourceRef.current = true;

    const playUri = async (uri: string, token?: string): Promise<boolean> => {
      try {
        const settled = new Promise<boolean>((resolve) => {
          const timer = setTimeout(() => {
            sub.remove();
            resolve(player.status !== 'error');
          }, 10_000);
          const sub = player.addListener('statusChange', ({ status }) => {
            if (status === 'readyToPlay') {
              clearTimeout(timer);
              sub.remove();
              resolve(true);
            } else if (status === 'error') {
              clearTimeout(timer);
              sub.remove();
              resolve(false);
            }
          });
        });
        await player.replaceAsync({
          uri,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          contentType: inferContentType(uri),
        });
        if (player.status === 'readyToPlay') return true;
        if (player.status === 'error') return false;
        return await settled;
      } catch {
        return false;
      }
    };

    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const trimmed = asPlainText(url);
        if (
          !trimmed ||
          trimmed.length > 8_000 ||
          trimmed.startsWith('data:') ||
          (!/^https?:\/\//i.test(trimmed) && !isLocalMediaUri(trimmed))
        ) {
          setLoadError('This video cannot be played.');
          setLoading(false);
          return;
        }

        const playUrl = resolveAbsoluteApiUrl(trimmed) || trimmed;

        let token: string | undefined;
        if (needsAuth && !isLocalMediaUri(playUrl)) {
          token = await useAuthStore.getState().ensureAccessToken(false);
          if (cancelled) return;
          if (!token) {
            setLoadError('Sign in again to watch this video.');
            setLoading(false);
            return;
          }
        }

        let loaded = await playUri(playUrl, token);
        if (!loaded && needsAuth && token) {
          const refreshed = await useAuthStore.getState().ensureAccessToken(true);
          if (cancelled) return;
          loaded = await playUri(playUrl, refreshed);
        }

        if (!loaded) {
          throw new Error('Could not load this video.');
        }

        const seekTo = initialSeekSeconds ?? 0;
        if (seekTo > 1 && !didSeekRef.current) {
          player.currentTime = seekTo;
          didSeekRef.current = true;
        }
        // Don't play yet — VideoView mounts after ready; play in a follow-up effect.
        if (!cancelled) {
          setLoadError(null);
          setLoading(false);
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setLoadError('Could not play this video. Tap retry.');
          setLoading(false);
        }
      } finally {
        loadingSourceRef.current = false;
      }
    };

    void load();
    return () => {
      cancelled = true;
      loadingSourceRef.current = false;
    };
  }, [url, player, needsAuth, initialSeekSeconds, reloadToken]);

  // Start playback only once the VideoView is on screen (after loader hides).
  useEffect(() => {
    if (!ready || loading || loadError || keyboardUp) return;
    try {
      player.muted = false;
      player.play();
    } catch {
      // Ignore.
    }
  }, [ready, loading, loadError, keyboardUp, player, url, reloadToken]);

  useEventListener(player, 'statusChange', ({ status, error }) => {
    if (status === 'error') {
      setLoadError(error?.message?.trim() || 'Video failed to play.');
      setLoading(false);
      setBuffering(false);
      setReady(false);
      return;
    }

    if (loadingSourceRef.current) return;

    if (status === 'readyToPlay') {
      if (bufferTimerRef.current) {
        clearTimeout(bufferTimerRef.current);
        bufferTimerRef.current = null;
      }
      setBuffering(false);
      if (player.duration > 0) {
        setReady(true);
      }
      return;
    }

    if (status === 'loading') {
      if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
      bufferTimerRef.current = setTimeout(() => {
        setBuffering(true);
        bufferTimerRef.current = null;
      }, 200);
    }
  });

  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    const duration = player.duration;
    if (duration > 0) {
      setReady(true);
    }
    onPlaybackTime?.(currentTime, duration > 0 ? duration : 0);
    if (duration > 0) {
      onWatchPercent?.(
        Math.min(100, Math.round((currentTime / duration) * 100)),
      );
    }
  });

  useEventListener(player, 'sourceLoad', ({ duration }) => {
    if (duration > 0) {
      setReady(true);
    }
  });

  const safeTitle = clampDisplayText(asPlainText(title, 'Lesson'), 120);
  const safeSubtitle = clampDisplayText(asPlainText(subtitle), 160);
  // Full cover while source loads — hides Android's tiny bottom native spinner.
  const showInitialLoader = !loadError && !keyboardUp && (loading || !ready);
  // Light mid-play buffer chip after the picture is up.
  const showBufferPill =
    !loadError && !keyboardUp && ready && buffering && !loading;
  // Do not mount VideoView under the loader — Android native surface breaks
  // absolute overlay layout and pushes the spinner to the bottom edge.
  const showVideo = !keyboardUp && !showInitialLoader && !loadError;

  return (
    <View style={styles.wrap} collapsable={false}>
      <View style={styles.stage} collapsable={false}>
        {showVideo ? (
          <VideoView
            key={`course-video-${url}-${reloadToken}`}
            style={styles.video}
            player={player}
            nativeControls
            contentFit="contain"
            surfaceType={
              Platform.OS === 'android' ? 'textureView' : 'surfaceView'
            }
            fullscreenOptions={{
              enable: true,
              orientation: 'landscape',
            }}
          />
        ) : null}

        {keyboardUp ? (
          <View style={styles.initialLoader}>
            <Text style={styles.stateText}>Paused while typing</Text>
          </View>
        ) : null}

        {showInitialLoader ? (
          <View
            style={styles.initialLoader}
            collapsable={false}
            accessibilityRole="progressbar"
            accessibilityLabel="Loading video"
          >
            <View style={styles.loaderInner}>
              <ActivityIndicator color={TRAINING_GREEN} size="large" />
              <Text style={styles.spinnerLabel}>Loading video…</Text>
            </View>
          </View>
        ) : null}

        {showBufferPill ? (
          <View
            style={styles.spinnerOverlay}
            pointerEvents="none"
            accessibilityRole="progressbar"
            accessibilityLabel="Buffering"
          >
            <View style={styles.spinnerPill}>
              <ActivityIndicator color="#FFFFFF" size="large" />
              <Text style={styles.spinnerLabel}>Buffering…</Text>
            </View>
          </View>
        ) : null}

        {!loading && loadError ? (
          <View style={styles.centerState}>
            <Text style={styles.stateText}>{loadError}</Text>
            <Pressable
              onPress={() => setReloadToken((n) => n + 1)}
              style={styles.retryBtn}
              accessibilityRole="button"
              accessibilityLabel="Retry video"
            >
              <Text style={styles.retryBtnText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaCopy}>
          <Text style={styles.nowPlaying}>Now playing</Text>
          <Text style={styles.title} numberOfLines={2}>
            {safeTitle}
          </Text>
          {safeSubtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {safeSubtitle}
            </Text>
          ) : null}
        </View>
        {onClose ? (
          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close player"
          >
            <Text style={styles.closeBtnText}>Close</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#0b1f18',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    flexShrink: 0,
    zIndex: 20,
    elevation: 20,
  },
  stage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative',
    zIndex: 21,
    elevation: 21,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  initialLoader: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    zIndex: 30,
    elevation: 30,
  },
  loaderInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(12, 10),
  },
  spinnerOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
    zIndex: 25,
    elevation: 25,
  },
  spinnerPill: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(10, 8),
    paddingHorizontal: c(18, 14),
    paddingVertical: c(14, 12),
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  spinnerLabel: {
    color: '#FFFFFF',
    fontSize: c(13, 12),
    fontWeight: '700',
    textAlign: 'center',
  },
  centerState: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(8, 6),
    paddingHorizontal: c(20, 16),
    backgroundColor: 'rgba(18,40,32,0.92)',
    zIndex: 35,
    elevation: 35,
  },
  stateText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: c(13, 12),
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: c(4, 2),
    paddingHorizontal: c(14, 12),
    paddingVertical: c(7, 6),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: TRAINING_GREEN,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: c(12, 11),
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: c(10, 8),
    paddingHorizontal: c(14, 12),
    paddingTop: c(10, 8),
    paddingBottom: c(10, 8),
    backgroundColor: '#FFFFFF',
  },
  metaCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  nowPlaying: {
    fontSize: c(11, 10),
    fontWeight: '700',
    color: TRAINING_GREEN,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: c(15, 14),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  subtitle: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
  },
  closeBtn: {
    paddingHorizontal: c(10, 8),
    paddingVertical: c(6, 5),
    borderRadius: 999,
    backgroundColor: '#eef3f0',
  },
  closeBtnText: {
    fontSize: c(12, 11),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
});
