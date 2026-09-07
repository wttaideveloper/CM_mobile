import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SectionList,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { ChatImageViewer } from '@/components/chat/ChatImageViewer';
import { DocRow, MediaTile } from '@/components/chat/ChatMediaScreenParts';
import { DEV_USER } from '@/constants/devUser';
import { useConversationMedia } from '@/hooks/useConversationMedia';
import { useAuthStore } from '@/stores/auth.store';
import { groupGalleryItems, type MediaGalleryItem } from '@/utils/conversationMedia';
import { openChatAttachment } from '@/utils/openChatAttachment';
import { PRIMARY, styles, TEXT_BLACK } from '@/screens/chat/ChatMediaScreen.styles';

type MediaTab = 'media' | 'docs';

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
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backBtn}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT_BLACK} />
        </Pressable>
        <Text style={styles.headerTitle}>All media</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setActiveTab('media')}
          accessibilityRole="tab"
          accessibilityLabel="Media"
          accessibilityState={{ selected: activeTab === 'media' }}
          style={[styles.tabBtn, activeTab === 'media' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, activeTab === 'media' && styles.tabTextActive]}>Media</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('docs')}
          accessibilityRole="tab"
          accessibilityLabel="Docs"
          accessibilityState={{ selected: activeTab === 'docs' }}
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
