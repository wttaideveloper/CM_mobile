import { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { CoursePlayFillIcon } from '@/components/trainingsAndCourses/CourseLearningIcons';
import { ListingChevronIcon } from '@/components/market/MarketListingIcons';
import { MarketCheckoutLockIcon } from '@/components/market/MarketCheckoutIcons';
import {
  TRAINING_GREEN,
  TRAINING_MUTED,
} from '@/components/trainingsAndCourses/trainingData';
import { getTrainingProgressPath } from '@/components/trainingsAndCourses/trainingProgressData';
import { TrainingStickyVideoPlayer } from '@/components/trainingsAndCourses/TrainingStickyVideoPlayer';
import type { TrainingDetailView } from '@/types/training.types';
import { openTrainingFile, saveTrainingFileToDevice } from '@/utils/downloadTrainingFile';
import { isYoutubeUrl } from '@/utils/trainingLessonMedia';

import {
  CURRICULUM_TYPE_META,
  Card,
  CurriculumChevron,
  CurriculumTypeIcon,
  summarizeCurriculumItems,
  type CurriculumItemView,
} from '@/components/trainingsAndCourses/TrainingDetailBody.parts.shared';
import { styles } from '@/components/trainingsAndCourses/TrainingDetailBody.styles';

export function CurriculumItemRow({
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
  const canOpenQuiz = !locked && item.type === 'quiz';
  const interactive = Boolean(onPress);

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
        style={[styles.curriculumItem, locked && styles.curriculumItemLocked]}
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

export function CurriculumSectionRow({
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
                    onPress={() => onItemPress(item)}
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

export function CurriculumBlock({
  trainingId,
  enrollTitle,
  enrollPrice,
  sessions,
  materials,
  onOpenMaterial,
  preferApiSessions = false,
  isSelfPaced = false,
  enrolled = false,
}: {
  trainingId?: string;
  enrollTitle?: string;
  enrollPrice?: string;
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
  // null = not touched → first section open; Set = multi-open user state
  const [expandedIds, setExpandedIds] = useState<Set<string> | null>(null);
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

  const isSectionExpanded = (sectionId: string) => {
    if (expandedIds === null) {
      return Boolean(defaultExpandedId) && sectionId === defaultExpandedId;
    }
    return expandedIds.has(sectionId);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(
        prev === null
          ? defaultExpandedId
            ? [defaultExpandedId]
            : []
          : prev,
      );
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const totalItems = useDayCurriculum
    ? previewDays.reduce((sum, day) => sum + day.lessons.length, 0)
    : sessions.reduce((sum, session) => sum + session.items.length, 0);

  const isItemLocked = (item: CurriculumItemView): boolean => {
    // Enrolled learners: no lock icons on detail (tap still opens My Learning).
    if (enrolled) return false;
    // Self-paced detail: unlock only `is_preview` lessons; others stay locked.
    if (!isSelfPaced) return true;
    return !item.isPreview;
  };

  const promptGoToLearning = () => {
    Alert.alert(
      'Open My Learning',
      'You’re already enrolled in this program. Lessons, videos, quizzes, and progress are tracked in My Learning — open them there so your completion and watch progress stay up to date.',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Go to learning',
          onPress: () => {
            router.push({
              pathname: '/(main)/market/my-training-progress',
              params: { id: trainingId ?? '' },
            });
          },
        },
      ],
    );
  };

  const onItemPress = (item: CurriculumItemView) => {
    // Enrolled users should use My Learning (progress is tracked there).
    if (enrolled) {
      promptGoToLearning();
      return;
    }

    if (isItemLocked(item)) {
      Alert.alert(
        'Enroll to unlock',
        'Enroll in this program to access locked lessons.',
        [
          { text: 'Not now', style: 'cancel' },
          {
            text: 'Enroll now',
            onPress: () => {
              if (!trainingId) return;
              router.push({
                pathname: '/(main)/market/training-checkout',
                params: {
                  id: trainingId,
                  title: enrollTitle ?? '',
                  price: enrollPrice ?? '',
                },
              });
            },
          },
        ],
      );
      return;
    }

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

    if (item.type === 'youtube' || isYoutubeUrl(item.videoUrl)) {
      const url = item.videoUrl?.trim();
      if (!url) {
        Alert.alert('YouTube', 'No YouTube link is attached to this item yet.');
        return;
      }
      void Linking.openURL(url).catch(() => {
        Alert.alert('YouTube', url);
      });
      return;
    }

    if (item.type === 'video' && item.videoUrl?.trim()) {
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

    if (item.type === 'pdf' || item.type === 'notes') {
      Alert.alert(
        'Document unavailable',
        'This document has no file link yet. Try again later, or open it from My Learning after enrolling.',
      );
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
          {enrolled
            ? ' · Open lessons in My Learning'
            : isSelfPaced
              ? ' · Preview lessons unlocked'
              : ''}
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
                    expanded={isSectionExpanded(day.id)}
                    isLast={dayIndex === previewDays.length - 1}
                    isItemLocked={isItemLocked}
                    onItemPress={onItemPress}
                    onToggle={() => toggleSection(day.id)}
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
                    expanded={isSectionExpanded(session.id)}
                    isLast={index === sessions.length - 1}
                    isItemLocked={isItemLocked}
                    onItemPress={onItemPress}
                    onToggle={() => toggleSection(session.id)}
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
              <View
                key={material.id}
                style={[
                  styles.sessionRow,
                  index < materials.length - 1 && styles.infoBorder,
                ]}
              >
                <Pressable
                  style={styles.sessionCopy}
                  onPress={() => onOpenMaterial(material.url)}
                  accessibilityRole="button"
                >
                  <Text style={styles.sessionTitle}>{material.title}</Text>
                  <Text style={styles.infoMeta}>
                    {[material.type, material.size !== '—' ? material.size : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </Pressable>
                {material.url ? (
                  <Pressable
                    onPress={() => {
                      void saveTrainingFileToDevice({
                        url: material.url,
                        suggestedName: material.title,
                      });
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Download ${material.title}`}
                  >
                    <Text style={styles.linkText}>Download</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </Card>
        </>
      ) : null}
    </View>
  );
}

