import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onRecordVideo: () => void;
};

/**
 * Android-friendly bottom sheet for Photo vs Video (Alert looks poor on Android).
 * iOS keeps the native Alert / ActionSheet instead.
 * Tap outside (dimmed area) dismisses the sheet.
 */
export function ChatCameraModeSheet({
  visible,
  onClose,
  onTakePhoto,
  onRecordVideo,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss">
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>Camera</Text>

          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={onTakePhoto}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
          >
            <View style={styles.iconWrap}>
              <Ionicons name="camera-outline" size={22} color="#1F5D4E" />
            </View>
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>Take Photo</Text>
              <Text style={styles.rowSubtitle}>Capture a still image</Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={onRecordVideo}
            accessibilityRole="button"
            accessibilityLabel="Record video"
          >
            <View style={styles.iconWrap}>
              <Ionicons name="videocam-outline" size={22} color="#1F5D4E" />
            </View>
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>Record Video</Text>
              <Text style={styles.rowSubtitle}>Capture a video clip</Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.cancelBtn, pressed && styles.rowPressed]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 4,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  rowPressed: {
    backgroundColor: '#F3F4F6',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  cancelBtn: {
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
});
