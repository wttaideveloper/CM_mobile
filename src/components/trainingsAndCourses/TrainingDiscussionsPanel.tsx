import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/trainingsAndCourses/trainingData';
import {
  useCreateTrainingDiscussion,
  useTrainingDiscussions,
} from '@/hooks/useTrainings';
import { useAuthStore } from '@/stores/auth.store';
import type { TrainingDiscussionApiItem } from '@/types/training.types';
import { asPlainText, clampDisplayText } from '@/utils/trainingLessonMedia';
import { c, NU } from '@/utils/newUiCompact';

const DISCUSSION_INPUT_PROPS = {
  multiline: true,
  textAlignVertical: 'top' as const,
  maxLength: 4000,
  scrollEnabled: true,
  blurOnSubmit: false,
  autoCorrect: false,
  spellCheck: false,
  autoCapitalize: 'sentences' as const,
  maxFontSizeMultiplier: 1.25,
} as const;

function formatDiscussionDate(value?: string | null): string {
  const raw = asPlainText(value);
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Reply text — API uses `answer`; some payloads may alias as `reply`. */
function discussionReplyText(item: TrainingDiscussionApiItem): string {
  return asPlainText(item.answer) || asPlainText(item.reply);
}

function authorLabel(author?: string | null): string {
  const raw = asPlainText(author, 'Learner');
  if (raw.includes('@')) {
    return raw.split('@')[0] || raw;
  }
  return raw;
}

function DiscussionCard({
  item,
  isOwn,
}: {
  item: TrainingDiscussionApiItem;
  isOwn: boolean;
}) {
  const displayName = authorLabel(item.author);
  const question = clampDisplayText(asPlainText(item.question, '—'), 2_000);
  const reply = clampDisplayText(discussionReplyText(item), 2_000);
  const dateLabel = formatDiscussionDate(item.created_at);
  const initial = (displayName.trim().charAt(0) || 'Q').toUpperCase();

  return (
    <View style={[styles.card, isOwn && styles.cardOwn]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, isOwn && styles.avatarOwn]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.cardCopy}>
          <View style={styles.nameRow}>
            <Text style={styles.author} numberOfLines={1}>
              {isOwn ? 'You' : displayName}
            </Text>
            {isOwn ? (
              <Text style={styles.youPill}>Your question</Text>
            ) : null}
          </View>
          {dateLabel ? (
            <Text style={styles.dateMeta}>{dateLabel}</Text>
          ) : null}
        </View>
        <Text
          style={[
            styles.statusPill,
            reply ? styles.statusPillAnswered : styles.statusPillOpen,
          ]}
        >
          {reply ? 'Replied' : 'Open'}
        </Text>
      </View>

      <Text style={styles.questionText} selectable numberOfLines={12}>
        {question}
      </Text>

      {reply ? (
        <View style={styles.replyBox}>
          <Text style={styles.replyBoxText} selectable numberOfLines={12}>
            {reply}
          </Text>
        </View>
      ) : (
        <Text style={styles.waitingOwn}>
          Waiting for a reply from the admin
        </Text>
      )}
    </View>
  );
}

export function TrainingDiscussionsPanel({
  trainingId,
  enabled,
  onEnsureInputVisible,
}: {
  trainingId: string;
  enabled: boolean;
  /** Parent scroll should pin this view above the keyboard (My Learning). */
  onEnsureInputVisible?: (target: View | null) => void;
}) {
  const authEmail = useAuthStore((s) => s.user?.email?.trim().toLowerCase() || '');
  const discussionsQuery = useTrainingDiscussions(enabled ? trainingId : undefined);
  const createDiscussion = useCreateTrainingDiscussion(
    enabled ? trainingId : undefined,
  );

  const [questionDraft, setQuestionDraft] = useState('');
  const askFormRef = useRef<View>(null);

  const { mine, others } = useMemo(() => {
    const all = discussionsQuery.discussions.filter(
      (item) => item && asPlainText(item.id),
    );
    if (!authEmail) {
      return { mine: [] as TrainingDiscussionApiItem[], others: all };
    }
    const mineList: TrainingDiscussionApiItem[] = [];
    const otherList: TrainingDiscussionApiItem[] = [];
    for (const item of all) {
      const author = asPlainText(item.author).toLowerCase();
      if (author && author === authEmail) {
        mineList.push(item);
      } else {
        otherList.push(item);
      }
    }
    return { mine: mineList, others: otherList };
  }, [authEmail, discussionsQuery.discussions]);

  if (!enabled) return null;

  const discussions = discussionsQuery.discussions;
  const posting = createDiscussion.isPending;
  const showEmpty =
    discussionsQuery.isSuccess && discussions.length === 0;
  const showError =
    discussionsQuery.isError &&
    !discussionsQuery.isFetching &&
    discussions.length === 0;

  const isOwnItem = (item: TrainingDiscussionApiItem) => {
    if (!authEmail) return false;
    return (asPlainText(item.author).toLowerCase()) === authEmail;
  };

  const onAsk = async () => {
    const question = questionDraft.trim();
    if (!question || posting) return;
    try {
      await createDiscussion.mutateAsync(question);
      setQuestionDraft('');
    } catch {
      Alert.alert(
        'Could not post',
        'Something went wrong while posting your question. Try again.',
      );
    }
  };

  const renderCard = (item: TrainingDiscussionApiItem) => {
    const itemId = asPlainText(item.id);
    if (!itemId) return null;
    return (
      <DiscussionCard
        key={itemId}
        item={item}
        isOwn={isOwnItem(item)}
      />
    );
  };

  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.label}>Discussions</Text>
          <Text style={styles.help}>
            Ask questions about this training
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{discussions.length}</Text>
        </View>
      </View>

      <View ref={askFormRef} style={styles.askCard}>
        <Text style={styles.askTitle}>Ask a question</Text>
        <Text style={styles.askHint}>
          Your question is visible to the group.
        </Text>
        <TextInput
          {...DISCUSSION_INPUT_PROPS}
          style={[
            styles.askInput,
            Platform.OS === 'ios' && styles.askInputFixed,
          ]}
          value={questionDraft}
          onChangeText={(value) =>
            setQuestionDraft(typeof value === 'string' ? value : '')
          }
          onFocus={() => {
            onEnsureInputVisible?.(askFormRef.current);
          }}
          placeholder="What would you like clarified?"
          placeholderTextColor={TRAINING_MUTED}
          editable={!posting}
        />
        <Pressable
          style={[
            styles.askBtn,
            (!questionDraft.trim() || posting) && styles.btnDisabled,
          ]}
          onPress={() => {
            void onAsk();
          }}
          disabled={!questionDraft.trim() || posting}
          accessibilityRole="button"
        >
          {posting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.askBtnText}>Post question</Text>
          )}
        </Pressable>
      </View>

      {discussionsQuery.isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={TRAINING_GREEN} />
        </View>
      ) : null}

      {showError ? (
        <Pressable
          style={styles.retryWrap}
          onPress={() => {
            void discussionsQuery.refetch();
          }}
          accessibilityRole="button"
        >
          <Text style={styles.retryText}>Couldn’t load discussions · Tap to retry</Text>
        </Pressable>
      ) : null}

      {showEmpty ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No discussions yet</Text>
          <Text style={styles.emptyText}>
            Be the first to ask a question about this training.
          </Text>
        </View>
      ) : null}

      {mine.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your questions</Text>
          <View style={styles.list}>{mine.map(renderCard)}</View>
        </View>
      ) : null}

      {others.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community</Text>
          <View style={styles.list}>{others.map(renderCard)}</View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: c(12, 10),
    padding: c(14, 12),
    borderRadius: NU.cardRadius,
    backgroundColor: '#f4f7f8',
    borderWidth: 1,
    borderColor: '#d5e0e4',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: c(10, 8),
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: c(3, 2),
  },
  label: {
    fontSize: c(16, 15),
    fontWeight: '800',
    color: TRAINING_TEAL,
    letterSpacing: -0.2,
  },
  help: {
    fontSize: c(12.5, 11.5),
    lineHeight: c(17, 15),
    color: TRAINING_MUTED,
    fontWeight: '500',
  },
  countBadge: {
    minWidth: c(28, 26),
    height: c(28, 26),
    paddingHorizontal: c(8, 6),
    borderRadius: 99,
    backgroundColor: '#e2eef2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: c(12, 11),
    fontWeight: '800',
    color: '#1f6f8b',
  },
  askCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d5e0e4',
    borderRadius: NU.cardRadius,
    padding: c(12, 10),
    gap: c(8, 6),
  },
  askTitle: {
    fontSize: c(13.5, 12.5),
    fontWeight: '800',
    color: TRAINING_TEAL,
  },
  askHint: {
    fontSize: c(11.5, 10.5),
    lineHeight: c(16, 15),
    color: TRAINING_MUTED,
    marginTop: -c(2, 1),
  },
  askInput: {
    minHeight: c(72, 64),
    maxHeight: c(160, 140),
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(10, 8),
    paddingVertical: c(8, 7),
    fontSize: c(13.5, 12.5),
    color: TRAINING_TEAL,
    backgroundColor: '#fafbfc',
  },
  askInputFixed: {
    height: 96,
    minHeight: 96,
    maxHeight: 96,
  },
  askBtn: {
    alignSelf: 'flex-start',
    backgroundColor: TRAINING_TEAL,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(14, 12),
    paddingVertical: c(10, 8),
    minWidth: c(120, 108),
    alignItems: 'center',
  },
  askBtnText: {
    fontSize: c(13, 12),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.45,
  },
  loadingWrap: {
    paddingVertical: c(16, 12),
    alignItems: 'center',
  },
  retryWrap: {
    paddingVertical: c(10, 8),
  },
  retryText: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: '#1f6f8b',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d5e0e4',
    borderRadius: NU.cardRadius,
    paddingVertical: c(16, 14),
    paddingHorizontal: c(12, 10),
    gap: c(4, 3),
  },
  emptyTitle: {
    fontSize: c(13.5, 12.5),
    fontWeight: '800',
    color: TRAINING_TEAL,
  },
  emptyText: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  section: {
    gap: c(8, 6),
  },
  sectionTitle: {
    fontSize: c(11.5, 10.5),
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  list: {
    gap: c(8, 6),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d5e0e4',
    borderRadius: NU.cardRadius,
    padding: c(12, 10),
    gap: c(8, 6),
  },
  cardOwn: {
    borderColor: '#c8e0cc',
    backgroundColor: '#f7fbf8',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  avatar: {
    width: c(32, 30),
    height: c(32, 30),
    borderRadius: 99,
    backgroundColor: '#1f6f8b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOwn: {
    backgroundColor: TRAINING_GREEN,
  },
  avatarText: {
    fontSize: c(12, 11),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(6, 5),
    flexWrap: 'wrap',
  },
  author: {
    fontSize: c(13, 12),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  youPill: {
    fontSize: c(10, 9),
    fontWeight: '800',
    color: TRAINING_GREEN,
    backgroundColor: '#e6f4e8',
    paddingHorizontal: c(6, 5),
    paddingVertical: c(2, 1),
    borderRadius: c(5, 4),
    overflow: 'hidden',
  },
  dateMeta: {
    fontSize: c(11, 10),
    color: TRAINING_MUTED,
    fontWeight: '500',
  },
  statusPill: {
    fontSize: c(10.5, 9.5),
    fontWeight: '800',
    paddingHorizontal: c(7, 6),
    paddingVertical: c(3, 2),
    borderRadius: c(6, 5),
    overflow: 'hidden',
  },
  statusPillAnswered: {
    color: TRAINING_GREEN,
    backgroundColor: '#e6f4e8',
  },
  statusPillOpen: {
    color: '#8a6a2b',
    backgroundColor: '#f7f0e2',
  },
  questionText: {
    fontSize: c(14, 13),
    lineHeight: c(20, 18),
    fontWeight: '600',
    color: TRAINING_TEAL,
    flexShrink: 1,
  },
  replyBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d7eadc',
    borderLeftWidth: 3,
    borderLeftColor: TRAINING_GREEN,
    borderRadius: NU.cardRadiusSm,
    padding: c(10, 8),
    gap: c(4, 3),
  },
  replyBoxText: {
    fontSize: c(13, 12),
    lineHeight: c(18, 16),
    color: TRAINING_TEAL,
  },
  waitingOwn: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
