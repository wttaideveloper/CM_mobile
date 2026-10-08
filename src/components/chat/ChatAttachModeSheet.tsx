import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPhotoLibrary: () => void;
  onDocument: () => void;
};

/**
 * Android-friendly bottom sheet for Photo Library vs Document
 * (matches ChatCameraModeSheet; iOS keeps native Alert).
 * Tap outside (dimmed area) dismisses the sheet.
 */
export function ChatAttachModeSheet({
  visible,
  onClose,
  onPhotoLibrary,
  onDocument,
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
          <Text style={styles.title}>Attach</Text>

          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={onPhotoLibrary}
            accessibilityRole="button"
            accessibilityLabel="Photo Library"
          >
            <View style={styles.iconWrap}>
              <Ionicons name="images-outline" size={22} color="#1F5D4E" />
            </View>
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>Photo Library</Text>
              <Text style={styles.rowSubtitle}>Send a photo or video</Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={onDocument}
            accessibilityRole="button"
            accessibilityLabel="Document"
          >
            <View style={styles.iconWrap}>
              <Ionicons name="document-outline" size={22} color="#1F5D4E" />
            </View>
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>Document</Text>
              <Text style={styles.rowSubtitle}>PDF, Word, and other files</Text>
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
