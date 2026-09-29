import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useEventListener } from 'expo';
import * as FileSystem from 'expo-file-system/legacy';
import { useVideoPlayer, VideoView } from 'expo-video';

import {
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/market/marketTrainingData';
import { API_CONFIG } from '@/config';
import { useAuthStore } from '@/stores/auth.store';
import { c, NU } from '@/utils/newUiCompact';

const SPEED_STEPS = [0.75, 1, 1.25, 1.5, 2] as const;

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
  /** Raw playback clock for progress save APIs. */
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

function isIpHostname(hostname: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
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

/**
 * Training uploads live on the API host or a raw IP (http://13.x.x.x/api/v1/...).
 * Those endpoints return 401 unless Bearer is sent. Do not skip auth just
 * because the host differs from chat.wisdomtooth.tech.
 */
function shouldAttachAuthHeader(uri: string): boolean {
  if (isLocalMediaUri(uri)) return false;
  if (isSignedOrPublicCdnUrl(uri)) return false;
  try {
    const parsed = new URL(uri);
    if (isIpHostname(parsed.hostname)) return true;
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

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
  }
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function inferContentType(uri: string): 'auto' | 'hls' | 'progressive' {
  const path = uri.split('?')[0]?.toLowerCase() ?? '';
  if (path.includes('.m3u8') || path.endsWith('.m3u')) return 'hls';
  if (/\.(mp4|m4v|mov)(\b|$)/.test(path)) return 'progressive';
  return 'auto';
}

/** Same upload path on the official HTTPS API host, when media is on a raw IP. */
function officialApiMediaUrl(uri: string): string | null {
  try {
    const parsed = new URL(uri);
    if (!parsed.pathname.includes('/api/v1/')) return null;
    const base = new URL(API_CONFIG.BASE_URL);
    if (parsed.host.toLowerCase() === base.host.toLowerCase()) return null;
    return `${base.origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

/**
 * Udemy-style sticky course player: auth-aware source, native controls,
 * speed cycle, prev/next, and landscape fullscreen.
 */
export function TrainingStickyVideoPlayer({
  url,
  title,
  subtitle,
  requiresAuth,
  initialSeekSeconds,
  hasPrevious = false,
  hasNext = false,
  onPrevious,
  onNext,
  onWatchPercent,
  onPlaybackTime,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const needsAuth = requiresAuth ?? shouldAttachAuthHeader(url);
  const didSeekRef = useRef(false);
  const loadingSourceRef = useRef(false);
  const videoRef = useRef<VideoView>(null);
  const seekTrackRef = useRef<View>(null);
  const scrubbingRef = useRef(false);
  const durationRef = useRef(0);
  const trackWidthRef = useRef(0);
  const trackPageXRef = useRef(0);
  const pendingSeekRef = useRef<number | null>(null);
  const pendingSeekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const player = useVideoPlayer(null, (instance) => {
    instance.loop = false;
    // Faster clock + keyframe-tolerant seeks so scrub/tap feels like YouTube.
    instance.timeUpdateEventInterval = 0.2;
    instance.seekTolerance = { toleranceBefore: 2, toleranceAfter: 2 };
    instance.bufferOptions = {
      preferredForwardBufferDuration: Platform.OS === 'android' ? 12 : 0,
      minBufferForPlayback: 0.4,
      prioritizeTimeOverSizeThreshold: true,
      waitsToMinimizeStalling: false,
    };
  });

  useEffect(() => {
    didSeekRef.current = false;
    setDisplayTime(0);
    setDuration(0);
    durationRef.current = 0;
    scrubbingRef.current = false;
    setScrubbing(false);
    pendingSeekRef.current = null;
    if (pendingSeekTimerRef.current) {
      clearTimeout(pendingSeekTimerRef.current);
      pendingSeekTimerRef.current = null;
    }
  }, [url, initialSeekSeconds]);

  useEffect(() => {
    return () => {
      if (pendingSeekTimerRef.current) {
        clearTimeout(pendingSeekTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadingSourceRef.current = true;

    const playUri = async (
      uri: string,
      token?: string,
    ): Promise<boolean> => {
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
      setPlaying(false);
      try {
        let token: string | undefined;
        if (needsAuth) {
          token = await useAuthStore.getState().ensureAccessToken(false);
          if (cancelled) return;
          if (!token) {
            setLoadError('Sign in again to watch this video.');
            setLoading(false);
            return;
          }
        }

        const uris = [url];
        const apiMirror = officialApiMediaUrl(url);
        if (apiMirror) uris.push(apiMirror);

        let loaded = false;
        for (const uri of uris) {
          if (cancelled) return;
          loaded = await playUri(uri, token);
          if (loaded) break;
        }

        if (!loaded && needsAuth && token) {
          const refreshed = await useAuthStore.getState().ensureAccessToken(true);
          if (cancelled) return;
          token = refreshed;
          loaded = await playUri(url, token);
        }

        if (
          !loaded &&
          Platform.OS === 'ios' &&
          needsAuth &&
          token &&
          inferContentType(url) !== 'hls'
        ) {
          const dest = `${FileSystem.cacheDirectory}training-play-${Date.now()}.mp4`;
          const downloaded = await FileSystem.downloadAsync(url, dest, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (cancelled) return;
          if (downloaded.status === 200) {
            loaded = await playUri(downloaded.uri);
          }
        }

        if (!loaded) {
          throw new Error('Could not load this video.');
        }

        player.playbackRate = SPEED_STEPS[speedIndex];
        const seekTo = initialSeekSeconds ?? 0;
        if (seekTo > 1 && !didSeekRef.current && player.status === 'readyToPlay') {
          pendingSeekRef.current = seekTo;
          setDisplayTime(seekTo);
          player.currentTime = seekTo;
          didSeekRef.current = true;
        }
        player.play();
        if (!cancelled) {
          setLoadError(null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setLoadError(
            'Could not play this video. Sign in again, or tap retry.',
          );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speed applied separately
  }, [url, player, needsAuth, initialSeekSeconds, reloadToken]);

  useEventListener(player, 'statusChange', ({ status, error }) => {
    if (loadingSourceRef.current) return;
    if (status === 'error') {
      setLoadError(
        error?.message?.trim() ||
          'Video failed to play. The file may need authentication.',
      );
      setLoading(false);
    }
  });

  useEventListener(player, 'playingChange', ({ isPlaying }) => {
    setPlaying(isPlaying);
  });

  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    const nextDuration = player.duration;
    if (!nextDuration || nextDuration <= 0) return;
    durationRef.current = nextDuration;
    setDuration(nextDuration);

    const pending = pendingSeekRef.current;
    // Ignore stale ticks from the old position until the seek actually lands.
    if (pending != null && Math.abs(currentTime - pending) > 2.5) {
      const percent = Math.min(100, Math.round((pending / nextDuration) * 100));
      onWatchPercent?.(percent);
      onPlaybackTime?.(pending, nextDuration);
      return;
    }
    if (pending != null) {
      pendingSeekRef.current = null;
      if (pendingSeekTimerRef.current) {
        clearTimeout(pendingSeekTimerRef.current);
        pendingSeekTimerRef.current = null;
      }
    }

    if (!scrubbingRef.current) {
      setDisplayTime(currentTime);
    }
    const percent = Math.min(100, Math.round((currentTime / nextDuration) * 100));
    onWatchPercent?.(percent);
    onPlaybackTime?.(currentTime, nextDuration);
  });

  const speedLabel = useMemo(() => {
    const rate = SPEED_STEPS[speedIndex];
    return rate === 1 ? '1x' : `${rate}x`;
  }, [speedIndex]);

  const cycleSpeed = () => {
    const next = (speedIndex + 1) % SPEED_STEPS.length;
    setSpeedIndex(next);
    player.playbackRate = SPEED_STEPS[next];
  };

  const applySeek = (seconds: number) => {
    const max = durationRef.current || player.duration || 0;
    const next = Math.max(0, Math.min(max, seconds));
    pendingSeekRef.current = next;
    setDisplayTime(next);
    player.currentTime = next;
    if (pendingSeekTimerRef.current) clearTimeout(pendingSeekTimerRef.current);
    pendingSeekTimerRef.current = setTimeout(() => {
      pendingSeekRef.current = null;
      pendingSeekTimerRef.current = null;
    }, 4000);
  };

  const beginScrub = () => {
    if (scrubbingRef.current) return;
    scrubbingRef.current = true;
    setScrubbing(true);
    player.scrubbingModeOptions = {
      scrubbingModeEnabled: true,
      allowSkippingMediaCodecFlush: true,
      enableDynamicScheduling: true,
      increaseCodecOperatingRate: true,
      useDecodeOnlyFlag: true,
    };
    if (Platform.OS === 'ios') player.pause();
  };

  const endScrub = () => {
    if (!scrubbingRef.current) return;
    player.scrubbingModeOptions = { scrubbingModeEnabled: false };
    scrubbingRef.current = false;
    setScrubbing(false);
    player.play();
  };

  const seekFromPageX = (pageX: number) => {
    const width = trackWidthRef.current;
    const max = durationRef.current || player.duration || 0;
    if (width <= 0 || max <= 0) return;
    const ratio = Math.max(0, Math.min(1, (pageX - trackPageXRef.current) / width));
    applySeek(ratio * max);
  };

  const seekBarResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        beginScrub();
        seekFromPageX(event.nativeEvent.pageX);
      },
      onPanResponderMove: (event) => {
        seekFromPageX(event.nativeEvent.pageX);
      },
      onPanResponderRelease: () => {
        endScrub();
      },
      onPanResponderTerminate: () => {
        endScrub();
      },
    }),
  ).current;

  const seekBy = (delta: number) => {
    applySeek((scrubbingRef.current ? displayTime : player.currentTime) + delta);
  };

  const togglePlay = () => {
    if (player.playing) player.pause();
    else player.play();
  };

  const openLandscapeFullscreen = () => {
    if (loading || loadError) return;
    void videoRef.current?.enterFullscreen();
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.stage}>
        <VideoView
          ref={videoRef}
          style={styles.video}
          player={player}
          nativeControls
          contentFit="contain"
          buttonOptions={{ showBottomBar: false }}
          fullscreenOptions={{
            enable: true,
            orientation: 'landscape',
          }}
        />
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.stateText}>Loading video…</Text>
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
        {!loading && !loadError ? (
          <Pressable
            style={styles.fullscreenFab}
            onPress={openLandscapeFullscreen}
            accessibilityRole="button"
            accessibilityLabel="Fullscreen landscape"
            hitSlop={8}
          >
            <Text style={styles.fullscreenFabText}>Full</Text>
          </Pressable>
        ) : null}
      </View>

      {!loading && !loadError ? (
        <View style={styles.seekRow}>
          <Text style={styles.seekClock}>{formatClock(displayTime)}</Text>
          <View
            ref={seekTrackRef}
            style={styles.seekHit}
            onLayout={(event) => {
              trackWidthRef.current = event.nativeEvent.layout.width;
              seekTrackRef.current?.measureInWindow((x) => {
                trackPageXRef.current = x;
              });
            }}
            {...seekBarResponder.panHandlers}
            accessibilityRole="adjustable"
            accessibilityLabel="Video progress"
            accessibilityValue={{
              min: 0,
              max: Math.round(duration),
              now: Math.round(displayTime),
            }}
          >
            <View style={styles.seekTrack}>
              <View
                style={[
                  styles.seekFill,
                  {
                    width: `${
                      duration > 0
                        ? Math.min(100, (displayTime / duration) * 100)
                        : 0
                    }%`,
                  },
                ]}
              />
              <View
                style={[
                  styles.seekThumb,
                  {
                    left: `${
                      duration > 0
                        ? Math.min(100, (displayTime / duration) * 100)
                        : 0
                    }%`,
                    transform: [{ scale: scrubbing ? 1.25 : 1 }],
                  },
                ]}
              />
            </View>
          </View>
          <Text style={styles.seekClock}>{formatClock(duration)}</Text>
        </View>
      ) : null}

      <View style={styles.metaRow}>
        <View style={styles.metaCopy}>
          <Text style={styles.nowPlaying}>Now playing</Text>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
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

      <View style={styles.toolbar}>
        <Pressable
          style={[styles.toolBtn, !hasPrevious && styles.toolBtnDisabled]}
          onPress={onPrevious}
          disabled={!hasPrevious}
          accessibilityRole="button"
          accessibilityLabel="Previous lesson"
        >
          <Text style={styles.toolBtnText}>Prev</Text>
        </Pressable>

        <Pressable
          style={styles.toolBtn}
          onPress={() => seekBy(-15)}
          accessibilityRole="button"
          accessibilityLabel="Rewind 15 seconds"
        >
          <Text style={styles.toolBtnText}>−15s</Text>
        </Pressable>

        <Pressable
          style={styles.playBtn}
          onPress={togglePlay}
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause' : 'Play'}
        >
          <Text style={styles.playBtnText}>{playing ? 'Pause' : 'Play'}</Text>
        </Pressable>

        <Pressable
          style={styles.toolBtn}
          onPress={() => seekBy(15)}
          accessibilityRole="button"
          accessibilityLabel="Forward 15 seconds"
        >
          <Text style={styles.toolBtnText}>+15s</Text>
        </Pressable>

        <Pressable
          style={[styles.toolBtn, !hasNext && styles.toolBtnDisabled]}
          onPress={onNext}
          disabled={!hasNext}
          accessibilityRole="button"
          accessibilityLabel="Next lesson"
        >
          <Text style={styles.toolBtnText}>Next</Text>
        </Pressable>

        <Pressable
          style={styles.speedBtn}
          onPress={cycleSpeed}
          accessibilityRole="button"
          accessibilityLabel={`Playback speed ${speedLabel}`}
        >
          <Text style={styles.speedBtnText}>{speedLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#0b1f18',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  stage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  seekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    paddingHorizontal: c(14, 12),
    paddingTop: c(8, 6),
    backgroundColor: '#FFFFFF',
  },
  seekClock: {
    minWidth: c(36, 32),
    fontSize: c(11, 10),
    fontWeight: '700',
    color: TRAINING_TEAL,
    fontVariant: ['tabular-nums'],
  },
  seekHit: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
  },
  seekTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d7e2dc',
    overflow: 'visible',
  },
  seekFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: TRAINING_GREEN,
  },
  seekThumb: {
    position: 'absolute',
    top: -5,
    marginLeft: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: TRAINING_GREEN,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  fullscreenFab: {
    position: 'absolute',
    top: c(10, 8),
    right: c(10, 8),
    zIndex: 6,
    paddingHorizontal: c(12, 10),
    paddingVertical: c(7, 6),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  fullscreenFabText: {
    fontSize: c(12, 11),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  centerState: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(8, 6),
    paddingHorizontal: c(20, 16),
    backgroundColor: '#122820',
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
    paddingBottom: c(6, 4),
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(6, 5),
    paddingHorizontal: c(12, 10),
    paddingBottom: c(10, 8),
    backgroundColor: '#FFFFFF',
  },
  toolBtn: {
    paddingHorizontal: c(8, 7),
    paddingVertical: c(7, 6),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#eef3f0',
  },
  toolBtnDisabled: {
    opacity: 0.4,
  },
  toolBtnText: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  playBtn: {
    paddingHorizontal: c(12, 10),
    paddingVertical: c(7, 6),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: TRAINING_GREEN,
  },
  playBtnText: {
    fontSize: c(11.5, 10.5),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  speedBtn: {
    marginLeft: 'auto',
    paddingHorizontal: c(10, 8),
    paddingVertical: c(7, 6),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#14352a',
  },
  speedBtnText: {
    fontSize: c(11.5, 10.5),
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
