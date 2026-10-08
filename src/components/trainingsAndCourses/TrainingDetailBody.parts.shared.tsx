import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { CoursePlayFillIcon } from '@/components/trainingsAndCourses/CourseLearningIcons';
import { ListingChevronIcon } from '@/components/market/MarketListingIcons';
import { MarketCheckoutLockIcon } from '@/components/market/MarketCheckoutIcons';
import {
  TRAINING_GREEN,
  TRAINING_MUTED,
} from '@/components/trainingsAndCourses/trainingData';
import { getTrainingProgressPath } from '@/components/trainingsAndCourses/trainingProgressData';
import { TrainingStickyVideoPlayer } from '@/components/trainingsAndCourses/TrainingStickyVideoPlayer';
import type {
  TrainingCurriculumItemType,
  TrainingDetailView,
} from '@/types/training.types';
import { openTrainingFile, saveTrainingFileToDevice } from '@/utils/downloadTrainingFile';
import { isYoutubeUrl } from '@/utils/trainingLessonMedia';
import { c } from '@/utils/newUiCompact';

import { styles } from '@/components/trainingsAndCourses/TrainingDetailBody.styles';

export type CurriculumItemView = {
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

export const CURRICULUM_TYPE_META: Record<
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

export function CurriculumChevron({ expanded }: { expanded: boolean }) {
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

/** Coupon chip — tap copies the code to the clipboard. */
export function CopyableCouponChip({
  couponCode,
  discountLabel,
}: {
  couponCode?: string | null;
  discountLabel?: string | null;
}) {
  const code = typeof couponCode === 'string' ? couponCode.trim() : '';
  const label = code
    ? `Coupon ${code}`
    : typeof discountLabel === 'string'
      ? discountLabel.trim()
      : '';
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  if (!label) return null;

  const onCopy = async () => {
    const value = code || label.replace(/^Coupon\s+/i, '').trim();
    if (!value) return;
    try {
      await Clipboard.setStringAsync(value);
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => {
        setCopied(false);
        copiedTimerRef.current = null;
      }, 1600);
    } catch {
      // Silent fail — no alert.
    }
  };

  return (
    <Pressable
      onPress={() => {
        void onCopy();
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={copied ? 'Coupon code copied' : `Copy coupon ${code || label}`}
      style={({ pressed }) => [
        styles.couponChip,
        copied && styles.couponChipCopied,
        pressed && !copied && styles.couponChipPressed,
      ]}
    >
      <Text style={[styles.couponChipText, copied && styles.couponChipTextCopied]}>
        {copied ? 'Copied' : label}
      </Text>
      <Ionicons
        name={copied ? 'checkmark' : 'copy-outline'}
        size={c(14, 13)}
        color={copied ? '#FFFFFF' : TRAINING_GREEN}
      />
    </Pressable>
  );
}

export function TrainingFaqList({
  faqs,
}: {
  faqs: { id: string; question: string; answer: string }[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <View style={styles.faqList}>
      {faqs.map((faq, index) => {
        const expanded = expandedId === faq.id;
        return (
          <View
            key={faq.id}
            style={[styles.faqCard, expanded && styles.faqCardOpen]}
          >
            <Pressable
              onPress={() =>
                setExpandedId((prev) => (prev === faq.id ? null : faq.id))
              }
              style={({ pressed }) => [
                styles.faqHeader,
                pressed && styles.faqHeaderPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              accessibilityLabel={faq.question || `FAQ ${index + 1}`}
            >
              <View style={[styles.faqIndex, expanded && styles.faqIndexOpen]}>
                <Text
                  style={[
                    styles.faqIndexText,
                    expanded && styles.faqIndexTextOpen,
                  ]}
                >
                  {String(index + 1).padStart(2, '0')}
                </Text>
              </View>
              <Text
                style={[styles.faqQuestion, expanded && styles.faqQuestionOpen]}
                numberOfLines={expanded ? undefined : 2}
              >
                {faq.question || `Question ${index + 1}`}
              </Text>
              <CurriculumChevron expanded={expanded} />
            </Pressable>
            {expanded && faq.answer ? (
              <View style={styles.faqAnswerWrap}>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function CurriculumTypeIcon({
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

export function summarizeCurriculumItems(items: CurriculumItemView[]): string {
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

export function Section({
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

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function RatingStars({
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

export function FactChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.factChip}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export function ReviewPreviewCard({
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
            {(author.trim().charAt(0) || 'L').toUpperCase()}
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

export function DiscussionsPreviewCard({
  enrolled,
  trainingId,
  enrollTitle,
  enrollPrice,
}: {
  enrolled: boolean;
  trainingId?: string;
  enrollTitle?: string;
  enrollPrice?: string;
}) {
  const router = useRouter();

  const onPress = () => {
    if (enrolled) {
      Alert.alert(
        'Open My Learning',
        'Q&A and discussions live in My Learning — open them there to ask questions and reply.',
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
      return;
    }

    Alert.alert(
      'Enroll to unlock',
      'Enroll in this program to access Q&A and discussions.',
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
  };

  return (
    <Pressable
      style={[styles.discussCard, !enrolled && styles.discussCardLocked]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        enrolled
          ? 'Q&A discussions — open My Learning'
          : 'Q&A discussions locked — enroll to unlock'
      }
    >
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
    </Pressable>
  );
}

export function ActionLink({
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

