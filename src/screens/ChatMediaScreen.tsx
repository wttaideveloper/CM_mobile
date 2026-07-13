import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { AuthenticatedChatImage } from '@/components/chat/AuthenticatedChatImage';
import { ChatImageViewer } from '@/components/chat/ChatImageViewer';
import { DEV_USER } from '@/constants/devUser';
import { useConversationMedia } from '@/hooks/useConversationMedia';
import { useAuthStore } from '@/stores/auth.store';
import { groupGalleryItems, type MediaGalleryItem } from '@/utils/conversationMedia';
import { formatISTShortDate, parseApiDate } from '@/utils/dateTime';
import { openChatAttachment } from '@/utils/openChatAttachment';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const BODY_BG = '#F7F8F9';
const PAGE_BG = '#FFFFFF';
const TEXT_MUTED = '#9CA3AF';
const TEXT_DESC = '#6B7280';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const H_PAD = isSmallDevice ? 16 : 20;
const GRID_COLUMNS = 3;
const GRID_GAP = 2;
const GRID_WIDTH = Dimensions.get('window').width;
const TILE_SIZE = Math.floor((GRID_WIDTH - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS);

type MediaTab = 'media' | 'docs';

function formatDocDate(iso: string): string {
  const date = parseApiDate(iso);
  if (Number.isNaN(date.getTime())) return '';
  return formatISTShortDate(date);
}

function MediaTile({
  item,
  onPress,
}: {
  item: MediaGalleryItem;
  onPress: (item: MediaGalleryItem) => void;
}) {
  const uri = item.thumbnail ?? item.uri;

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.mediaTile, pressed && styles.pressed]}
    >
      {uri ? (
        <AuthenticatedChatImage
          uri={uri}
          style={styles.mediaTileImage}
          contentFit="cover"
          loadingStyle={styles.mediaTileImage}
        />
      ) : (
        <View style={styles.mediaTileFallback}>
          <Ionicons name="image-outline" size={28} color={TEXT_MUTED} />
        </View>
      )}
      {item.kind === 'video' ? (
        <View style={styles.videoBadge}>
          <Ionicons name="play" size={14} color="#FFFFFF" />
        </View>
      ) : null}
    </Pressable>
  );
}

function DocRow({
  item,
  opening,
  onPress,
}: {
  item: MediaGalleryItem;
  opening: boolean;
  onPress: (item: MediaGalleryItem) => void;
}) {
  const ext = item.kind === 'word' ? 'DOC' : 'PDF';

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.docRow, pressed && styles.pressed]}
      disabled={opening}
    >
      <View style={styles.docIconBox}>
        <Ionicons
          name={item.kind === 'word' ? 'document-text-outline' : 'document-outline'}
          size={24}
          color="#EF4444"
        />
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.docMeta}>
          {item.size}
          {ext ? ` · ${ext}` : ''}
          {item.createdAt ? ` · ${formatDocDate(item.createdAt)}` : ''}
        </Text>
      </View>
      {opening ? (
        <ActivityIndicator size="small" color={PRIMARY} />
      ) : (
        <Ionicons name="open-outline" size={18} color={TEXT_MUTED} />
      )}
    </Pressable>
  );
}

export function ChatMediaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const conversationId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';
  const currentUserId = useAuthStore((state) => state.user?.id) ?? DEV_USER.user_id;

  const [activeTab, setActiveTab] = useState<MediaTab>('media');
  const [viewerImageUri, setViewerImageUri] = useState<string | null>(null);
  const [openingAttachmentId, setOpeningAttachmentId] = useState<string | null>(null);

  const { mediaItems, docItems, loading, error } = useConversationMedia(conversationId, currentUserId);

  const mediaSections = useMemo(() => groupGalleryItems(mediaItems), [mediaItems]);
  const docSections = useMemo(
    () =>
      groupGalleryItems(docItems).map((section) => ({
        title: section.title,
        data: section.items,
      })),
    [docItems],
  );

  const handleMediaPress = (item: MediaGalleryItem) => {
    const uri = item.thumbnail ?? item.uri;
    if (!uri) return;
    setViewerImageUri(uri);
  };

  const handleDocPress = async (item: MediaGalleryItem) => {
    const openingKey = item.attachmentId ?? item.messageId;
    setOpeningAttachmentId(openingKey);

    try {
      await openChatAttachment({
        attachmentId: item.attachmentId,
        fileName: item.name,
        uri: item.uri,
        type: item.kind,
      });
    } finally {
      setOpeningAttachmentId((current) => (current === openingKey ? null : current));
    }
  };

  const activeCount = activeTab === 'media' ? mediaItems.length : docItems.length;

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <StatusBarFill />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={TEXT_BLACK} />
        </Pressable>
        <Text style={styles.headerTitle}>All media</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setActiveTab('media')}
          style={[styles.tabBtn, activeTab === 'media' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, activeTab === 'media' && styles.tabTextActive]}>Media</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('docs')}
          style={[styles.tabBtn, activeTab === 'docs' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, activeTab === 'docs' && styles.tabTextActive]}>Docs</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={PRIMARY} />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : activeCount === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyText}>
            {activeTab === 'media' ? 'No media yet' : 'No documents yet'}
          </Text>
        </View>
      ) : activeTab === 'media' ? (
        <FlatList
          data={mediaSections}
          keyExtractor={(section) => section.title}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: section }) => (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.mediaGrid}>
                {section.items.map((item) => (
                  <MediaTile key={item.messageId} item={item} onPress={handleMediaPress} />
                ))}
              </View>
            </View>
          )}
        />
      ) : (
        <SectionList
          sections={docSections}
          keyExtractor={(item) => item.messageId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionTitle}>{title}</Text>
          )}
          renderItem={({ item }) => (
            <DocRow
              item={item}
              opening={openingAttachmentId === (item.attachmentId ?? item.messageId)}
              onPress={(doc) => void handleDocPress(doc)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.docSeparator} />}
        />
      )}

      {viewerImageUri ? (
        <ChatImageViewer uri={viewerImageUri} onClose={() => setViewerImageUri(null)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BODY_BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: PAGE_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: isSmallDevice ? 16 : 17,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  headerSpacer: { width: 36 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: PAGE_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: PRIMARY,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  tabTextActive: {
    color: PRIMARY,
  },
  listContent: {
    paddingBottom: 24,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: H_PAD,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  sectionBlock: {
    marginTop: 12,
  },
  sectionTitle: {
    paddingHorizontal: H_PAD,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: '800',
    color: TEXT_DESC,
    letterSpacing: 0.6,
    backgroundColor: BODY_BG,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  mediaTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: '#E8EDEA',
    overflow: 'hidden',
  },
  mediaTileImage: {
    width: '100%',
    height: '100%',
  },
  mediaTileFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: H_PAD,
    paddingVertical: 12,
    backgroundColor: PAGE_BG,
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
    minWidth: 0,
  },
  docName: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  docMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_DESC,
  },
  docSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginLeft: H_PAD + 56,
  },
  pressed: { opacity: 0.85 },
});
