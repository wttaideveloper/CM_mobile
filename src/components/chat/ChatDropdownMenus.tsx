import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { isSmallDevice } from '@/utils/responsive';

const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const H_PAD = isSmallDevice ? 16 : 20;

type ChatConversationMenuProps = {
  visible: boolean;
  topOffset: number;
  conversationIsClosed: boolean;
  onClose: () => void;
  onMedia: () => void;
  onCloseToggle: () => void;
};

export function ChatConversationMenu({
  visible,
  topOffset,
  conversationIsClosed,
  onClose,
  onMedia,
  onCloseToggle,
}: ChatConversationMenuProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.menuOverlay} pointerEvents="box-none">
        <Pressable style={styles.menuBackdrop} onPress={onClose} />
        <View
          style={[
            styles.editDropdown,
            { top: topOffset, right: H_PAD, zIndex: 20, elevation: 20 },
          ]}
        >
          <Pressable
            style={styles.editDropdownItem}
            onPress={onMedia}
            accessibilityRole="button"
            accessibilityLabel="Media"
          >
            <Text style={styles.editDropdownItemText}>Media</Text>
          </Pressable>
          <Pressable
            style={styles.editDropdownItem}
            onPress={onCloseToggle}
            accessibilityRole="button"
            accessibilityLabel={
              conversationIsClosed ? 'Reopen conversation' : 'Close conversation'
            }
          >
            <Text style={styles.editDropdownItemText}>
              {conversationIsClosed ? 'Reopen conversation' : 'Close conversation'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

type ChatMessageActionMenuProps = {
  visible: boolean;
  topOffset: number;
  canEdit: boolean;
  canCopy: boolean;
  canDownload: boolean;
  canDelete: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onDelete: () => void;
};

export function ChatMessageActionMenu({
  visible,
  topOffset,
  canEdit,
  canCopy,
  canDownload,
  canDelete,
  onClose,
  onEdit,
  onCopy,
  onDownload,
  onDelete,
}: ChatMessageActionMenuProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.menuOverlay}>
        <Pressable style={styles.menuBackdrop} onPress={onClose} />
        <View
          style={[
            styles.editDropdown,
            { top: topOffset, right: H_PAD, zIndex: 10, elevation: 10 },
          ]}
        >
          {canEdit ? (
            <Pressable
              style={styles.editDropdownItem}
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel="Edit message"
            >
              <Text style={styles.editDropdownItemText}>Edit</Text>
            </Pressable>
          ) : null}
          {canCopy ? (
            <Pressable
              style={styles.editDropdownItem}
              onPress={onCopy}
              accessibilityRole="button"
              accessibilityLabel="Copy message"
            >
              <Text style={styles.editDropdownItemText}>Copy</Text>
            </Pressable>
          ) : null}
          {canDownload ? (
            <Pressable
              style={styles.editDropdownItem}
              onPress={onDownload}
              accessibilityRole="button"
              accessibilityLabel="Download attachment"
            >
              <Text style={styles.editDropdownItemText}>Download</Text>
            </Pressable>
          ) : null}
          {canDelete ? (
            <Pressable
              style={styles.editDropdownItem}
              onPress={onDelete}
              accessibilityRole="button"
              accessibilityLabel="Delete message"
            >
              <Text style={styles.editDropdownDeleteText}>Delete</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  editDropdown: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 168,
    paddingVertical: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  editDropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  editDropdownItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_BLACK,
  },
  editDropdownDeleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});
