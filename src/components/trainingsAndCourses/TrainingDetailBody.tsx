import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { TrainingCoverImage } from '@/components/trainingsAndCourses/TrainingCoverImage';
import { BizProfilePinIcon } from '@/components/market/MarketBusinessProfileIcons';
import {
  EventDetailCalSmallIcon,
  EventDetailPersonIcon,
} from '@/components/market/MarketEventDetailIcons';
import {
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/trainingsAndCourses/trainingData';
import { TrainingAnnouncementsPanel } from '@/components/trainingsAndCourses/TrainingAnnouncementsPanel';
import {
  useTraining,
  useTrainingReviews,
  useMyTrainingEnrolments,
} from '@/hooks/useTrainings';
import { buildStaticTrainingDetail } from '@/utils/buildStaticTrainingDetail';
import {
  openTrainingFile,
  probeTrainingFileSizeBytes,
  saveTrainingFileToDevice,
} from '@/utils/downloadTrainingFile';
import { formatTrainingFileSize } from '@/utils/trainingFileSize';

import {
  ActionLink,
  CopyableCouponChip,
  CurriculumBlock,
  DiscussionsPreviewCard,
  FactChip,
  RatingStars,
  ReviewPreviewCard,
  Section,
  TrainingFaqList,
} from '@/components/trainingsAndCourses/TrainingDetailBody.parts';
import { styles } from '@/components/trainingsAndCourses/TrainingDetailBody.styles';
import { TrainingDetailBodyView } from '@/components/trainingsAndCourses/TrainingDetailBody.view';

export function TrainingDetailBody() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { training, isApiId, isLoading, isError, error, refetch, isFetching } =
    useTraining(id);
  const reviewsQuery = useTrainingReviews(isApiId ? id : undefined);
  const enrolments = useMyTrainingEnrolments();
  const [noteSizeById, setNoteSizeById] = useState<Record<string, string>>({});
  const [openingNoteId, setOpeningNoteId] = useState<string | null>(null);
  const [downloadingNoteId, setDownloadingNoteId] = useState<string | null>(
    null,
  );

  const d = isApiId ? training : buildStaticTrainingDetail(id);

  useEffect(() => {
    const notes = d?.notes ?? [];
    const missing = notes.filter(
      (note) => !note.sizeLabel && !noteSizeById[note.id] && note.url,
    );
    if (missing.length === 0) return;

    let cancelled = false;
    void (async () => {
      const next: Record<string, string> = {};
      await Promise.all(
        missing.map(async (note) => {
          const bytes = await probeTrainingFileSizeBytes(note.url);
          const label = formatTrainingFileSize(bytes);
          if (label) next[note.id] = label;
        }),
      );
      if (!cancelled && Object.keys(next).length > 0) {
        setNoteSizeById((prev) => ({ ...prev, ...next }));
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d?.notes]);

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

  const enrolled =
    Boolean(d.canContinueLearning) ||
    (isApiId &&
      enrolments.isEnrolled(d.id) &&
      !enrolments.isPendingApproval(d.id));
  const pendingApproval =
    Boolean(d.isPendingApproval) ||
    (isApiId && enrolments.isPendingApproval(d.id));
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
  const attendMeetingId = hasReal(d.meetingId) ? d.meetingId : '';
  const attendPasscode = hasReal(d.meetingPasscode) ? d.meetingPasscode : '';
  const showAttend =
    Boolean(attendModeLabel) ||
    Boolean(attendVenue) ||
    Boolean(attendAddress) ||
    Boolean(attendProvider) ||
    Boolean(attendMeetingLink) ||
    Boolean(attendMeetingId) ||
    Boolean(attendPasscode);

  const availableCount = Number.parseInt(String(d.available).trim(), 10);
  const hasAvailableCount =
    Number.isFinite(availableCount) &&
    hasReal(d.available, ['—']);
  const seatsFilled =
    d.enrolmentGate === 'full' || (hasAvailableCount && availableCount <= 0);
  /** Scarcity copy for seats: “Only 2 left” / “Seats filled”. */
  const seatsUrgencyLabel = seatsFilled
    ? 'Seats filled'
    : hasAvailableCount && availableCount <= 5
      ? `Only ${availableCount} left`
      : hasAvailableCount
        ? `${availableCount} seats left`
        : '';
  const seatsMeta = [
    hasReal(d.enrolled, ['—']) ? `${d.enrolled} people joined` : null,
    hasReal(d.capacityMax, ['—']) ? `Capacity ${d.capacityMax}` : null,
    d.requiresApproval ? 'Approval required' : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const enrolmentStartLabel = hasReal(d.enrolmentOpensLabel)
    ? d.enrolmentOpensLabel
    : '';
  const enrolmentEndLabel = hasReal(d.enrolmentDeadline, ['Open enrollment'])
    ? d.enrolmentDeadline
    : '';
  const enrolmentWindowTitle = [
    enrolmentStartLabel ? `Starts ${enrolmentStartLabel}` : null,
    enrolmentEndLabel ? `Ends ${enrolmentEndLabel}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const enrolmentWindowMeta =
    d.enrolmentGate === 'not_yet_open'
      ? 'Not open yet'
      : d.enrolmentGate === 'closed'
        ? 'Enrolment closed'
        : seatsFilled
          ? 'Seats filled'
          : '';
  const showEnrolmentWindow = Boolean(enrolmentWindowTitle);
  const showSeats = Boolean(seatsUrgencyLabel) || Boolean(seatsMeta);
  const showWhenWhere =
    showSchedule || showAttend || showSeats || showEnrolmentWindow;

  return (
    <TrainingDetailBodyView
      attendAddress={attendAddress}
      attendMeetingId={attendMeetingId}
      attendMeetingLink={attendMeetingLink}
      attendModeLabel={attendModeLabel}
      attendPasscode={attendPasscode}
      attendProvider={attendProvider}
      attendVenue={attendVenue}
      availableCount={availableCount}
      averageRating={averageRating}
      d={d}
      downloadingNoteId={downloadingNoteId}
      enrolled={enrolled}
      enrolmentEndLabel={enrolmentEndLabel}
      enrolmentStartLabel={enrolmentStartLabel}
      enrolmentWindowMeta={enrolmentWindowMeta}
      enrolmentWindowTitle={enrolmentWindowTitle}
      enrolments={enrolments}
      error={error}
      hasAvailableCount={hasAvailableCount}
      hasReal={hasReal}
      id={id}
      isApiId={isApiId}
      isError={isError}
      isFetching={isFetching}
      isLoading={isLoading}
      noteSizeById={noteSizeById}
      openLink={openLink}
      openingNoteId={openingNoteId}
      pendingApproval={pendingApproval}
      refetch={refetch}
      reviewCount={reviewCount}
      reviews={reviews}
      reviewsQuery={reviewsQuery}
      router={router}
      scheduleMeta={scheduleMeta}
      scheduleTitle={scheduleTitle}
      seatsFilled={seatsFilled}
      seatsMeta={seatsMeta}
      seatsUrgencyLabel={seatsUrgencyLabel}
      setDownloadingNoteId={setDownloadingNoteId}
      setNoteSizeById={setNoteSizeById}
      setOpeningNoteId={setOpeningNoteId}
      showAttend={showAttend}
      showEnrolmentWindow={showEnrolmentWindow}
      showSchedule={showSchedule}
      showSeats={showSeats}
      showWhenWhere={showWhenWhere}
      training={training}
    />
  );
}
