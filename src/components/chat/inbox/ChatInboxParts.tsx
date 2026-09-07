import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { ChatMessageStatus } from '@/constants/chat';
import type { ChatInboxItem } from '@/constants/chatInbox';
import { H_PAD, PRIMARY, TEXT_BLACK, TEXT_DESC, TEXT_MUTED, styles } from '@/screens/chat/ChatInboxScreen.styles';
import { isConversationClosed } from '@/utils/conversation';

function Avatar({ item }: { item: ChatInboxItem }) {
  return (
    <View style={[styles.avatar, item.isGroup && styles.avatarGroup]}>
      {item.isGroup ? (
        <Ionicons name="people" size={22} color={PRIMARY} />
      ) : (
        <Text style={styles.avatarText}>{item.avatarInitial}</Text>
      )}
      {item.isOnline ? <View style={styles.onlineDot} /> : null}
    </View>
  );
}

function InboxReadReceipt({ status }: { status: ChatMessageStatus }) {
  if (status === 'sent') {
    return <Ionicons name="checkmark" size={15} color={TEXT_MUTED} />;
  }

  const tickColor = status === 'read' ? '#53BDEB' : TEXT_MUTED;
  return <Ionicons name="checkmark-done" size={16} color={tickColor} />;
}

type ChatRowProps = {
  item: ChatInboxItem;
  onPress: () => void;
  onLongPress: () => void;
  selected: boolean;
};

export function ChatRow({ item, onPress, onLongPress, selected }: ChatRowProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => [
        styles.chatRow,
        selected && styles.chatRowSelected,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}${item.unreadCount > 0 ? `, ${item.unreadCount} unread` : ''}${isConversationClosed(item.status) ? ', closed' : ''}`}
      accessibilityHint="Double tap to open. Long press to select."
      accessibilityState={{ selected }}
    >
      <Avatar item={item} />
      <View style={styles.chatBody}>
        <View style={styles.chatTop}>
          <Text style={styles.chatName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.chatTime, item.unreadCount > 0 && styles.chatTimeUnread]}>
            {item.timestamp}
          </Text>
        </View>
        <View style={styles.chatBottom}>
          <View style={styles.chatPreviewRow}>
            {item.lastMessageStatus ? (
              <InboxReadReceipt status={item.lastMessageStatus} />
            ) : null}
            <Text style={styles.chatPreview} numberOfLines={1}>
              {isConversationClosed(item.status) ? 'Closed · ' : ''}
              {item.lastMessage}
            </Text>
          </View>
          {isConversationClosed(item.status) ? (
            <View style={styles.closedBadge}>
              <Text style={styles.closedBadgeText}>Closed</Text>
            </View>
          ) : item.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

type FilterChipProps = {
  label: string;
  count?: number;
  active: boolean;
  onPress: () => void;
};

export function FilterChip({ label, count, active, onPress }: FilterChipProps) {
  const displayLabel = count != null && count > 0 ? `${label} ${count}` : label;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={displayLabel}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {displayLabel}
      </Text>
    </Pressable>
  );
}

type ChatInboxArchivedRowProps = {
  archivedTotal: number;
  onPress: () => void;
  accessibilityLabel: string;
};

export function ChatInboxArchivedRow({
  archivedTotal,
  onPress,
  accessibilityLabel,
}: ChatInboxArchivedRowProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      style={({ pressed }) => [styles.archivedRow, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.archivedIconWrap}>
        <Ionicons name="archive-outline" size={20} color={TEXT_DESC} />
      </View>
      <Text style={styles.archivedLabel}>{t('chat.archived')}</Text>
      {archivedTotal > 0 ? <Text style={styles.archivedCount}>{archivedTotal}</Text> : null}
    </Pressable>
  );
}

type ChatInboxMenuModalProps = {
  visible: boolean;
  topInset: number;
  isArchivedView: boolean;
  selectedChatIsClosed: boolean;
  hasSelectedChat: boolean;
  onClose: () => void;
  onNewGroup: () => void;
  onMarkAllRead: () => void;
  onChatSettings: () => void;
  onArchiveToggle: () => void;
  onCloseToggle: () => void;
};

export function ChatInboxMenuModal({
  visible,
  topInset,
  isArchivedView,
  selectedChatIsClosed,
  hasSelectedChat,
  onClose,
  onNewGroup,
  onMarkAllRead,
  onChatSettings,
  onArchiveToggle,
  onCloseToggle,
}: ChatInboxMenuModalProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.menuBackdrop} onPress={onClose}>
        <View style={[styles.menuCard, { top: topInset + 52, right: H_PAD }]}>
          {!isArchivedView ? (
            <>
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
                onPress={onNewGroup}
                accessibilityRole="button"
                accessibilityLabel={t('chat.newGroup')}
              >
                <Ionicons name="people-outline" size={20} color={TEXT_BLACK} />
                <Text style={styles.menuItemText}>{t('chat.newGroup')}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
                onPress={onMarkAllRead}
                accessibilityRole="button"
                accessibilityLabel={t('chat.markAllRead')}
              >
                <Ionicons name="checkmark-done-outline" size={20} color={TEXT_BLACK} />
                <Text style={styles.menuItemText}>{t('chat.markAllRead')}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
                onPress={onChatSettings}
                accessibilityRole="button"
                accessibilityLabel={t('chat.chatSettings')}
              >
                <Ionicons name="settings-outline" size={20} color={TEXT_BLACK} />
                <Text style={styles.menuItemText}>{t('chat.chatSettings')}</Text>
              </Pressable>
            </>
          ) : null}
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
            onPress={onArchiveToggle}
            accessibilityRole="button"
            accessibilityLabel={isArchivedView ? t('chat.unarchive') : t('chat.archive')}
          >
            <Ionicons
              name={isArchivedView ? 'arrow-undo-outline' : 'archive-outline'}
              size={20}
              color={TEXT_BLACK}
            />
            <Text style={styles.menuItemText}>
              {isArchivedView ? t('chat.unarchive') : t('chat.archive')}
            </Text>
          </Pressable>
          {hasSelectedChat ? (
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
              onPress={onCloseToggle}
              accessibilityRole="button"
              accessibilityLabel={
                selectedChatIsClosed ? t('chat.reopenConversation') : t('chat.closeConversation')
              }
            >
              <Ionicons
                name={selectedChatIsClosed ? 'chatbubble-outline' : 'lock-closed-outline'}
                size={20}
                color={TEXT_BLACK}
              />
              <Text style={styles.menuItemText}>
                {selectedChatIsClosed ? t('chat.reopenConversation') : t('chat.closeConversation')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    </Modal>
  );
}
