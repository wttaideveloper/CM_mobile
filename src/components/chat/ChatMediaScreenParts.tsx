import { Ionicons } from '@expo/vector-icons';
import { AuthenticatedChatImage } from '@/components/chat/AuthenticatedChatImage';
import { PRIMARY, styles, TEXT_MUTED } from '@/screens/chat/ChatMediaScreen.styles';
import { formatISTShortDate, parseApiDate } from '@/utils/dateTime';
import type { MediaGalleryItem } from '@/utils/conversationMedia';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

export function formatDocDate(iso: string): string {
  const date = parseApiDate(iso);
  if (Number.isNaN(date.getTime())) return '';
  return formatISTShortDate(date);
}

export function MediaTile({
  item,
  downloading,
  onPress,
  onDownload,
}: {
  item: MediaGalleryItem;
  downloading?: boolean;
  onPress: (item: MediaGalleryItem) => void;
  onDownload: (item: MediaGalleryItem) => void;
}) {
  const uri = item.thumbnail ?? item.uri;

  return (
    <Pressable
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={item.kind === 'video' ? `Play ${item.name}` : `View ${item.name}`}
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
      <Pressable
        onPress={(event) => {
          event.stopPropagation?.();
          onDownload(item);
        }}
        disabled={downloading}
        accessibilityRole="button"
        accessibilityLabel={`Download ${item.name}`}
        hitSlop={6}
        style={({ pressed }) => [
          styles.mediaDownloadBtn,
          pressed && styles.pressed,
          downloading && styles.downloadBtnDisabled,
        ]}
      >
        {downloading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="download-outline" size={16} color="#FFFFFF" />
        )}
      </Pressable>
    </Pressable>
  );
}

export function DocRow({
  item,
  opening,
  downloading,
  onPress,
  onDownload,
}: {
  item: MediaGalleryItem;
  opening: boolean;
  downloading?: boolean;
  onPress: (item: MediaGalleryItem) => void;
  onDownload: (item: MediaGalleryItem) => void;
}) {
  const ext = item.kind === 'word' ? 'DOC' : 'PDF';
  const busy = opening || downloading;

  return (
    <Pressable
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.name}`}
      accessibilityState={{ disabled: busy, busy }}
      style={({ pressed }) => [styles.docRow, pressed && styles.pressed]}
      disabled={busy}
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
      <Pressable
        onPress={(event) => {
          event.stopPropagation?.();
          onDownload(item);
        }}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={`Download ${item.name}`}
        hitSlop={8}
        style={({ pressed }) => [
          styles.docActionBtn,
          pressed && styles.pressed,
          busy && styles.downloadBtnDisabled,
        ]}
      >
        {downloading ? (
          <ActivityIndicator size="small" color={PRIMARY} />
        ) : (
          <Ionicons name="download-outline" size={20} color={PRIMARY} />
        )}
      </Pressable>
      {opening ? (
        <ActivityIndicator size="small" color={PRIMARY} />
      ) : (
        <Ionicons name="open-outline" size={18} color={TEXT_MUTED} />
      )}
    </Pressable>
  );
}
