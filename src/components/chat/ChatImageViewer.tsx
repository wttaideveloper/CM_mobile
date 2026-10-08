import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthenticatedChatImage } from '@/components/chat/AuthenticatedChatImage';

type ChatImageViewerProps = {
  uri: string;
  onClose: () => void;
  downloading?: boolean;
  onDownload?: () => void;
};

export function ChatImageViewer({
  uri,
  onClose,
  downloading = false,
  onDownload,
}: ChatImageViewerProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={styles.overlay}>
        <View style={styles.overlayInner} accessibilityViewIsModal>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={onClose} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          {onDownload ? (
            <Pressable
              onPress={onDownload}
              disabled={downloading}
              style={styles.actionBtn}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Download photo"
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="download-outline" size={24} color="#FFFFFF" />
              )}
            </Pressable>
          ) : (
            <View style={styles.actionBtn} />
          )}
        </View>

        <View style={styles.imageArea}>
          <AuthenticatedChatImage
            uri={uri}
            style={styles.image}
            contentFit="contain"
            loadingStyle={styles.imageLoading}
            zoomable
          />
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
  imageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLoading: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
});
