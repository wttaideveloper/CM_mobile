import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthenticatedChatImage } from '@/components/chat/AuthenticatedChatImage';

type ChatImageViewerProps = {
  uri: string;
  onClose: () => void;
};

export function ChatImageViewer({ uri, onClose }: ChatImageViewerProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={styles.overlay}>
        <View style={styles.overlayInner} accessibilityViewIsModal>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={onClose} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
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
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  backBtn: {
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
