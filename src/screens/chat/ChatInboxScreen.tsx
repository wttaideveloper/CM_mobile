import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import {
  ChatInboxArchivedRow,
  ChatInboxMenuModal,
  ChatRow,
  FilterChip,
} from '@/components/chat/inbox/ChatInboxParts';
import { ChatInboxSkeletonList } from '@/components/ui/Skeleton';
import { INBOX_FILTERS, useChatInboxData } from '@/hooks/useChatInboxData';
// TEMP: commented for client demo screen recording (black screen). Re-enable after.
// import { useScreenPrivacy } from '@/hooks/useScreenPrivacy';
import { PRIMARY, TEXT_BLACK, TEXT_MUTED, styles } from '@/screens/chat/ChatInboxScreen.styles';
import { createGroupHref } from '@/utils/chatNavigation';

export function ChatInboxScreen() {
  // useScreenPrivacy('chat-inbox');
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inbox = useChatInboxData();

  const archivedAccessibilityLabel =
    inbox.archivedTotal > 0
      ? t('chat.archivedChatsCount', { count: inbox.archivedTotal })
      : t('chat.archivedChats');

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <StatusBarFill />

      <View style={[styles.topSection, { paddingTop: 12 }]}>
        <View style={styles.titleRow}>
          <Pressable
            onPress={inbox.handleBackPress}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('common.goBack')}
          >
            <Ionicons name="arrow-back" size={24} color={TEXT_BLACK} />
          </Pressable>
          <Text style={styles.title}>
            {inbox.isArchivedView ? t('chat.archived') : t('chat.chats')}
          </Text>
          <Pressable
            onPress={() => inbox.setMenuVisible(true)}
            style={({ pressed }) => [styles.menuBtn, pressed && styles.pressed]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('chat.optionsMenu')}
          >
            <Ionicons name="ellipsis-vertical" size={22} color={TEXT_BLACK} />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={TEXT_MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder={inbox.isArchivedView ? t('chat.searchArchived') : t('chat.searchChats')}
            placeholderTextColor={TEXT_MUTED}
            value={inbox.search}
            onChangeText={inbox.setSearch}
            returnKeyType="search"
            autoCorrect={false}
            onSubmitEditing={() => inbox.setDebouncedSearch(inbox.search.trim())}
            accessibilityLabel={
              inbox.isArchivedView ? t('chat.searchArchived') : t('chat.searchChats')
            }
          />
        </View>

        {!inbox.isArchivedView ? (
          <>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScroll}
            >
              {INBOX_FILTERS.map((filter) => (
                <FilterChip
                  key={filter}
                  label={filter}
                  count={
                    filter === 'Unread'
                      ? inbox.unreadCount
                      : filter === 'Groups'
                        ? inbox.groupCount
                        : undefined
                  }
                  active={inbox.activeFilter === filter}
                  onPress={() => inbox.setActiveFilter(filter)}
                />
              ))}
            </ScrollView>
            <View style={styles.chipsDivider} />
          </>
        ) : (
          <View style={styles.chipsDivider} />
        )}
      </View>

      {!inbox.isArchivedView ? (
        <ChatInboxArchivedRow
          archivedTotal={inbox.archivedTotal}
          onPress={inbox.openArchivedView}
          accessibilityLabel={archivedAccessibilityLabel}
        />
      ) : null}

      <FlatList
        data={inbox.chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatRow
            item={item}
            selected={inbox.selectedChat?.id === item.id}
            onPress={() => inbox.openChat(item)}
            onLongPress={() => inbox.setSelectedChat(item)}
          />
        )}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 88 },
          inbox.chats.length === 0 && !inbox.isListLoading && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          inbox.isListLoading ? (
            <ChatInboxSkeletonList />
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>
                {inbox.isArchivedView ? t('chat.noArchivedChats') : t('chat.noChatsFound')}
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={inbox.isRefreshing}
            onRefresh={() => void inbox.handleRefresh()}
            tintColor={PRIMARY}
            colors={[PRIMARY]}
          />
        }
      />

      {inbox.isUpdatingChatId ? (
        <View style={styles.archivingOverlay} pointerEvents="none">
          <ActivityIndicator color={PRIMARY} />
        </View>
      ) : null}

      <ChatInboxMenuModal
        visible={inbox.menuVisible}
        topInset={insets.top}
        isArchivedView={inbox.isArchivedView}
        selectedChatIsClosed={inbox.selectedChatIsClosed}
        hasSelectedChat={Boolean(inbox.selectedChat)}
        onClose={() => inbox.setMenuVisible(false)}
        onNewGroup={() => {
          inbox.setMenuVisible(false);
          router.push(createGroupHref());
        }}
        onMarkAllRead={() => inbox.setMenuVisible(false)}
        onChatSettings={() => inbox.setMenuVisible(false)}
        onArchiveToggle={inbox.handleHeaderArchive}
        onCloseToggle={inbox.handleHeaderCloseToggle}
      />
    </View>
  );
}
