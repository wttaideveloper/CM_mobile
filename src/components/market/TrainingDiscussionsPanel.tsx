import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
} from '@/components/market/marketTrainingData';
import {
  useCreateTrainingDiscussion,
  useReplyTrainingDiscussion,
  useTrainingDiscussions,
} from '@/hooks/useTrainings';
import { useAuthStore } from '@/stores/auth.store';
import type { TrainingDiscussionApiItem } from '@/types/training.types';
import { c, NU } from '@/utils/newUiCompact';

function formatDiscussionDate(value?: string | null): string {
  if (!value?.trim()) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.trim();
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Reply text — API uses `answer`; some payloads may alias as `reply`. */
function discussionReplyText(item: TrainingDiscussionApiItem): string {
  const fromAnswer = item.answer?.trim() ?? '';
  if (fromAnswer) return fromAnswer;
  const replyAlias = (item as { reply?: string | null }).reply?.trim() ?? '';
  return replyAlias;
}

function authorLabel(author?: string | null): string {
  const raw = author?.trim() || 'Learner';
  if (raw.includes('@')) {
    return raw.split('@')[0] || raw;
  }
  return raw;
}

function DiscussionCard({
  item,
  isOwn,
  canReply,
  replyOpen,
  replyText,
  replyPending,
  onToggleReply,
  onChangeReply,
  onSubmitReply,
}: {
  item: TrainingDiscussionApiItem;
  isOwn: boolean;
  canReply: boolean;
  replyOpen: boolean;
  replyText: string;
  replyPending: boolean;
  onToggleReply: () => void;
  onChangeReply: (value: string) => void;
  onSubmitReply: () => void;
}) {
  const displayName = authorLabel(item.author);
  const question = item.question?.trim() || '—';
  const reply = discussionReplyText(item);
  const dateLabel = formatDiscussionDate(item.created_at);
  const initial = displayName.charAt(0).toUpperCase() || 'Q';

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

      <Text style={styles.questionText}>{question}</Text>

      {reply ? (
        <View style={styles.replyBox}>
          <Text style={styles.replyBoxLabel}>Reply</Text>
          <Text style={styles.replyBoxText}>{reply}</Text>
        </View>
      ) : isOwn ? (
        <Text style={styles.waitingOwn}>
          Waiting for someone to reply
        </Text>
      ) : (
        <Text style={styles.waitingOther}>No reply yet</Text>
      )}

      {canReply ? (
        <>
          <Pressable
            style={styles.replyToggle}
            onPress={onToggleReply}
            accessibilityRole="button"
          >
            <Text style={styles.replyToggleText}>
              {replyOpen
                ? 'Cancel'
                : reply
                  ? 'Update reply'
                  : 'Write a reply'}
            </Text>
          </Pressable>

          {replyOpen ? (
            <View style={styles.replyForm}>
              <TextInput
                style={styles.replyInput}
                value={replyText}
                onChangeText={onChangeReply}
                placeholder="Share a helpful reply…"
                placeholderTextColor={TRAINING_MUTED}
                multiline
                textAlignVertical="top"
                editable={!replyPending}
              />
              <Pressable
                style={[
                  styles.replyBtn,
                  (!replyText.trim() || replyPending) && styles.btnDisabled,
                ]}
                onPress={onSubmitReply}
                disabled={!replyText.trim() || replyPending}
                accessibilityRole="button"
              >
                {replyPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.replyBtnText}>Post reply</Text>
                )}
              </Pressable>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

export function TrainingDiscussionsPanel({
  trainingId,
  enabled,
}: {
  trainingId: string;
  enabled: boolean;
}) {
  const authEmail = useAuthStore((s) => s.user?.email?.trim().toLowerCase() || '');
  const discussionsQuery = useTrainingDiscussions(enabled ? trainingId : undefined);
  const createDiscussion = useCreateTrainingDiscussion(
    enabled ? trainingId : undefined,
  );
  const replyDiscussion = useReplyTrainingDiscussion(
    enabled ? trainingId : undefined,
  );

  const [questionDraft, setQuestionDraft] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);

  const { mine, others } = useMemo(() => {
    const all = discussionsQuery.discussions;
    if (!authEmail) {
      return { mine: [] as TrainingDiscussionApiItem[], others: all };
    }
    const mineList: TrainingDiscussionApiItem[] = [];
    const otherList: TrainingDiscussionApiItem[] = [];
    for (const item of all) {
      const author = item.author?.trim().toLowerCase() ?? '';
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
    return (item.author?.trim().toLowerCase() ?? '') === authEmail;
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

  const onReply = async (discussionId: string) => {
    const answer = (replyDrafts[discussionId] ?? '').trim();
    if (!answer || replyDiscussion.isPending) return;
    try {
      await replyDiscussion.mutateAsync({ discussionId, answer });
      setReplyDrafts((current) => {
        const next = { ...current };
        delete next[discussionId];
        return next;
      });
      setOpenReplyId(null);
    } catch {
      Alert.alert(
        'Could not reply',
        'Something went wrong while posting the reply. Try again.',
      );
    }
  };

  const renderCard = (item: TrainingDiscussionApiItem) => {
    const own = isOwnItem(item);
    return (
      <DiscussionCard
        key={item.id}
        item={item}
        isOwn={own}
        canReply={!own}
        replyOpen={openReplyId === item.id}
        replyText={replyDrafts[item.id] ?? ''}
        replyPending={
          replyDiscussion.isPending &&
          replyDiscussion.variables?.discussionId === item.id
        }
        onToggleReply={() =>
          setOpenReplyId((current) => (current === item.id ? null : item.id))
        }
        onChangeReply={(value) =>
          setReplyDrafts((current) => ({
            ...current,
            [item.id]: value,
          }))
        }
        onSubmitReply={() => {
          void onReply(item.id);
        }}
      />
    );
  };

  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.label}>Discussions</Text>
          <Text style={styles.help}>
            Ask questions and reply to other learners
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{discussions.length}</Text>
        </View>
      </View>

      <View style={styles.askCard}>
        <Text style={styles.askTitle}>Ask a question</Text>
        <Text style={styles.askHint}>
          Your question is visible to the group. You can’t reply to your own
          posts.
        </Text>
        <TextInput
          style={styles.askInput}
          value={questionDraft}
          onChangeText={setQuestionDraft}
          placeholder="What would you like clarified?"
          placeholderTextColor={TRAINING_MUTED}
          multiline
          textAlignVertical="top"
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
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(10, 8),
    paddingVertical: c(8, 7),
    fontSize: c(13.5, 12.5),
    color: TRAINING_TEAL,
    backgroundColor: '#fafbfc',
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
  replyBoxLabel: {
    fontSize: c(10.5, 9.5),
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: TRAINING_GREEN,
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
  waitingOther: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
    fontWeight: '500',
  },
  replyToggle: {
    alignSelf: 'flex-start',
    paddingVertical: c(2, 1),
  },
  replyToggleText: {
    fontSize: c(12.5, 11.5),
    fontWeight: '800',
    color: '#1f6f8b',
  },
  replyForm: {
    gap: c(8, 6),
  },
  replyInput: {
    minHeight: c(64, 56),
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(10, 8),
    paddingVertical: c(8, 7),
    fontSize: c(13, 12),
    color: TRAINING_TEAL,
    backgroundColor: '#fafbfc',
  },
  replyBtn: {
    alignSelf: 'flex-start',
    backgroundColor: TRAINING_GREEN,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(14, 12),
    paddingVertical: c(9, 8),
    minWidth: c(100, 90),
    alignItems: 'center',
  },
  replyBtnText: {
    fontSize: c(12.5, 11.5),
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
