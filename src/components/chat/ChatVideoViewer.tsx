import { Ionicons } from '@expo/vector-icons';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthenticatedAttachmentUri } from '@/hooks/useAuthenticatedAttachmentUri';

type ChatVideoViewerProps = {
  uri: string;
  fileName?: string;
  onClose: () => void;
  /** True while saving the file to the device (Photos / Downloads). */
  saving?: boolean;
  onDownload?: () => void;
};

export function ChatVideoViewer({
  uri,
  fileName,
  onClose,
  saving = false,
  onDownload,
}: ChatVideoViewerProps) {
  const insets = useSafeAreaInsets();
  const aliveRef = useRef(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const {
    uri: localUri,
    loading: downloading,
    error: downloadFailed,
  } = useAuthenticatedAttachmentUri(uri, fileName || 'video.mp4');

  const player = useVideoPlayer(null, (instance) => {
    instance.loop = false;
    instance.muted = false;
  });

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      try {
        player.pause();
      } catch {
        // Released.
      }
    };
  }, [player]);

  useEffect(() => {
    if (!localUri) return;

    let cancelled = false;
    setReady(false);
    setError(false);

    void (async () => {
      try {
        await player.replaceAsync({ uri: localUri });
        if (cancelled || !aliveRef.current) return;
        player.play();
        setReady(true);
      } catch {
        if (!cancelled && aliveRef.current) {
          setError(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        player.pause();
      } catch {
        // Released.
      }
    };
  }, [localUri, player]);

  useEventListener(player, 'statusChange', ({ status }) => {
    if (!aliveRef.current) return;
    if (status === 'readyToPlay') setReady(true);
    if (status === 'error') setError(true);
  });

  const showLoader = downloading || (!!localUri && !ready && !error && !downloadFailed);
  const showError = downloadFailed || error;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={styles.overlay}>
        <View style={styles.overlayInner} accessibilityViewIsModal>
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <Pressable
              onPress={onClose}
              style={styles.backBtn}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close video"
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
            {onDownload ? (
              <Pressable
                onPress={onDownload}
                disabled={saving}
                style={styles.actionBtn}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Download video"
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="download-outline" size={24} color="#FFFFFF" />
                )}
              </Pressable>
            ) : (
              <View style={styles.actionBtn} />
            )}
          </View>

          <View style={styles.videoArea}>
            {localUri && !showError ? (
              <VideoView
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

            {showLoader ? (
              <View style={styles.centerState} pointerEvents="none">
                <ActivityIndicator color="#FFFFFF" size="large" />
              </View>
            ) : null}

            {showError ? (
              <View style={styles.centerState}>
                <Text style={styles.errorText}>Could not play this video.</Text>
                <Pressable onPress={onClose} style={styles.closePill}>
                  <Text style={styles.closePillText}>Close</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlayInner: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
    zIndex: 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  centerState: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  errorText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    textAlign: 'center',
  },
  closePill: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  closePillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
