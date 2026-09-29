import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { BizProfilePinIcon } from '@/components/market/MarketBusinessProfileIcons';
import {
  CoursePlayFillIcon,
} from '@/components/market/CourseLearningIcons';
import {
  EventDetailCalSmallIcon,
  EventDetailPersonIcon,
} from '@/components/market/MarketEventDetailIcons';
import { ListingChevronIcon } from '@/components/market/MarketListingIcons';
import { MarketCheckoutLockIcon } from '@/components/market/MarketCheckoutIcons';
import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
  TRAINING_TRACK,
} from '@/components/market/marketTrainingData';
import { getTrainingProgressPath } from '@/components/market/marketTrainingProgressData';
import { TrainingAnnouncementsPanel } from '@/components/market/TrainingAnnouncementsPanel';
import { TrainingStickyVideoPlayer } from '@/components/market/TrainingStickyVideoPlayer';
import {
  useMyTrainingEnrolments,
  useTraining,
  useTrainingReviews,
} from '@/hooks/useTrainings';
import type {
  TrainingCurriculumItemType,
  TrainingDetailView,
} from '@/types/training.types';
import { buildStaticTrainingDetail } from '@/utils/buildStaticTrainingDetail';
import { openTrainingFile } from '@/utils/downloadTrainingFile';
import { c, NU } from '@/utils/newUiCompact';

type CurriculumItemView = {
  id: string;
  type: TrainingCurriculumItemType;
  title: string;
  meta: string;
  locked?: boolean;
  completed?: boolean;
  isPreview?: boolean;
  videoUrl?: string;
  fileUrl?: string;
  examId?: string;
};

const CURRICULUM_TYPE_META: Record<
  TrainingCurriculumItemType,
  { label: string; color: string; bg: string }
> = {
  topic: { label: 'Topic', color: '#3c63c8', bg: '#eaf1ff' },
  video: { label: 'Video', color: '#257d3f', bg: '#e6f4e8' },
  youtube: { label: 'YouTube', color: '#c4302b', bg: '#fdecea' },
  live: { label: 'Live', color: '#c45c26', bg: '#fff0e8' },
  venue: { label: 'Venue', color: '#1f6f8b', bg: '#e5f4f8' },
  pdf: { label: 'PDF', color: '#8a4b1f', bg: '#fff3e8' },
  notes: { label: 'Notes', color: '#5b6b7c', bg: '#eef2f5' },
  quiz: { label: 'Quiz', color: '#8352c0', bg: '#f2e9fb' },
  assignment: { label: 'Task', color: '#b45309', bg: '#fff7ed' },
};

function CurriculumChevron({ expanded }: { expanded: boolean }) {
  return (
    <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
          d="m6 9 6 6 6-6"
          stroke={expanded ? TRAINING_GREEN : TRAINING_MUTED}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

function CurriculumTypeIcon({
  type,
  color,
  size = 18,
}: {
  type: TrainingCurriculumItemType;
  color: string;
  size?: number;
}) {
  if (type === 'video') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
        <Path d="M10 8.5v7l6-3.5-6-3.5z" fill={color} />
      </Svg>
    );
  }
  if (type === 'youtube') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect
          x="2"
          y="5"
          width="20"
          height="14"
          rx="3.5"
          stroke={color}
          strokeWidth={1.8}
        />
        <Path d="M10 9.2v5.6l5.2-2.8-5.2-2.8z" fill={color} />
      </Svg>
    );
  }
  if (type === 'live') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 8h10a2 2 0 0 1 2 2v6H4V8z"
          stroke={color}
          strokeWidth={1.8}
        />
        <Path
          d="m16 11 4-2.5v7L16 13"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (type === 'venue') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z"
          stroke={color}
          strokeWidth={1.8}
        />
        <Circle cx="12" cy="10" r="2.2" stroke={color} strokeWidth={1.8} />
      </Svg>
    );
  }
  if (type === 'pdf' || type === 'notes') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M7 3h7l5 5v13H7V3z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Path d="M14 3v5h5M9 13h6M9 17h4" stroke={color} strokeWidth={1.8} />
      </Svg>
    );
  }
  if (type === 'quiz') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect
          x="4"
          y="3"
          width="16"
          height="18"
          rx="2"
          stroke={color}
          strokeWidth={1.8}
        />
        <Path
          d="M9 8h6M9 12h6M9 16h3"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (type === 'assignment') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M8 4h8v3H8V4zM7 7h10v13H7V7z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Path d="M10 12h4M10 16h4" stroke={color} strokeWidth={1.8} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 6h14M5 12h14M5 18h10"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function summarizeCurriculumItems(items: CurriculumItemView[]): string {
  if (items.length === 0) return 'No items yet';
  const counts = items.reduce<Partial<Record<TrainingCurriculumItemType, number>>>(
    (acc, item) => {
      acc[item.type] = (acc[item.type] ?? 0) + 1;
      return acc;
    },
    {},
  );
  const pluralLabel: Record<TrainingCurriculumItemType, [string, string]> = {
    topic: ['topic', 'topics'],
    video: ['video', 'videos'],
    youtube: ['YouTube', 'YouTube'],
    live: ['live', 'live'],
    venue: ['venue', 'venues'],
    pdf: ['PDF', 'PDFs'],
    notes: ['notes', 'notes'],
    quiz: ['quiz', 'quizzes'],
    assignment: ['task', 'tasks'],
  };
  return (Object.entries(counts) as [TrainingCurriculumItemType, number][])
    .map(([type, count]) => {
      const [one, many] = pluralLabel[type];
      return `${count} ${count === 1 ? one : many}`;
    })
    .slice(0, 4)
    .join(' · ');
}

function Section({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function RatingStars({
  rating,
  size = 'md',
}: {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  const fontSize = size === 'lg' ? c(22, 18) : size === 'sm' ? c(13, 12) : c(16, 14);
  return (
    <Text style={[styles.stars, { fontSize }]}>
      {'★'.repeat(filled)}
      <Text style={styles.starsEmpty}>{'★'.repeat(5 - filled)}</Text>
    </Text>
  );
}

function FactChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.factChip}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function ReviewPreviewCard({
  author,
  rating,
  date,
  comment,
  verified,
}: {
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewAvatarText}>
            {author.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.reviewCopy}>
          <View style={styles.reviewNameRow}>
            <Text style={styles.sessionTitle}>{author}</Text>
            {verified ? (
              <Text style={styles.verifiedPill}>Verified</Text>
            ) : null}
          </View>
          <View style={styles.reviewRatingRow}>
            <RatingStars rating={rating} size="sm" />
            <Text style={styles.infoMeta}>{date}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{comment}</Text>
    </View>
  );
}

function DiscussionsPreviewCard({ enrolled }: { enrolled: boolean }) {
  return (
    <View style={[styles.discussCard, !enrolled && styles.discussCardLocked]}>
      <View style={styles.discussHero}>
        <View style={styles.discussIconWrap}>
          <Text style={styles.discussIconText}>Q</Text>
        </View>
        <View style={styles.discussHeroCopy}>
          <Text style={styles.discussTitle}>Q&A · Discussions</Text>
          <Text style={styles.discussSubtitle}>
            Ask questions and get replies from instructors and peers
          </Text>
        </View>
      </View>

      {enrolled ? (
        <>
          <View style={styles.discussSample}>
            <Text style={styles.discussSampleLabel}>Example</Text>
            <Text style={styles.discussSampleQuestion}>
              When should I complete the session quiz?
            </Text>
            <Text style={styles.discussSampleReply}>
              After you finish that session’s lessons, the quiz unlocks in My
              Learning.
            </Text>
          </View>
          <View style={styles.discussComposerPreview}>
            <Text style={styles.discussComposerPlaceholder}>
              Ask a question…
            </Text>
          </View>
          <Text style={styles.discussHint}>
            Open this training in My Learning to post and reply.
          </Text>
        </>
      ) : (
        <View style={styles.discussLockedBox}>
          <MarketCheckoutLockIcon color={TRAINING_MUTED} size={16} />
          <Text style={styles.discussLockedText}>
            Enroll to unlock discussions for this training
          </Text>
        </View>
      )}
    </View>
  );
}

function ActionLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionLink} onPress={onPress} accessibilityRole="button">
      <Text style={styles.actionLinkText}>{label}</Text>
      <ListingChevronIcon />
    </Pressable>
  );
}

function CurriculumItemRow({
  item,
  locked,
  onPress,
}: {
  item: CurriculumItemView;
  locked: boolean;
  onPress?: () => void;
}) {
  const meta = CURRICULUM_TYPE_META[item.type] ?? CURRICULUM_TYPE_META.topic;
  const canPlayVideo =
    !locked &&
    (item.type === 'video' || item.type === 'youtube') &&
    Boolean(item.videoUrl?.trim());
  const canOpenFile =
    !locked &&
    (item.type === 'pdf' || item.type === 'notes') &&
    Boolean(item.fileUrl?.trim());
  const canOpenQuiz = !locked && item.type === 'quiz';
  const interactive =
    Boolean(onPress) && (canPlayVideo || canOpenFile || canOpenQuiz || !locked);

  const rightIcon = locked ? (
    <MarketCheckoutLockIcon color={TRAINING_MUTED} size={16} />
  ) : canPlayVideo ? (
    <CoursePlayFillIcon color={TRAINING_GREEN} size={16} />
  ) : canOpenQuiz ? (
    <Text style={styles.curriculumPreviewPill}>Quiz</Text>
  ) : item.isPreview ? (
    <Text style={styles.curriculumPreviewPill}>Preview</Text>
  ) : null;

  const content = (
    <>
      <View style={[styles.curriculumTypeIconWrap, { backgroundColor: meta.bg }]}>
        <CurriculumTypeIcon type={item.type} color={meta.color} size={14} />
      </View>
      <View style={styles.curriculumItemCopy}>
        <Text style={styles.curriculumItemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.curriculumItemMeta} numberOfLines={1}>
          {meta.label}
          {item.meta ? ` · ${item.meta}` : ''}
          {!locked && item.isPreview ? ' · Preview' : ''}
        </Text>
      </View>
      <View style={styles.curriculumItemRight}>{rightIcon}</View>
    </>
  );

  if (interactive && onPress) {
    return (
      <Pressable
        style={styles.curriculumItem}
        onPress={onPress}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.curriculumItem,
        locked && styles.curriculumItemLocked,
      ]}
    >
      {content}
    </View>
  );
}

function CurriculumSectionRow({
  sectionIndex,
  title,
  summary,
  items,
  expanded,
  isLast,
  isItemLocked,
  onToggle,
  onItemPress,
}: {
  sectionIndex: number;
  title: string;
  summary: string;
  items: CurriculumItemView[];
  expanded: boolean;
  isLast: boolean;
  isItemLocked: (item: CurriculumItemView) => boolean;
  onToggle: () => void;
  onItemPress: (item: CurriculumItemView) => void;
}) {
  const total = items.length;

  return (
    <View style={!isLast ? styles.curriculumSectionBorder : undefined}>
      <Pressable
        style={[
          styles.curriculumSectionHeader,
          expanded && styles.curriculumSectionHeaderOpen,
        ]}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={styles.curriculumSectionBadge}>
          <Text style={styles.curriculumSectionBadgeText}>
            {sectionIndex + 1}
          </Text>
        </View>
        <View style={styles.curriculumSectionCopy}>
          <Text style={styles.curriculumSectionTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.curriculumSectionMeta} numberOfLines={1}>
            {summary}
          </Text>
        </View>
        {total > 0 ? (
          <Text style={styles.curriculumProgressPill}>{total}</Text>
        ) : null}
        <CurriculumChevron expanded={expanded} />
      </Pressable>

      {expanded ? (
        <View style={styles.curriculumLessonList}>
          <View style={styles.curriculumLessonNest}>
            {items.length > 0 ? (
              items.map((item) => {
                const locked = isItemLocked(item);
                return (
                  <CurriculumItemRow
                    key={item.id}
                    item={item}
                    locked={locked}
                    onPress={
                      locked
                        ? undefined
                        : () => {
                            onItemPress(item);
                          }
                    }
                  />
                );
              })
            ) : (
              <Text style={styles.curriculumEmptyText}>
                No items in this section yet.
              </Text>
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function CurriculumBlock({
  trainingId,
  sessions,
  materials,
  onOpenMaterial,
  preferApiSessions = false,
  isSelfPaced = false,
  enrolled = false,
}: {
  trainingId?: string;
  sessions: TrainingDetailView['sessions'];
  materials: TrainingDetailView['materials'];
  onOpenMaterial: (url?: string) => void;
  /** API trainings use `sections` → sessions; skip static demo curriculum. */
  preferApiSessions?: boolean;
  /** Self-paced only: honor `is_preview` unlock on detail. */
  isSelfPaced?: boolean;
  enrolled?: boolean;
}) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null | undefined>(
    undefined,
  );
  const [activePreview, setActivePreview] = useState<{
    id: string;
    title: string;
    url: string;
  } | null>(null);

  const previewDays = preferApiSessions
    ? []
    : getTrainingProgressPath(trainingId).days;
  const useDayCurriculum = previewDays.length > 0;
  const sessionCount = useDayCurriculum ? previewDays.length : sessions.length;
  const defaultExpandedId = useDayCurriculum
    ? previewDays[0]?.id
    : sessions[0]?.id;
  const openId =
    expandedId === undefined ? defaultExpandedId ?? null : expandedId;

  const totalItems = useDayCurriculum
    ? previewDays.reduce((sum, day) => sum + day.lessons.length, 0)
    : sessions.reduce((sum, session) => sum + session.items.length, 0);

  const isItemLocked = (item: CurriculumItemView): boolean => {
    // Self-paced detail: unlock only `is_preview` lessons; others stay locked.
    if (!isSelfPaced) return true;
    return !item.isPreview;
  };

  const onItemPress = (item: CurriculumItemView) => {
    if (isItemLocked(item)) return;

    if (item.type === 'quiz') {
      const examId = item.examId?.trim();
      if (!examId || !trainingId) {
        Alert.alert(
          'Quiz',
          'Assessment id is missing for this quiz.',
        );
        return;
      }
      router.push({
        pathname: '/(main)/market/training-exam',
        params: {
          trainingId,
          examId,
          lessonId: item.id,
        },
      });
      return;
    }

    if (
      (item.type === 'video' || item.type === 'youtube') &&
      item.videoUrl?.trim()
    ) {
      setActivePreview({
        id: item.id,
        title: item.title,
        url: item.videoUrl.trim(),
      });
      return;
    }

    if (
      (item.type === 'pdf' || item.type === 'notes') &&
      item.fileUrl?.trim()
    ) {
      void openTrainingFile({
        url: item.fileUrl.trim(),
        suggestedName: item.title,
      });
      return;
    }

    if (item.isPreview) {
      Alert.alert(
        'Preview',
        'This preview item has no playable media yet. Enroll to access the full curriculum.',
      );
    }
  };

  return (
    <View style={styles.section}>
      {activePreview ? (
        <TrainingStickyVideoPlayer
          url={activePreview.url}
          title={activePreview.title}
          subtitle="Preview"
          onClose={() => setActivePreview(null)}
        />
      ) : null}
      <View style={styles.curriculumPanel}>
        <Text style={styles.curriculumLabel}>Curriculum</Text>
        <Text style={styles.curriculumHint}>
          {sessionCount} section{sessionCount === 1 ? '' : 's'}
          {totalItems > 0 ? ` · ${totalItems} items` : ''}
          {isSelfPaced ? ' · Preview lessons unlocked' : ''}
        </Text>
        <View style={styles.curriculumCard}>
          {useDayCurriculum
            ? previewDays.map((day, dayIndex) => {
                const items: CurriculumItemView[] = day.lessons.map((lesson) => ({
                  id: lesson.id,
                  type: lesson.kind === 'exam' ? 'quiz' : 'topic',
                  title: lesson.title,
                  meta: lesson.kind === 'exam' ? 'Quiz' : '',
                  locked: false,
                  completed: false,
                }));
                return (
                  <CurriculumSectionRow
                    key={day.id}
                    sectionIndex={dayIndex}
                    title={`${day.dayLabel} · ${day.title}`}
                    summary={day.summary || summarizeCurriculumItems(items)}
                    items={items}
                    expanded={openId === day.id}
                    isLast={dayIndex === previewDays.length - 1}
                    isItemLocked={isItemLocked}
                    onItemPress={onItemPress}
                    onToggle={() =>
                      setExpandedId((current) => {
                        const active =
                          current === undefined ? defaultExpandedId : current;
                        return active === day.id ? null : day.id;
                      })
                    }
                  />
                );
              })
            : sessions.map((session, index) => {
                const items =
                  session.items.length > 0
                    ? session.items
                    : session.concepts.map((title, conceptIndex) => ({
                        id: `${session.id}-${conceptIndex}`,
                        type: 'topic' as const,
                        title,
                        meta: '',
                        locked: false,
                        completed: false,
                      }));
                return (
                  <CurriculumSectionRow
                    key={session.id}
                    sectionIndex={index}
                    title={session.name}
                    summary={
                      items.length > 0
                        ? summarizeCurriculumItems(items) ||
                          session.when ||
                          session.duration
                        : preferApiSessions
                          ? 'No lessons in this section yet'
                          : 'Concepts coming soon'
                    }
                    items={items}
                    expanded={openId === session.id}
                    isLast={index === sessions.length - 1}
                    isItemLocked={isItemLocked}
                    onItemPress={onItemPress}
                    onToggle={() =>
                      setExpandedId((current) => {
                        const active =
                          current === undefined ? defaultExpandedId : current;
                        return active === session.id ? null : session.id;
                      })
                    }
                  />
                );
              })}
        </View>
      </View>

      {materials.length > 0 ? (
        <>
          <Text style={[styles.sectionLabel, styles.docsLabel]}>Documents</Text>
          <Card>
            {materials.map((material, index) => (
              <Pressable
                key={material.id}
                style={[
                  styles.sessionRow,
                  index < materials.length - 1 && styles.infoBorder,
                ]}
                onPress={() => onOpenMaterial(material.url)}
              >
                <View style={styles.sessionCopy}>
                  <Text style={styles.sessionTitle}>{material.title}</Text>
                  <Text style={styles.infoMeta}>
                    {material.type} · {material.size}
                    {material.downloadable ? ' · Offline ready' : ''}
                  </Text>
                </View>
              </Pressable>
            ))}
          </Card>
        </>
      ) : null}
    </View>
  );
}

export function MarketTrainingDetailBody() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { training, isApiId, isLoading, isError, error, refetch, isFetching } =
    useTraining(id);
  const reviewsQuery = useTrainingReviews(isApiId ? id : undefined);
  const enrolments = useMyTrainingEnrolments();

  const d = isApiId ? training : buildStaticTrainingDetail(id);

  if (isApiId && isLoading && !d) {
    return null;
  }

  if (isApiId && isError && !d) {
    return (
      <View style={styles.stateWrapCentered}>
        <Text style={styles.stateText}>
          {error?.message || 'Could not load training details.'}
        </Text>
        <Pressable style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>
            {isFetching ? 'Retrying…' : 'Retry'}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!d) return null;

  const enrolled = isApiId ? enrolments.isEnrolled(d.id) : false;
  const reviews = isApiId ? reviewsQuery.reviews : d.reviews;
  const averageRating = isApiId
    ? reviewsQuery.averageRating ?? d.averageRating
    : d.averageRating;
  const reviewCount = isApiId
    ? reviewsQuery.count || d.reviewCount
    : d.reviewCount;

  const openLink = async (url?: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      Alert.alert('Link', url);
    }
  };

  const hasReal = (value?: string | null, emptyMarks: string[] = []) => {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (!trimmed) return false;
    return !emptyMarks.includes(trimmed);
  };

  const scheduleTitle =
    hasReal(d.startDate, ['Start date TBD']) &&
    hasReal(d.endDate, ['End date TBD'])
      ? `${d.startDate} – ${d.endDate}`
      : hasReal(d.startDate, ['Start date TBD'])
        ? d.startDate
        : hasReal(d.endDate, ['End date TBD'])
          ? d.endDate
          : '';
  const scheduleMeta = [
    d.startTime && d.endTime
      ? `${d.startTime} – ${d.endTime}`
      : d.startTime || d.endTime || null,
    hasReal(d.recurring) ? d.recurring : null,
    hasReal(d.timezone, ['—']) ? d.timezone : null,
    hasReal(d.duration, ['Duration TBD']) ? d.duration : null,
  ].filter(Boolean) as string[];
  const showSchedule = Boolean(scheduleTitle) || scheduleMeta.length > 0;

  const attendModeLabel =
    d.deliveryMode === 'In-Person' || d.deliveryMode === 'Physical'
      ? 'Physical venue'
      : d.deliveryMode === 'Hybrid'
        ? 'Hybrid delivery'
        : d.deliveryMode === 'Self-paced'
          ? 'Self-paced · recorded'
          : d.deliveryMode === 'Virtual'
            ? 'Virtual · live online'
            : hasReal(d.deliveryMode)
              ? d.deliveryMode
              : '';
  const attendVenue = hasReal(d.venue, ['—']) ? d.venue : '';
  const attendAddress = hasReal(d.address, ['—']) ? d.address : '';
  const attendProvider = hasReal(d.meetingProvider, ['—'])
    ? d.meetingProvider
    : '';
  const attendMeetingLink = hasReal(d.meetingLink) ? d.meetingLink : '';
  const attendTitle = [attendModeLabel, attendVenue].filter(Boolean).join(' · ');
  const attendMeta = [attendAddress, attendProvider].filter(Boolean).join(' · ');
  const showAttend =
    Boolean(attendTitle) ||
    Boolean(attendMeta) ||
    Boolean(attendMeetingLink);

  const seatsTitle = [
    hasReal(d.enrolled, ['—']) ? `${d.enrolled} people joined` : null,
    hasReal(d.available, ['—']) ? `${d.available} spots left` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const seatsMeta = [
    hasReal(d.capacityMax, ['—']) ? `Capacity ${d.capacityMax}` : null,
    hasReal(d.enrolmentDeadline, ['Open enrollment'])
      ? `closes ${d.enrolmentDeadline}`
      : null,
    d.requiresApproval ? 'Approval required' : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const showSeats = Boolean(seatsTitle) || Boolean(seatsMeta);
  const showWhenWhere = showSchedule || showAttend || showSeats;

  return (
    <View>
      <View style={[styles.media, { backgroundColor: d.sideBg }]}>
        {d.imageUrl ? (
          <Image
            source={{ uri: d.imageUrl }}
            style={styles.mediaImage}
            contentFit="cover"
            transition={0}
          />
        ) : (
          <>
            <Text style={[styles.mediaTop, { color: d.sideTopColor }]}>
              {d.sideTop}
            </Text>
            <Text style={[styles.mediaBottom, { color: d.sideBottomColor }]}>
              {d.sideBottom}
            </Text>
          </>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleBlock}>
          <View style={styles.kindRow}>
            <Text
              style={[
                styles.badge,
                { color: d.badgeColor, backgroundColor: d.badgeBg },
              ]}
            >
              {d.badge}
            </Text>
            <Text style={styles.kindMeta}>
              {[d.category, d.courseType].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <View style={styles.titlePriceRow}>
            <Text style={[styles.title, styles.titleFlex]}>{d.title}</Text>
            <Text style={styles.priceInline}>{d.priceLabel}</Text>
          </View>
          {averageRating != null ? (
            <View style={styles.ratingSummary}>
              <RatingStars rating={averageRating} size="md" />
              <Text style={styles.ratingScore}>
                {averageRating.toFixed(1)}
              </Text>
              <Text style={styles.ratingCount}>
                ({reviewCount} reviews)
              </Text>
            </View>
          ) : null}
          <Text style={styles.description}>{d.description}</Text>
          {d.tags.length > 0 ? (
            <View style={styles.tagRow}>
              {d.tags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        <Section label="At a glance">
          <View style={styles.factRow}>
            <FactChip label="Level" value={d.difficulty} />
            <FactChip label="Language" value={d.language} />
          </View>
          <Text style={styles.glanceHint}>
            Pick this if the level matches you — beginners welcome when marked
            Beginner / All levels.
          </Text>
        </Section>

        {d.sessions.length > 0 || d.materials.length > 0 ? (
          <CurriculumBlock
            trainingId={d.id}
            sessions={d.sessions}
            materials={d.materials}
            onOpenMaterial={openLink}
            preferApiSessions={isApiId}
            isSelfPaced={d.deliveryMode === 'Self-paced'}
            enrolled={enrolled}
          />
        ) : null}

        {showWhenWhere ? (
          <Section label="When & where">
            <View style={styles.softStack}>
              {showSchedule ? (
                <View style={styles.softTile}>
                  <View
                    style={[styles.infoIconWrap, { backgroundColor: '#e6f4e8' }]}
                  >
                    <EventDetailCalSmallIcon />
                  </View>
                  <View style={styles.infoCopy}>
                    <Text style={styles.infoEyebrow}>Schedule</Text>
                    {scheduleTitle ? (
                      <Text style={styles.infoTitle}>{scheduleTitle}</Text>
                    ) : null}
                    {scheduleMeta.length > 0 ? (
                      <Text style={styles.infoMeta}>
                        {scheduleMeta.join(' · ')}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {showAttend ? (
                <View style={styles.softTile}>
                  <View
                    style={[styles.infoIconWrap, { backgroundColor: '#fdf0e3' }]}
                  >
                    <BizProfilePinIcon />
                  </View>
                  <View style={styles.infoCopy}>
                    <Text style={styles.infoEyebrow}>How you attend</Text>
                    {attendTitle ? (
                      <Text style={styles.infoTitle}>{attendTitle}</Text>
                    ) : null}
                    {attendMeta ? (
                      <Text style={styles.infoMeta}>{attendMeta}</Text>
                    ) : null}
                    {attendMeetingLink ? (
                      <Pressable onPress={() => openLink(attendMeetingLink)}>
                        <Text style={styles.linkText} numberOfLines={1}>
                          Open meeting link
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {showSeats ? (
                <View style={styles.softTile}>
                  <View
                    style={[styles.infoIconWrap, { backgroundColor: '#f2e9fb' }]}
                  >
                    <EventDetailPersonIcon />
                  </View>
                  <View style={styles.infoCopy}>
                    <Text style={styles.infoEyebrow}>Seats</Text>
                    {seatsTitle ? (
                      <Text style={styles.infoTitle}>{seatsTitle}</Text>
                    ) : null}
                    {seatsMeta ? (
                      <Text style={styles.infoMeta}>{seatsMeta}</Text>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </View>
          </Section>
        ) : null}

        <Section label="Instructor">
          <View style={styles.instructorCard}>
            <View style={styles.instructorRow}>
              <View style={styles.instructorAvatar}>
                <Text style={styles.instructorAvatarText}>
                  {(d.trainerName || 'T')
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase() ?? '')
                    .join('') || 'T'}
                </Text>
              </View>
              <View style={styles.instructorCopy}>
                <Text style={styles.instructorName}>{d.trainerName}</Text>
                <Text style={styles.infoMeta}>
                  {d.trainerRole && d.trainerRole !== '—'
                    ? d.trainerRole
                    : 'Instructor'}
                </Text>
              </View>
            </View>
            {d.trainerBio && d.trainerBio !== '—' ? (
              <Text style={styles.bio}>{d.trainerBio}</Text>
            ) : null}
          </View>
        </Section>

        <Section label="Requirements">
          <View style={styles.proseBlock}>
            <Text style={styles.proseText}>{d.prerequisites}</Text>
          </View>
        </Section>

        {d.deliveryInstructions || d.accessInfo || d.exceptions ? (
          <Section label="Delivery instructions">
            <View style={styles.proseBlock}>
              {d.deliveryInstructions ? (
                <Text style={styles.proseText}>{d.deliveryInstructions}</Text>
              ) : null}
              {d.accessInfo ? (
                <Text style={styles.proseMuted}>{d.accessInfo}</Text>
              ) : null}
              {d.exceptions ? (
                <Text style={styles.proseMuted}>
                  Exceptions: {d.exceptions}
                </Text>
              ) : null}
            </View>
          </Section>
        ) : null}

        <Section label="What you’ll learn">
          <View style={styles.learnList}>
            {(d.objectives.length > 0
              ? d.objectives
              : ['Full curriculum shared after enrollment']
            ).map((item) => (
              <View key={item} style={styles.learnRow}>
                <View style={styles.learnDot}>
                  <Text style={styles.learnDotText}>✓</Text>
                </View>
                <Text style={styles.learnText}>{item}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section label="Notes">
          {d.notes.length > 0 ? (
            <View style={styles.notesList}>
              {d.notes.map((note) => (
                <Pressable
                  key={note.id}
                  style={({ pressed }) => [
                    styles.noteTile,
                    pressed && styles.noteTilePressed,
                  ]}
                  onPress={() => {
                    void openTrainingFile({
                      url: note.url,
                      suggestedName: note.title,
                    });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Open note ${note.title}`}
                >
                  <View style={styles.noteIconWrap}>
                    <Text style={styles.noteIconText}>PDF</Text>
                  </View>
                  <View style={styles.noteCopy}>
                    <Text style={styles.noteTitle} numberOfLines={2}>
                      {note.title}
                    </Text>
                    <Text style={styles.noteMeta}>Tap to open</Text>
                  </View>
                  <View style={styles.noteOpenPill}>
                    <Text style={styles.noteOpenText}>Open</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.notesEmpty}>
              <Text style={styles.notesEmptyText}>No notes are there.</Text>
            </View>
          )}
        </Section>

        <Section label="Discussions">
          <DiscussionsPreviewCard enrolled={enrolled} />
        </Section>

        {isApiId ? (
          <TrainingAnnouncementsPanel trainingId={d.id} enabled />
        ) : null}

        <Section label="Ratings & reviews">
          {averageRating != null && averageRating > 0 ? (
            <View style={styles.ratingHero}>
              <Text style={styles.ratingHeroScore}>
                {averageRating.toFixed(1)}
              </Text>
              <View style={styles.ratingHeroCopy}>
                <RatingStars rating={averageRating} size="lg" />
                <Text style={styles.ratingHeroMeta}>
                  Based on {reviewCount} learner reviews
                </Text>
              </View>
            </View>
          ) : null}
          <View style={styles.reviewStack}>
            {isApiId && reviewsQuery.isLoading ? (
              <View style={styles.proseBlock}>
                <ActivityIndicator color={TRAINING_GREEN} />
              </View>
            ) : null}
            {reviews.slice(0, 2).map((review) => (
              <ReviewPreviewCard
                key={review.id}
                author={review.author}
                rating={review.rating}
                date={review.date}
                comment={review.comment}
                verified={review.verified}
              />
            ))}
            {!reviewsQuery.isLoading && reviews.length === 0 ? (
              <View style={styles.proseBlock}>
                <Text style={styles.proseMuted}>
                  No reviews yet. Be the first to leave a rating.
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.reviewActions}>
            <Pressable
              style={styles.addReviewBtn}
              onPress={() =>
                router.push({
                  pathname: '/(main)/market/training-reviews',
                  params: { id: d.id, compose: '1' },
                })
              }
              accessibilityRole="button"
            >
              <Text style={styles.addReviewBtnText}>Add a review</Text>
            </Pressable>
            <ActionLink
              label="See all reviews"
              onPress={() =>
                router.push({
                  pathname: '/(main)/market/training-reviews',
                  params: { id: d.id },
                })
              }
            />
          </View>
        </Section>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stateWrapCentered: {
    minHeight: Dimensions.get('window').height * 0.55,
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(12, 10),
    paddingHorizontal: NU.hPad,
  },
  stateText: {
    fontSize: NU.body,
    color: TRAINING_MUTED,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: c(14, 12),
    paddingVertical: c(8, 7),
    borderRadius: 99,
    backgroundColor: TRAINING_TEAL,
  },
  retryText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  media: {
    height: c(200, 170),
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(4, 2),
    overflow: 'hidden',
  },
  mediaImage: {
    ...StyleSheet.absoluteFill,
  },
  mediaTop: {
    fontSize: c(14, 12),
    fontWeight: '800',
    letterSpacing: 1,
  },
  mediaBottom: {
    fontSize: c(42, 34),
    fontWeight: '800',
  },
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: c(18, 14),
  },
  titleBlock: {
    gap: c(8, 6),
  },
  kindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: c(10, 9),
    fontWeight: '800',
    paddingHorizontal: c(8, 7),
    paddingVertical: c(3, 2),
    borderRadius: 99,
    overflow: 'hidden',
  },
  kindMeta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  title: {
    fontSize: NU.heading,
    fontWeight: '800',
    color: TRAINING_TEAL,
    letterSpacing: -0.4,
  },
  titleFlex: {
    flex: 1,
  },
  titlePriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: c(12, 10),
  },
  priceInline: {
    fontSize: NU.heading,
    fontWeight: '800',
    color: TRAINING_GREEN,
    letterSpacing: -0.3,
    marginTop: c(2, 1),
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  ratingScore: {
    fontSize: c(15, 14),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  ratingCount: {
    fontSize: c(13, 12),
    color: TRAINING_MUTED,
  },
  stars: {
    fontWeight: '800',
    color: TRAINING_GREEN,
    letterSpacing: 1,
  },
  starsEmpty: {
    color: '#c8e0cc',
  },
  description: {
    fontSize: NU.link,
    lineHeight: c(22, 20),
    color: '#3c6b47',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: c(8, 6),
  },
  tag: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: TRAINING_GREEN,
    backgroundColor: '#e6f4e8',
    paddingHorizontal: c(10, 8),
    paddingVertical: c(5, 4),
    borderRadius: 99,
    overflow: 'hidden',
  },
  factRow: {
    flexDirection: 'row',
    gap: c(8, 6),
  },
  factChip: {
    flex: 1,
    backgroundColor: '#f4f8f5',
    borderWidth: 1,
    borderColor: '#e8f0ea',
    borderRadius: NU.cardRadiusSm,
    paddingVertical: c(12, 10),
    paddingHorizontal: c(10, 8),
    gap: c(4, 3),
  },
  factLabel: {
    fontSize: c(10.5, 9.5),
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  factValue: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: TRAINING_TEAL,
    lineHeight: c(17, 15),
  },
  glanceHint: {
    marginTop: c(8, 6),
    fontSize: c(12.5, 11.5),
    lineHeight: c(18, 16),
    color: TRAINING_MUTED,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: c(8, 6),
  },
  infoChip: {
    fontSize: c(12, 11),
    fontWeight: '600',
    color: TRAINING_TEAL,
    backgroundColor: TRAINING_TRACK,
    paddingHorizontal: c(10, 8),
    paddingVertical: c(6, 5),
    borderRadius: 99,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: c(10, 8),
  },
  ratingHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(14, 12),
    backgroundColor: '#e6f4e8',
    borderRadius: NU.cardRadius,
    paddingVertical: c(16, 13),
    paddingHorizontal: c(16, 13),
    borderWidth: 1,
    borderColor: '#c8e0cc',
  },
  ratingHeroScore: {
    fontSize: c(36, 30),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  ratingHeroCopy: {
    flex: 1,
    gap: c(4, 3),
  },
  ratingHeroMeta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  reviewStack: {
    gap: c(10, 8),
  },
  discussCard: {
    backgroundColor: '#f3fafc',
    borderWidth: 1,
    borderColor: '#c5dde8',
    borderRadius: NU.cardRadius,
    padding: c(14, 12),
    gap: c(12, 10),
  },
  discussCardLocked: {
    backgroundColor: '#f7f8f9',
    borderColor: TRAINING_BORDER,
  },
  discussHero: {
    flexDirection: 'row',
    gap: c(10, 8),
    alignItems: 'center',
  },
  discussIconWrap: {
    width: c(40, 36),
    height: c(40, 36),
    borderRadius: c(20, 18),
    backgroundColor: '#e5f4f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discussIconText: {
    fontSize: c(15, 13),
    fontWeight: '800',
    color: TRAINING_TEAL,
  },
  discussHeroCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  discussTitle: {
    fontSize: NU.body,
    fontWeight: '800',
    color: '#14352a',
  },
  discussSubtitle: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(17, 15),
  },
  discussSample: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d7e8ef',
    borderRadius: NU.cardRadiusSm,
    padding: c(12, 10),
    gap: c(6, 5),
  },
  discussSampleLabel: {
    fontSize: c(11, 10),
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: TRAINING_TEAL,
  },
  discussSampleQuestion: {
    fontSize: c(13.5, 12.5),
    fontWeight: '700',
    color: '#14352a',
    lineHeight: c(19, 17),
  },
  discussSampleReply: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  discussComposerPreview: {
    borderWidth: 1,
    borderColor: '#c5dde8',
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#FFFFFF',
    paddingVertical: c(12, 10),
    paddingHorizontal: c(12, 10),
  },
  discussComposerPlaceholder: {
    fontSize: c(13, 12),
    color: TRAINING_MUTED,
  },
  discussHint: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
    lineHeight: c(17, 15),
  },
  discussLockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    backgroundColor: '#eef1f3',
    borderRadius: NU.cardRadiusSm,
    paddingVertical: c(12, 10),
    paddingHorizontal: c(12, 10),
  },
  discussLockedText: {
    flex: 1,
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  reviewActions: {
    marginTop: c(4, 2),
    gap: c(10, 8),
  },
  addReviewBtn: {
    height: c(44, 40),
    borderRadius: 99,
    backgroundColor: TRAINING_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addReviewBtnText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewCard: {
    backgroundColor: '#f7faf8',
    borderWidth: 1,
    borderColor: '#e8f0ea',
    borderRadius: NU.cardRadius,
    padding: c(14, 12),
    gap: c(10, 8),
  },
  reviewTop: {
    flexDirection: 'row',
    gap: c(10, 8),
  },
  reviewAvatar: {
    width: c(40, 36),
    height: c(40, 36),
    borderRadius: c(20, 18),
    backgroundColor: '#e6f4e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontSize: c(15, 13),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  reviewCopy: {
    flex: 1,
    gap: c(3, 2),
  },
  reviewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    flexWrap: 'wrap',
  },
  verifiedPill: {
    fontSize: c(10.5, 9.5),
    fontWeight: '700',
    color: TRAINING_GREEN,
    backgroundColor: '#e6f4e8',
    paddingHorizontal: c(8, 6),
    paddingVertical: c(3, 2),
    borderRadius: 99,
    overflow: 'hidden',
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  reviewComment: {
    fontSize: NU.link,
    lineHeight: c(21, 19),
    color: TRAINING_TEAL,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: c(12, 10),
    paddingVertical: c(10, 8),
  },
  infoBorder: {
    borderBottomWidth: 1,
    borderBottomColor: TRAINING_TRACK,
  },
  checkpointRow: {
    paddingVertical: c(12, 10),
    gap: c(4, 3),
  },
  checkpointPill: {
    alignSelf: 'flex-start',
    fontSize: NU.label,
    fontWeight: '700',
    paddingVertical: c(3, 2),
    paddingHorizontal: c(7, 6),
    borderRadius: c(5, 4),
    overflow: 'hidden',
    marginBottom: c(2, 1),
  },
  checkpointExam: {
    color: '#8352c0',
    backgroundColor: '#f2e9fb',
  },
  checkpointMilestone: {
    color: TRAINING_GREEN,
    backgroundColor: '#e6f4e8',
  },
  infoCopy: {
    flex: 1,
    gap: c(3, 2),
  },
  infoTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  infoMeta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  linkText: {
    marginTop: c(2, 1),
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
  section: {
    gap: c(10, 8),
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  softStack: {
    gap: c(8, 6),
  },
  softTile: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: c(12, 10),
    backgroundColor: '#f4f8f5',
    borderWidth: 1,
    borderColor: '#e8f0ea',
    borderRadius: NU.cardRadius,
    paddingVertical: c(13, 11),
    paddingHorizontal: c(13, 11),
  },
  instructorCard: {
    backgroundColor: '#eef7f0',
    borderWidth: 1,
    borderColor: '#d7eadc',
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: c(10, 8),
  },
  instructorName: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: TRAINING_TEAL,
  },
  proseBlock: {
    backgroundColor: '#f4f8f5',
    borderRadius: NU.cardRadius,
    borderWidth: 1,
    borderColor: '#e8f0ea',
    paddingVertical: c(14, 12),
    paddingHorizontal: c(14, 12),
    gap: c(8, 6),
  },
  proseText: {
    fontSize: NU.link,
    lineHeight: c(22, 20),
    color: TRAINING_TEAL,
    fontWeight: '500',
  },
  proseMuted: {
    fontSize: c(12.5, 11.5),
    lineHeight: c(18, 16),
    color: TRAINING_MUTED,
  },
  learnList: {
    gap: c(8, 6),
  },
  learnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: c(10, 8),
    backgroundColor: '#f4f8f5',
    borderRadius: NU.cardRadiusSm,
    borderWidth: 1,
    borderColor: '#e8f0ea',
    paddingVertical: c(11, 9),
    paddingHorizontal: c(12, 10),
  },
  learnDot: {
    width: c(22, 20),
    height: c(22, 20),
    borderRadius: 99,
    backgroundColor: '#e6f4e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: c(1, 0),
  },
  learnDotText: {
    fontSize: c(11, 10),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  learnText: {
    flex: 1,
    fontSize: NU.link,
    lineHeight: c(20, 18),
    color: TRAINING_TEAL,
    fontWeight: '600',
  },
  notesList: {
    gap: c(8, 6),
  },
  noteTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(12, 10),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d7eadc',
    borderRadius: NU.cardRadius,
    paddingVertical: c(12, 10),
    paddingHorizontal: c(12, 10),
  },
  noteTilePressed: {
    backgroundColor: '#f0f7f2',
    borderColor: TRAINING_GREEN,
  },
  noteIconWrap: {
    width: c(40, 36),
    height: c(40, 36),
    borderRadius: c(10, 8),
    backgroundColor: '#fde8e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteIconText: {
    fontSize: c(10, 9),
    fontWeight: '800',
    color: '#b42318',
    letterSpacing: 0.4,
  },
  noteCopy: {
    flex: 1,
    minWidth: 0,
    gap: c(2, 1),
  },
  noteTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
    lineHeight: c(19, 17),
  },
  noteMeta: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
    fontWeight: '500',
  },
  noteOpenPill: {
    backgroundColor: '#e6f4e8',
    paddingHorizontal: c(10, 8),
    paddingVertical: c(6, 5),
    borderRadius: 99,
  },
  noteOpenText: {
    fontSize: c(12, 11),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  notesEmpty: {
    backgroundColor: '#f4f8f5',
    borderRadius: NU.cardRadius,
    borderWidth: 1,
    borderColor: '#e8f0ea',
    borderStyle: 'dashed',
    paddingVertical: c(18, 14),
    paddingHorizontal: c(14, 12),
    alignItems: 'center',
  },
  notesEmptyText: {
    fontSize: c(13, 12),
    color: TRAINING_MUTED,
    fontWeight: '600',
  },
  bio: {
    marginTop: c(2, 1),
    fontSize: NU.link,
    lineHeight: c(21, 19),
    color: TRAINING_TEAL,
  },
  bullet: {
    fontSize: NU.link,
    lineHeight: c(21, 19),
    color: TRAINING_TEAL,
  },
  mutedLine: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(12, 10),
    paddingVertical: c(14, 12),
  },
  sessionRowExpanded: {
    paddingBottom: c(8, 6),
  },
  sessionBlockBorder: {
    borderBottomWidth: 1,
    borderBottomColor: TRAINING_TRACK,
  },
  sessionIndex: {
    width: c(34, 30),
    height: c(34, 30),
    borderRadius: c(17, 15),
    backgroundColor: '#e6f4e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionIndexText: {
    fontSize: c(13, 12),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  sessionCopy: {
    flex: 1,
    gap: c(3, 2),
  },
  sessionTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  sessionStatus: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
  curriculumLabel: {
    alignSelf: 'flex-start',
    fontSize: c(12, 11),
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: '#FFFFFF',
    backgroundColor: TRAINING_GREEN,
    paddingHorizontal: c(10, 8),
    paddingVertical: c(5, 4),
    borderRadius: c(8, 7),
    overflow: 'hidden',
  },
  curriculumHint: {
    fontSize: c(13, 12),
    lineHeight: c(18, 16),
    fontWeight: '700',
    color: '#1f6b36',
    backgroundColor: '#c8ebd2',
    paddingHorizontal: c(10, 8),
    paddingVertical: c(7, 6),
    borderRadius: c(8, 7),
    overflow: 'hidden',
  },
  curriculumPanel: {
    gap: c(8, 6),
    padding: c(12, 10),
    borderRadius: NU.cardRadius,
    backgroundColor: '#e8f6ec',
    borderWidth: 1,
    borderColor: '#b9dfc2',
  },
  curriculumCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#9ed0aa',
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  curriculumSectionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#c5e3cd',
  },
  curriculumSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
    paddingVertical: c(13, 11),
    paddingHorizontal: c(12, 10),
    backgroundColor: '#f2faf4',
  },
  curriculumSectionHeaderOpen: {
    paddingBottom: c(10, 8),
    backgroundColor: '#d9f0df',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#a8d4b4',
  },
  curriculumSectionBadge: {
    width: c(30, 28),
    height: c(30, 28),
    borderRadius: c(15, 14),
    backgroundColor: TRAINING_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  curriculumSectionBadgeText: {
    fontSize: c(12, 11),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  curriculumSectionCopy: {
    flex: 1,
    minWidth: 0,
    gap: c(2, 1),
  },
  curriculumSectionTitle: {
    fontSize: c(14.5, 13.5),
    fontWeight: '800',
    color: TRAINING_TEAL,
    lineHeight: c(19, 17),
  },
  curriculumSectionMeta: {
    fontSize: c(11.5, 10.5),
    color: '#4a7a58',
  },
  curriculumProgressPill: {
    fontSize: c(11, 10),
    fontWeight: '800',
    color: '#1f6b36',
    backgroundColor: '#c8ebd2',
    paddingHorizontal: c(7, 6),
    paddingVertical: c(3, 2),
    borderRadius: c(6, 5),
    overflow: 'hidden',
  },
  curriculumLessonList: {
    paddingTop: c(8, 6),
    paddingBottom: c(10, 8),
    paddingHorizontal: c(10, 8),
    backgroundColor: '#dff3e5',
  },
  curriculumLessonNest: {
    marginLeft: c(14, 12),
    paddingLeft: c(10, 8),
    borderLeftWidth: 3,
    borderLeftColor: TRAINING_GREEN,
    gap: c(5, 4),
  },
  curriculumEmptyText: {
    fontSize: c(12, 11),
    color: '#4a7a58',
    paddingVertical: c(8, 6),
    paddingHorizontal: c(4, 2),
  },
  curriculumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    paddingVertical: c(6, 5),
    paddingHorizontal: c(8, 7),
    borderRadius: c(8, 7),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#b9dfc2',
  },
  curriculumItemLocked: {
    opacity: 0.88,
    backgroundColor: '#f4faf6',
  },
  curriculumTypeIconWrap: {
    width: c(22, 20),
    height: c(22, 20),
    borderRadius: c(6, 5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  curriculumItemCopy: {
    flex: 1,
    minWidth: 0,
    gap: 0,
  },
  curriculumItemRight: {
    minWidth: c(22, 20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  curriculumPreviewPill: {
    fontSize: c(9.5, 8.5),
    fontWeight: '800',
    color: TRAINING_GREEN,
    backgroundColor: '#e6f4e8',
    paddingHorizontal: c(6, 5),
    paddingVertical: c(2, 1),
    borderRadius: c(5, 4),
    overflow: 'hidden',
  },
  curriculumItemTitle: {
    fontSize: c(12.5, 11.5),
    lineHeight: c(16, 15),
    fontWeight: '600',
    color: TRAINING_TEAL,
  },
  curriculumItemMeta: {
    fontSize: c(10.5, 9.5),
    color: TRAINING_MUTED,
    fontWeight: '500',
  },
  conceptItem: {
    fontSize: c(13, 12),
    lineHeight: c(19, 17),
    color: TRAINING_TEAL,
  },
  infoIconWrap: {
    width: c(40, 36),
    height: c(40, 36),
    borderRadius: c(12, 10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoEyebrow: {
    fontSize: c(10.5, 9.5),
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(12, 10),
  },
  instructorAvatar: {
    width: c(52, 46),
    height: c(52, 46),
    borderRadius: c(26, 23),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d7eadc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructorAvatarText: {
    fontSize: c(17, 15),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  instructorCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  docsLabel: {
    marginTop: c(8, 6),
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: c(8, 6),
  },
  actionLinkText: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
});
