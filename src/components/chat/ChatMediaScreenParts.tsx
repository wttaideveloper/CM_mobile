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
  onPress,
}: {
  item: MediaGalleryItem;
  onPress: (item: MediaGalleryItem) => void;
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
    </Pressable>
  );
}

export function DocRow({
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
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.name}`}
      accessibilityState={{ disabled: opening, busy: opening }}
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
