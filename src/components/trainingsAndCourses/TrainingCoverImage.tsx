import { useEffect, useState } from 'react';
import {
  Image as RNImage,
  StyleSheet,
  View,
  type StyleProp,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useAuthStore } from '@/stores/auth.store';
import {
  downloadAuthenticatedImage,
  getCachedAuthenticatedImage,
} from '@/utils/attachmentImage';
import {
  hasTrainingCoverImage,
  trainingCoverUrlNeedsAuth,
} from '@/utils/trainingCover';

type TrainingCoverImageProps = {
  uri?: string | null;
  title?: string;
  style?: StyleProp<ImageStyle | ViewStyle>;
  /** @deprecated Initials placeholder removed — ignored. */
  placeholderTextStyle?: StyleProp<TextStyle>;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  transition?: number;
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
  recyclingKey?: string;
};

const MAX_DATA_URI_CHARS = 700_000;

function resizeModeFor(
  fit: TrainingCoverImageProps['contentFit'],
): 'cover' | 'contain' | 'stretch' | 'center' {
  if (fit === 'contain') return 'contain';
  if (fit === 'fill') return 'stretch';
  if (fit === 'none' || fit === 'scale-down') return 'center';
  return 'cover';
}

/**
 * Training covers: load public https/data URLs directly.
 * If a URL still needs Bearer (rare), download to file:// then paint with RN Image.
 */
export function TrainingCoverImage({
  uri,
  title = '',
  style,
  placeholderTextStyle: _placeholderTextStyle,
  contentFit = 'cover',
}: TrainingCoverImageProps) {
  void _placeholderTextStyle;
  const accessToken = useAuthStore((state) => state.accessToken);
  const [displayUri, setDisplayUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const raw = typeof uri === 'string' ? uri.trim() : '';

    if (!hasTrainingCoverImage(raw)) {
      setDisplayUri(null);
      return undefined;
    }

    if (raw.startsWith('data:')) {
      setDisplayUri(raw.length > MAX_DATA_URI_CHARS ? null : raw);
      return undefined;
    }

    if (!trainingCoverUrlNeedsAuth(raw)) {
      setDisplayUri(raw);
      return undefined;
    }

    const cached = getCachedAuthenticatedImage(raw, accessToken);
    if (cached) {
      setDisplayUri(cached);
      return undefined;
    }

    setDisplayUri(null);

    void downloadAuthenticatedImage(raw)
      .then((localUri) => {
        if (cancelled) return;
        if (__DEV__) {
          console.log('[TrainingCoverImage] downloaded', title);
        }
        setDisplayUri(localUri);
      })
      .catch((error) => {
        if (__DEV__) {
          console.warn('[TrainingCoverImage] download failed', title, error);
        }
        if (!cancelled) setDisplayUri(null);
      });

    return () => {
      cancelled = true;
    };
  }, [uri, accessToken, title]);

  if (!displayUri) {
    return <View style={[styles.slot, style as StyleProp<ViewStyle>]} />;
  }

  return (
    <RNImage
      key={displayUri}
      source={{ uri: displayUri }}
      style={[styles.slot, style as StyleProp<ImageStyle>]}
      resizeMode={resizeModeFor(contentFit)}
      onError={(e) => {
        if (__DEV__) {
          console.warn(
            '[TrainingCoverImage] paint failed',
            title,
            displayUri.slice(0, 80),
            e.nativeEvent?.error,
          );
        }
        // Last chance: auth download if remote https failed (e.g. covers
        // temporarily require Bearer again).
        const remote = typeof uri === 'string' ? uri.trim() : '';
        if (
          remote.startsWith('http') &&
          !displayUri.startsWith('file:') &&
          remote.includes('/api/v1/trainings/upload/')
        ) {
          void downloadAuthenticatedImage(remote)
            .then((localUri) => setDisplayUri(localUri))
            .catch(() => setDisplayUri(null));
          return;
        }
        setDisplayUri(null);
      }}
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  slot: {
    width: '100%',
    height: '100%',
  },
});
