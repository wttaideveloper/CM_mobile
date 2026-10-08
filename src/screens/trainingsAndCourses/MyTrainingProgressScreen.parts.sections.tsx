import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import {
  CoursePlayFillIcon,
} from '@/components/trainingsAndCourses/CourseLearningIcons';
import {
  TRAINING_GREEN,
} from '@/components/trainingsAndCourses/trainingData';
import {
  type TrainingDay,
  type TrainingLesson,
} from '@/components/trainingsAndCourses/trainingProgressData';
import { VIDEO_COMPLETE_THRESHOLD } from '@/stores/trainingProgress.store';
import { formatAttendanceDateTime, formatSessionStartLabel, parseSessionStart } from '@/utils/dateTime';
import {
  asPlainText,
  clampDisplayText,
} from '@/utils/trainingLessonMedia';

import { styles } from '@/screens/trainingsAndCourses/MyTrainingProgressScreen.styles';

export function FieldRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: unknown;
  /** When set, value renders as a tappable link (e.g. meeting URL). */
  onPress?: () => void;
}) {
  const text = clampDisplayText(asPlainText(value), 2_000);
  if (!text) return null;
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="link"
          hitSlop={6}
          style={{ flexShrink: 1 }}
        >
          <Text style={[styles.fieldValue, styles.fieldValueLink]} selectable>
            {text}
          </Text>
        </Pressable>
      ) : (
        <Text style={styles.fieldValue} selectable>
          {text}
        </Text>
      )}
    </View>
  );
}

/** Format lesson/section scheduled_at (or free-form schedule) for My Learning UI. */
export function formatSessionWhenLabel(
  ...values: Array<string | null | undefined>
): string {
  const start = parseSessionStart(...values);
  if (start) return formatSessionStartLabel(start);
  for (const value of values) {
    const text = asPlainText(value);
    if (text) return text;
  }
  return '';
}

export function ApiLessonJoinPanel({
  lesson,
  onJoin,
}: {
  lesson: TrainingLesson;
  onJoin: () => void;
}) {
  const meetingLink = asPlainText(lesson.joinUrl);
  const canJoin = Boolean(meetingLink);
  const whenLabel = formatSessionWhenLabel(lesson.startsAt, lesson.checkInWindow);

  return (
    <View style={styles.inlineLive}>
      <View style={styles.liveJoinCard}>
        <Text style={styles.liveJoinEyebrow}>Session details</Text>
        <Text style={styles.liveJoinTitle} numberOfLines={4}>
          {clampDisplayText(asPlainText(lesson.title, 'Session'), 200)}
        </Text>
        {whenLabel ? <FieldRow label="When" value={whenLabel} /> : null}
        <FieldRow
          label="Meeting link"
          value={meetingLink}
          onPress={canJoin ? onJoin : undefined}
        />
        <FieldRow label="Meeting ID" value={lesson.joinMeta ?? ''} />
        <FieldRow
          label="Duration"
          value={lesson.duration === '—' ? '' : lesson.duration}
        />
        {canJoin ? (
          <Pressable style={styles.primaryBtn} onPress={onJoin}>
            <Text style={styles.primaryBtnText}>Join session</Text>
          </Pressable>
        ) : (
          <Text style={styles.inlineHint}>
            Join when the meeting link is available.
          </Text>
        )}
      </View>
    </View>
  );
}

export function SessionMeetingPanel({
  day,
  onJoin,
}: {
  day: TrainingDay;
  onJoin: () => void;
}) {
  const meetingLink = asPlainText(day.meetingLink);
  const schedule = formatSessionWhenLabel(day.schedule);
  const venue = asPlainText(day.venue);
  const address = asPlainText(day.address);
  const passCode = asPlainText(day.passCode);
  const qrImageUri = asPlainText(day.qrImageBase64);
  const attended = Boolean(day.isAttended);
  const attendedLabel = formatAttendanceDateTime(day.attendedAt);
  const sectionType = asPlainText(day.sectionType).toLowerCase();
  const isVenueSection =
    sectionType === 'venue' ||
    ((!meetingLink && (venue || address || passCode || qrImageUri)) &&
      sectionType !== 'live');

  if (isVenueSection) {
    if (!schedule && !venue && !address && !passCode && !qrImageUri && !attended) {
      return null;
    }
    return (
      <View style={styles.inlineLive}>
        <View
          style={[
            styles.liveJoinCard,
            attended && styles.liveJoinCardAttended,
          ]}
        >
          <Text style={styles.liveJoinEyebrow}>
            {attended ? 'Venue · attended' : 'Venue check-in'}
          </Text>
          <Text style={styles.liveJoinTitle} numberOfLines={4}>
            {clampDisplayText(asPlainText(day.dayLabel, 'Session'), 200)}
          </Text>
          {schedule ? <FieldRow label="When" value={schedule} /> : null}
          {attended ? (
            <>
              <Text style={styles.attendedBanner}>
                Check-in complete
                {attendedLabel ? ` · ${attendedLabel}` : ''}
              </Text>
              {venue ? <FieldRow label="Venue" value={venue} /> : null}
              {address ? <FieldRow label="Address" value={address} /> : null}
              <Text style={styles.inlineHint}>
                You’ve already checked in. Continue with the materials below.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.venueQrBlock}>
                <Text style={styles.qrSectionLabel}>Show this QR at the door</Text>
                <SessionQrImage uri={qrImageUri} seed={passCode || day.id} />
                {passCode ? <VenuePassCodeRow code={passCode} /> : null}
              </View>
              {venue ? <FieldRow label="Venue" value={venue} /> : null}
              {address ? <FieldRow label="Address" value={address} /> : null}
              <Text style={styles.inlineHint}>
                Session materials are listed below — work through them after
                check-in.
              </Text>
            </>
          )}
        </View>
      </View>
    );
  }

  if (!meetingLink && !schedule && !attended) return null;

  return (
    <View style={styles.inlineLive}>
      <View
        style={[styles.liveJoinCard, attended && styles.liveJoinCardAttended]}
      >
        <Text style={styles.liveJoinEyebrow}>
          {attended ? 'Live · attended' : 'Live meeting'}
        </Text>
        <Text style={styles.liveJoinTitle} numberOfLines={4}>
          {clampDisplayText(asPlainText(day.dayLabel, 'Session'), 200)}
        </Text>
        {schedule ? <FieldRow label="When" value={schedule} /> : null}
        {attended ? (
          <>
            <Text style={styles.attendedBanner}>
              Attendance recorded
              {attendedLabel ? ` · ${attendedLabel}` : ''}
            </Text>
            <Text style={styles.inlineHint}>
              You’ve already joined this session. Continue with the materials
              below.
            </Text>
          </>
        ) : (
          <>
            {meetingLink ? (
              <FieldRow
                label="Meeting link"
                value={meetingLink}
                onPress={onJoin}
              />
            ) : null}
            {venue ? <FieldRow label="Venue" value={venue} /> : null}
            {address ? <FieldRow label="Address" value={address} /> : null}
            {meetingLink ? (
              <Pressable style={styles.primaryBtn} onPress={onJoin}>
                <Text style={styles.primaryBtnText}>Join meeting</Text>
              </Pressable>
            ) : (
              <Text style={styles.inlineHint}>
                Meeting link will appear when the host shares it.
              </Text>
            )}
            <Text style={styles.inlineHint}>
              Session materials are listed below — work through them in order.
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

export function ProgressTracker({
  percent,
  label,
}: {
  percent: number;
  label: string;
}) {
  return (
    <View style={styles.tracker}>
      <View style={styles.trackerRow}>
        <Text style={styles.trackerLabel}>{label}</Text>
        <Text style={styles.trackerPercent}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, percent)}%` }]} />
      </View>
    </View>
  );
}

/** Decorative static QR (not a real encoded QR). Used only when API image is missing. */
export function StaticQrPass({ seed }: { seed: string }) {
  const size = 17;
  const cells = useMemo(() => {
    const grid: boolean[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => false),
    );
    const paintFinder = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y += 1) {
        for (let x = 0; x < 7; x += 1) {
          const edge = x === 0 || y === 0 || x === 6 || y === 6;
          const center = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          grid[oy + y][ox + x] = edge || center;
        }
      }
    };
    paintFinder(0, 0);
    paintFinder(size - 7, 0);
    paintFinder(0, size - 7);
    let hash = 0;
    const safeSeed = seed.slice(0, 64) || 'qr';
    for (let i = 0; i < safeSeed.length; i += 1) {
      hash = (hash * 31 + safeSeed.charCodeAt(i)) >>> 0;
    }
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const inFinder =
          (x < 8 && y < 8) ||
          (x >= size - 8 && y < 8) ||
          (x < 8 && y >= size - 8);
        if (inFinder) continue;
        hash = (hash * 1664525 + 1013904223) >>> 0;
        grid[y][x] = hash % 3 !== 0;
      }
    }
    return grid;
  }, [seed]);

  return (
    <View style={styles.qrOuter}>
      <View style={styles.qrInner}>
        {cells.map((row, y) => (
          <View key={`r-${y}`} style={styles.qrRow}>
            {row.map((on, x) => (
              <View
                key={`c-${y}-${x}`}
                style={[styles.qrCell, on ? styles.qrCellOn : styles.qrCellOff]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

/** Venue QR / pass code with a copy action on the right. */
export function VenuePassCodeRow({ code }: { code: string }) {
  const value = asPlainText(code);
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  if (!value) return null;

  const onCopy = async () => {
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
    <View style={styles.passCodeRow}>
      <Text style={styles.passCode} selectable>
        {value}
      </Text>
      <Pressable
        onPress={() => {
          void onCopy();
        }}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={copied ? 'Copied' : 'Copy QR code'}
        style={[styles.passCodeCopyBtn, copied && styles.passCodeCopyBtnDone]}
      >
        <Ionicons
          name={copied ? 'checkmark' : 'copy-outline'}
          size={18}
          color={copied ? '#FFFFFF' : TRAINING_GREEN}
        />
        <Text
          style={[styles.passCodeCopyLabel, copied && styles.passCodeCopyLabelDone]}
        >
          {copied ? 'Copied' : 'Copy'}
        </Text>
      </Pressable>
    </View>
  );
}

/** Prefer content API `qr_image_base64`; fall back to decorative pass. */
export function SessionQrImage({
  uri,
  seed,
}: {
  uri?: string | null;
  seed: string;
}) {
  const [failed, setFailed] = useState(false);
  const imageUri = asPlainText(uri);
  if (imageUri && !failed && imageUri.length < 350_000) {
    return (
      <View style={styles.qrOuter}>
        <Image
          source={{ uri: imageUri }}
          style={styles.qrApiImage}
          contentFit="contain"
          onError={() => setFailed(true)}
        />
      </View>
    );
  }
  return <StaticQrPass seed={seed} />;
}

export function InlineTextLessonPanel({ lesson }: { lesson: TrainingLesson }) {
  const body = clampDisplayText(
    asPlainText(lesson.bodyText) ||
      asPlainText(lesson.detail) ||
      'No written content for this topic yet.',
    8_000,
  );

  return (
    <View style={styles.inlineLive}>
      <View style={styles.liveJoinCard}>
        <Text style={styles.liveJoinEyebrow}>Topic</Text>
        <Text style={styles.liveJoinTitle} numberOfLines={6}>
          {clampDisplayText(asPlainText(lesson.title, 'Topic'), 200)}
        </Text>
        <Text style={styles.lessonBodyText} selectable>
          {body}
        </Text>
      </View>
    </View>
  );
}

export function InlineVideoPlayer({
  lesson,
  watchPercent,
  playing,
  onTogglePlay,
}: {
  lesson: TrainingLesson;
  watchPercent: number;
  playing: boolean;
  onTogglePlay: () => void;
}) {
  return (
    <View style={styles.inlinePlayer}>
      <View style={styles.videoStage}>
        {lesson.imageUrl ? (
          <Image
            source={{ uri: lesson.imageUrl }}
            style={styles.videoStageImage}
            contentFit="cover"
            transition={200}
          />
        ) : null}
        <View style={styles.videoStageScrim} />
        <Pressable
          style={styles.playOuter}
          onPress={onTogglePlay}
          accessibilityRole="button"
        >
          <View style={styles.playInner}>
            <CoursePlayFillIcon size={18} color="#FFFFFF" />
          </View>
        </Pressable>
        <Text style={styles.videoCaption}>
          {playing
            ? `Watching · ${watchPercent}% seen`
            : watchPercent > 0
              ? `Paused · ${watchPercent}% seen`
              : 'Tap play to watch this lesson'}
        </Text>
      </View>
      <View style={styles.watchMetaRow}>
        <Text style={styles.watchMeta}>
          Seen {watchPercent}% · completes at {VIDEO_COMPLETE_THRESHOLD}%
        </Text>
        <Text style={styles.watchMeta}>{lesson.duration}</Text>
      </View>
      <View style={styles.watchTrack}>
        <View
          style={[
            styles.watchFill,
            { width: `${Math.min(100, watchPercent)}%` },
          ]}
        />
      </View>
    </View>
  );
}

