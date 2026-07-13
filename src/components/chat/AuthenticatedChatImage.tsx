import { Image, type ImageContentFit } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAuthStore } from '@/stores/auth.store';
import {
  attachmentUrlRequiresAuth,
  downloadAuthenticatedImage,
  getCachedAuthenticatedImage,
} from '@/utils/attachmentImage';
import { ZoomableImageSurface } from '@/components/chat/ZoomableImageSurface';

type AuthenticatedChatImageProps = {
  uri: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  loadingStyle?: StyleProp<ViewStyle>;
  zoomable?: boolean;
};

export function AuthenticatedChatImage({
  uri,
  style,
  contentFit = 'cover',
  loadingStyle,
  zoomable = false,
}: AuthenticatedChatImageProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [displayUri, setDisplayUri] = useState<string | null>(() => {
    if (!uri || !attachmentUrlRequiresAuth(uri)) return uri || null;
    return getCachedAuthenticatedImage(uri, accessToken);
  });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!uri) {
      setDisplayUri(null);
      setFailed(false);
      return undefined;
    }

    if (!attachmentUrlRequiresAuth(uri)) {
      setDisplayUri(uri);
      setFailed(false);
      return undefined;
    }

    const cached = getCachedAuthenticatedImage(uri, accessToken);
    if (cached) {
      setDisplayUri(cached);
      setFailed(false);
      return undefined;
    }

    setDisplayUri(null);
    setFailed(false);

    if (!accessToken) {
      setFailed(true);
      return undefined;
    }

    void downloadAuthenticatedImage(uri, accessToken)
      .then((localUri) => {
        if (!cancelled) setDisplayUri(localUri);
      })
      .catch((error) => {
        if (__DEV__) {
          console.warn('[AuthenticatedChatImage] Download failed:', uri, error);
        }
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, uri]);

  if (!uri || failed) {
    return (
      <View style={[styles.loading, loadingStyle]}>
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  if (!displayUri) {
    return (
      <View style={[styles.loading, loadingStyle]}>
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  if (zoomable) {
    return (
      <ZoomableImageSurface
        key={displayUri}
        uri={displayUri}
        style={style}
        contentFit={contentFit}
      />
    );
  }

  return <Image source={{ uri: displayUri }} style={style} contentFit={contentFit} transition={120} />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EDEA',
  },
});
