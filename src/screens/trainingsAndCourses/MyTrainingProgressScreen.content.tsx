import { ActivityIndicator, Linking, Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { TrainingCoverImage } from '@/components/trainingsAndCourses/TrainingCoverImage';
import { TrainingStickyVideoPlayer } from '@/components/trainingsAndCourses/TrainingStickyVideoPlayer';
import { TrainingAnnouncementsPanel } from '@/components/trainingsAndCourses/TrainingAnnouncementsPanel';
import { TrainingDiscussionsPanel } from '@/components/trainingsAndCourses/TrainingDiscussionsPanel';
import {
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/trainingsAndCourses/trainingData';
import { TrainingScreenShell } from '@/screens/trainingsAndCourses/TrainingScreenShell';
import {
  ApiLessonJoinPanel,
  CurriculumChevron,
  FieldRow,
  InlineTextLessonPanel,
  InlineVideoPlayer,
  LessonDownloadIcon,
  LessonStatusIcon,
  LessonTypeIcon,
  LESSON_TYPE_META,
  ProgressTracker,
  SessionMeetingPanel,
  SessionQrImage,
  VenuePassCodeRow,
  formatSessionWhenLabel,
  isStickyCourseVideo,
} from '@/screens/trainingsAndCourses/MyTrainingProgressScreen.parts';
import { styles } from '@/screens/trainingsAndCourses/MyTrainingProgressScreen.styles';
import type { MyTrainingProgressModel } from '@/screens/trainingsAndCourses/useMyTrainingProgressScreen';
import {
  downloadTrainingToLibrary,
  openTrainingFile,
} from '@/utils/downloadTrainingFile';
import {
  asPlainText,
  clampDisplayText,
} from '@/utils/trainingLessonMedia';
import { formatAttendanceDateTime } from '@/utils/dateTime';
import { VIDEO_COMPLETE_THRESHOLD } from '@/stores/trainingProgress.store';
import { ENDPOINTS } from '@/services/api/endpoints';
import { MyTrainingProgressCurriculum } from '@/screens/trainingsAndCourses/MyTrainingProgressScreen.content.curriculum';

export function MyTrainingProgressContent({
  m,
}: {
  m: MyTrainingProgressModel;
}) {
  const {
    LIVE_VENUE_JOIN_WINDOW_MS,
    TOPIC_COMPLETE_DELAY_MS,
    activeVideo,
    activeVideoIndex,
    activeVideoLessonId,
    alertIfLiveVenueExpired,
    alertIfLiveVenueTooEarly,
    announcementsSectionRef,
    attendingLessonIdsRef,
    attendingSessionIdsRef,
    bucket,
    certificateQuery,
    certificateSectionRef,
    checkingApproval,
    clearPendingTopicComplete,
    closeStickyPlayer,
    completeLesson,
    completeLessonMutation,
    completingLessonIdsRef,
    contentQuery,
    contentReady,
    continueItem,
    dayStatusLabel,
    didApplyFocusRef,
    didAutoResumeRef,
    discussionsSectionRef,
    downloadUrlForLesson,
    downloadingLessonId,
    downloadingNoteId,
    enrolments,
    ensureDayExpanded,
    examLockMessage,
    expandedDayIds,
    firstDayId,
    focus,
    focusRaw,
    getLiveVenueExpiredStatus,
    getLiveVenueScheduleGate,
    goAdjacentVideo,
    hasDownloaded,
    howto,
    hydrateDownloads,
    id,
    iosKeyboardOpen,
    isApiId,
    isDayComplete,
    isDayContentDone,
    isDayExpanded,
    isExamUnlocked,
    isLessonDone,
    isLiveOnlineTraining,
    joinLive,
    joinSessionMeeting,
    keyboardBottomInset,
    keyboardHeightRef,
    kindLine,
    lastPlaybackRef,
    lastSavedProgressRef,
    lessonAttendanceMutation,
    liveAttendanceMutation,
    markLessonComplete,
    nextStepText,
    noteSizeById,
    onCheckApprovalStatus,
    onDownloadLesson,
    onLessonPress,
    onStickyPlaybackTime,
    onStickyWatchPercent,
    openCertificate,
    openLessonId,
    openLessonIdRef,
    openingCertificate,
    openingNoteId,
    path,
    pendingApproval,
    pendingDiscussionFocusRef,
    pendingTopicCompleteRef,
    percent,
    persistLessonPlayback,
    playRef,
    playing,
    progressLabel,
    progressQuery,
    progressSecondsForLesson,
    recordLessonAttendance,
    recordSessionAttendance,
    router,
    saveLessonProgressMutation,
    scheduleTopicLessonComplete,
    scrollDiscussionInputIntoView,
    scrollOffsetYRef,
    scrollRef,
    scrollTargetIntoView,
    seededRef,
    selectVideoLesson,
    setActiveLesson,
    setActiveVideoLessonId,
    setCheckingApproval,
    setDownloadingLessonId,
    setDownloadingNoteId,
    setExpandedDayIds,
    setNoteSizeById,
    setOpenLessonId,
    setOpeningCertificate,
    setOpeningNoteId,
    setPlaying,
    setVideoWatchPercent,
    toggleExpandedDay,
    trainingId,
    trainingQuery,
    userId,
    videoPlaylist,
    watchPercentFor,
  } = m as any;

  return (
    <TrainingScreenShell
      eyebrow={`${
        path.deliveryMode === 'Virtual'
          ? 'Online'
          : path.deliveryMode === 'Self-paced'
            ? 'Self-paced'
            : path.deliveryMode
      } · My learning`}
      title={clampDisplayText(asPlainText(path.title, 'Course'), 80)}
      flatBottom
      scrollViewRef={scrollRef}
      onScrollOffsetChange={(y) => {
        scrollOffsetYRef.current = y;
      }}
      keyboardBottomInset={keyboardBottomInset}
      rightLabel={isApiId ? 'My Assessments' : undefined}
      onRightPress={
        isApiId
          ? () =>
              router.push({
                pathname: '/(main)/market/my-training-assessments',
                params: { id: trainingId },
              })
          : undefined
      }
      stickyBelowHeader={
        iosKeyboardOpen &&
        !isLiveOnlineTraining &&
        activeVideo &&
        (isStickyCourseVideo(activeVideo.lesson) || !isApiId) ? (
          <View style={styles.keyboardPausedBar}>
            <Text style={styles.keyboardPausedText} numberOfLines={1}>
              Video paused while typing
            </Text>
          </View>
        ) : !isLiveOnlineTraining &&
        activeVideo &&
        isStickyCourseVideo(activeVideo.lesson) ? (
          <TrainingStickyVideoPlayer
            url={asPlainText(activeVideo.lesson.videoUrl)}
            title={clampDisplayText(
              asPlainText(activeVideo.lesson.title, 'Lesson'),
              120,
            )}
            subtitle={clampDisplayText(
              `${asPlainText(activeVideo.day.dayLabel)} · ${asPlainText(path.title)}`,
              160,
            )}
            initialSeekSeconds={progressSecondsForLesson(activeVideo.lesson.id)}
            hasPrevious={activeVideoIndex > 0}
            hasNext={
              activeVideoIndex >= 0 &&
              activeVideoIndex < videoPlaylist.length - 1
            }
            onPrevious={() => goAdjacentVideo(-1)}
            onNext={() => goAdjacentVideo(1)}
            onWatchPercent={onStickyWatchPercent}
            onPlaybackTime={onStickyPlaybackTime}
            onClose={() => {
              closeStickyPlayer();
              setActiveLesson(trainingId, undefined);
            }}
          />
        ) : !isLiveOnlineTraining && activeVideo && !isApiId ? (
          <View style={styles.stickyDemoWrap}>
            <InlineVideoPlayer
              lesson={activeVideo.lesson}
              watchPercent={watchPercentFor(activeVideo.lesson.id)}
              playing={playing}
              onTogglePlay={() => setPlaying((p) => !p)}
            />
            <View style={styles.stickyDemoToolbar}>
              <Pressable
                style={[
                  styles.stickyDemoNav,
                  activeVideoIndex <= 0 && styles.toolDisabled,
                ]}
                disabled={activeVideoIndex <= 0}
                onPress={() => goAdjacentVideo(-1)}
              >
                <Text style={styles.stickyDemoNavText}>Prev</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.stickyDemoNav,
                  (activeVideoIndex < 0 ||
                    activeVideoIndex >= videoPlaylist.length - 1) &&
                    styles.toolDisabled,
                ]}
                disabled={
                  activeVideoIndex < 0 ||
                  activeVideoIndex >= videoPlaylist.length - 1
                }
                onPress={() => goAdjacentVideo(1)}
              >
                <Text style={styles.stickyDemoNavText}>Next</Text>
              </Pressable>
              <Pressable
                style={styles.stickyDemoClose}
                onPress={() => {
                  setActiveVideoLessonId(null);
                  setPlaying(false);
                }}
              >
                <Text style={styles.stickyDemoCloseText}>Close</Text>
              </Pressable>
            </View>
          </View>
        ) : null
      }
    >
      <View style={styles.heroBanner}>
        <TrainingCoverImage
          uri={path.bannerUrl}
          title={asPlainText(path.title, 'Course')}
          style={styles.heroBannerImage}
          placeholderTextStyle={styles.heroBannerInitials}
          transition={0}
          cachePolicy="memory-disk"
          recyclingKey={path.bannerUrl || undefined}
        />
        <View style={styles.heroBannerScrim} pointerEvents="none" />
        <View style={styles.heroBannerTop}>
          <View style={styles.heroModePill}>
            <Text style={styles.heroModePillText}>
              {(path.deliveryMode === 'Virtual'
                ? 'Online'
                : path.deliveryMode === 'Physical'
                  ? 'Physical'
                  : path.deliveryMode
              ).toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.heroBannerCopy}>
          <Text style={styles.heroBannerEyebrow}>Your course</Text>
          <Text style={styles.heroBannerTitle} numberOfLines={2}>
            {clampDisplayText(asPlainText(path.title, 'Course'), 120)}
          </Text>
          <Text style={styles.heroBannerMeta} numberOfLines={1}>
            {clampDisplayText(asPlainText(path.instructor), 80)}
            {asPlainText(path.vendor)
              ? ` · ${clampDisplayText(asPlainText(path.vendor), 80)}`
              : ''}
          </Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <ProgressTracker
          percent={percent}
          label={
            percent === 0
              ? 'Just getting started'
              : percent >= 100
                ? 'Training complete'
                : `You're ${percent}% through this training`
          }
        />
        <Text style={styles.progressSub}>{progressLabel}</Text>
        <View style={styles.nextBanner}>
          <Text style={styles.nextBannerLabel}>What to do now</Text>
          <Text style={styles.nextBannerText}>{nextStepText}</Text>
        </View>
      </View>

      {isApiId && certificateQuery.isAvailable ? (
        <View ref={certificateSectionRef} style={styles.certificateCard}>
          <Text style={styles.certificateEyebrow}>Certificate</Text>
          <Text style={styles.certificateTitle}>
            You’ve unlocked your completion certificate
          </Text>
          <Text style={styles.certificateMeta}>
            {certificateQuery.certificate?.completed_at
              ? `Completed · ${new Date(
                  certificateQuery.certificate.completed_at,
                ).toLocaleDateString()}`
              : 'All mandatory lessons complete'}
          </Text>
          <Pressable
            style={[
              styles.certificateBtn,
              openingCertificate && styles.certificateBtnBusy,
            ]}
            onPress={openCertificate}
            disabled={openingCertificate}
            accessibilityRole="button"
          >
            {openingCertificate ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.certificateBtnText}>Download certificate</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      <View style={styles.howtoCard}>
        <Text style={styles.howtoTitle}>{howto.title}</Text>
        <Text style={styles.howtoText}>{howto.text}</Text>
      </View>

      <MyTrainingProgressCurriculum m={m} />

      <View ref={announcementsSectionRef}>
        <TrainingAnnouncementsPanel
          trainingId={isApiId ? (id ?? trainingId) : trainingId}
          enabled={isApiId}
        />
      </View>

      <View ref={discussionsSectionRef}>
        <TrainingDiscussionsPanel
          trainingId={isApiId ? (id ?? trainingId) : trainingId}
          enabled={isApiId}
          onEnsureInputVisible={scrollDiscussionInputIntoView}
        />
      </View>
    </TrainingScreenShell>
  );

}
