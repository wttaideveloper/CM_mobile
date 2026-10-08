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
import { MyTrainingProgressNotes } from '@/screens/trainingsAndCourses/MyTrainingProgressScreen.content.notes';

export function MyTrainingProgressCurriculum({
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
    <>
      <View style={styles.curriculumPanel}>
        <Text style={styles.curriculumLabel}>
          {isLiveOnlineTraining
            ? 'Sessions'
            : activeVideo
              ? 'Lectures'
              : 'Curriculum'}
        </Text>
        <Text style={styles.curriculumHelp}>
          {isLiveOnlineTraining
            ? `${path.days.length} live session${path.days.length === 1 ? '' : 's'} · tap to expand · multiple can stay open`
            : activeVideo
              ? 'Tap another video to play it above · scroll while watching'
              : `${path.days.length} section${path.days.length === 1 ? '' : 's'} · ${path.days.reduce((sum, day) => sum + day.lessons.length, 0)} items · tap a video to play at the top`}
        </Text>

        <View style={styles.curriculumCard}>
          {path.days.map((day, dayIndex) => {
          const expanded = isDayExpanded(day.id);
          const dayDone = isDayComplete(day);
          const contentDone = isDayContentDone(day);
          const examOpen = isExamUnlocked(day);
          const doneCount = day.lessons.filter((lesson) =>
            isLessonDone(lesson),
          ).length;
          const total = day.lessons.length;
          const dayAttendedAt = formatAttendanceDateTime(day.attendedAt);
          const expiredLesson = day.lessons.find(
            (lesson) => getLiveVenueExpiredStatus(day, lesson)?.expired,
          );
          const expiredWhen = expiredLesson
            ? getLiveVenueExpiredStatus(day, expiredLesson)?.whenLabel
            : undefined;
          const status = dayStatusLabel(
            dayDone,
            contentDone,
            doneCount,
            total,
          );

          return (
            <View
              key={day.id}
              style={
                dayIndex < path.days.length - 1
                  ? styles.curriculumSectionBorder
                  : undefined
              }
            >
              <Pressable
                style={[
                  styles.curriculumSectionHeader,
                  expanded && styles.curriculumSectionHeaderOpen,
                ]}
                onPress={() => toggleExpandedDay(day.id)}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
              >
                <View
                  style={[
                    styles.curriculumSectionBadge,
                    dayDone && styles.curriculumSectionBadgeDone,
                  ]}
                >
                  <Text
                    style={[
                      styles.curriculumSectionBadgeText,
                      dayDone && styles.curriculumSectionBadgeTextDone,
                    ]}
                  >
                    {dayIndex + 1}
                  </Text>
                </View>
                <View style={styles.curriculumSectionCopy}>
                  <Text style={styles.curriculumSectionTitle} numberOfLines={2}>
                    {clampDisplayText(asPlainText(day.title, 'Section'), 120)}
                  </Text>
                  <Text style={styles.curriculumSectionMeta} numberOfLines={1}>
                    {day.isAttended
                      ? dayAttendedAt
                        ? `Attended · ${dayAttendedAt}`
                        : 'Attended'
                      : expiredLesson
                        ? expiredWhen
                          ? `Expired · not attended · ${expiredWhen}`
                          : 'Expired · not attended'
                        : formatSessionWhenLabel(day.schedule) ||
                          day.summary ||
                          status.text}
                  </Text>
                </View>
                <Text style={styles.curriculumProgressPill}>
                  {doneCount}/{total}
                </Text>
                <CurriculumChevron expanded={expanded} />
              </Pressable>

              {expanded ? (
                <View style={styles.curriculumLessonList}>
                  {/*
                    Session-wise meeting / venue panel (above lessons).
                    Hidden for now — join + venue QR show under each live/venue lesson.
                    Uncomment if we need session-level meeting link / venue check-in again.
                  <SessionMeetingPanel
                    day={day}
                    onJoin={() => {
                      void joinSessionMeeting(day);
                    }}
                  />
                  */}
                  <View style={styles.curriculumLessonNest}>
                    {day.lessons.length === 0 ? (
                      <Text style={styles.curriculumEmptyText}>
                        No items in this section yet.
                      </Text>
                    ) : (
                      day.lessons.map((lesson, lessonIndex) => {
                        const done = isLessonDone(lesson);
                        const lockedExam =
                          lesson.kind === 'exam' && !examOpen && !done;
                        const scheduleGate = getLiveVenueScheduleGate(
                          day,
                          lesson,
                        );
                        const expiredStatus = getLiveVenueExpiredStatus(
                          day,
                          lesson,
                        );
                        const scheduleLocked = Boolean(scheduleGate?.blocked);
                        const expired = Boolean(expiredStatus?.expired);
                        // Expired / not attended is not a lock — alert on tap is enough.
                        // Show empty circle (not lock, not check) since it was never completed.
                        const locked = lockedExam || scheduleLocked;
                        const typeMeta =
                          LESSON_TYPE_META[lesson.kind] ?? LESSON_TYPE_META.text;
                        const isActiveVideo =
                          activeVideoLessonId === lesson.id;
                        const open =
                          openLessonId === lesson.id &&
                          lesson.kind !== 'video' &&
                          lesson.kind !== 'youtube';
                        const watchPercent = watchPercentFor(lesson.id);
                        const attendedAtLabel = formatAttendanceDateTime(
                          lesson.attendedAt,
                        );

                        return (
                          <View
                            key={`${day.id}-${lesson.id}-${lessonIndex}`}
                            style={styles.curriculumLessonWrap}
                          >
                            <Pressable
                              style={[
                                styles.curriculumLessonItem,
                                locked && styles.curriculumLessonLocked,
                                expired && styles.curriculumLessonExpired,
                                (open || isActiveVideo) &&
                                  styles.curriculumLessonOpen,
                                isActiveVideo &&
                                  styles.curriculumLessonActive,
                                done && styles.curriculumLessonDone,
                              ]}
                              delayPressIn={40}
                              onPress={() =>
                                onLessonPress(
                                  day,
                                  lesson,
                                  dayIndex,
                                  lessonIndex,
                                )
                              }
                              accessibilityRole="button"
                              accessibilityState={{
                                disabled:
                                  done &&
                                  (lesson.kind === 'video' ||
                                    lesson.kind === 'youtube') &&
                                  !isApiId,
                                checked: done,
                                selected: isActiveVideo,
                              }}
                            >
                              <View
                                style={[
                                  styles.curriculumTypeIconWrap,
                                  { backgroundColor: typeMeta.bg },
                                  expired && styles.curriculumTypeIconWrapExpired,
                                ]}
                              >
                                <LessonTypeIcon
                                  kind={lesson.kind}
                                  color={
                                    expired ? '#6f8a78' : typeMeta.color
                                  }
                                />
                              </View>
                              <View style={styles.curriculumLessonCopy}>
                                <Text
                                  style={[
                                    styles.curriculumLessonTitle,
                                    done &&
                                      styles.curriculumLessonTitleDone,
                                    expired &&
                                      styles.curriculumLessonTitleExpired,
                                  ]}
                                  numberOfLines={2}
                                >
                                  {clampDisplayText(
                                    asPlainText(lesson.title, 'Lesson'),
                                    160,
                                  )}
                                </Text>
                                <Text
                                  style={[
                                    styles.curriculumLessonMeta,
                                    expired &&
                                      styles.curriculumLessonMetaExpired,
                                  ]}
                                  numberOfLines={
                                    lesson.kind === 'live' ||
                                    lesson.kind === 'venue'
                                      ? 2
                                      : 1
                                  }
                                >
                                  {kindLine(
                                    lesson,
                                    done,
                                    lockedExam,
                                    watchPercent,
                                    scheduleLocked,
                                    scheduleGate?.whenLabel,
                                    expired,
                                    expiredStatus?.whenLabel,
                                  )}
                                </Text>
                              </View>
                              {downloadUrlForLesson(lesson) ? (
                                <View style={styles.downloadCluster}>
                                  {hasDownloaded(trainingId, lesson.id) ? (
                                    <Text style={styles.downloadedLabel}>
                                      Downloaded
                                    </Text>
                                  ) : null}
                                  <Pressable
                                    style={[
                                      styles.downloadIconBtn,
                                      hasDownloaded(trainingId, lesson.id) &&
                                        styles.downloadIconBtnDone,
                                    ]}
                                    hitSlop={8}
                                    disabled={
                                      downloadingLessonId === lesson.id
                                    }
                                    onPress={(event) => {
                                      event.stopPropagation?.();
                                      onDownloadLesson(lesson);
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                      hasDownloaded(trainingId, lesson.id)
                                        ? `${lesson.title} already downloaded`
                                        : `Download ${lesson.title}`
                                    }
                                  >
                                    {downloadingLessonId === lesson.id ? (
                                      <ActivityIndicator
                                        color={TRAINING_GREEN}
                                        size="small"
                                      />
                                    ) : (
                                      <LessonDownloadIcon
                                        color={
                                          hasDownloaded(
                                            trainingId,
                                            lesson.id,
                                          )
                                            ? TRAINING_GREEN
                                            : TRAINING_TEAL
                                        }
                                      />
                                    )}
                                  </Pressable>
                                </View>
                              ) : null}
                              <LessonStatusIcon
                                done={done}
                                locked={locked}
                                disabled={expired}
                              />
                            </Pressable>

                            {open &&
                            lesson.kind === 'live' &&
                            isApiId &&
                            !lesson.isAttended ? (
                              <ApiLessonJoinPanel
                                lesson={lesson}
                                onJoin={() => {
                                  void joinLive(lesson, day);
                                }}
                              />
                            ) : null}

                            {open &&
                            lesson.kind === 'live' &&
                            isApiId &&
                            lesson.isAttended ? (
                              <View style={styles.inlineLive}>
                                <View
                                  style={[
                                    styles.liveJoinCard,
                                    styles.liveJoinCardAttended,
                                  ]}
                                >
                                  <Text style={styles.liveJoinEyebrow}>
                                    Live · attended
                                  </Text>
                                  <Text style={styles.attendedBanner}>
                                    Attendance already recorded
                                    {attendedAtLabel
                                      ? ` · ${attendedAtLabel}`
                                      : ''}
                                  </Text>
                                </View>
                              </View>
                            ) : null}

                            {open && lesson.kind === 'text' ? (
                              <InlineTextLessonPanel lesson={lesson} />
                            ) : null}

                            {open &&
                            lesson.kind === 'live' &&
                            !isApiId ? (
                              <View style={styles.inlineLive}>
                                <View style={styles.liveJoinCard}>
                                  <Text style={styles.liveJoinEyebrow}>
                                    Online live session
                                  </Text>
                                  <Text style={styles.liveJoinTitle} numberOfLines={4}>
                                    {clampDisplayText(
                                      asPlainText(lesson.title, 'Session'),
                                      160,
                                    )}
                                  </Text>
                                  {(() => {
                                    const whenLabel = formatSessionWhenLabel(
                                      lesson.startsAt,
                                      day.schedule,
                                    );
                                    return whenLabel ? (
                                      <FieldRow label="When" value={whenLabel} />
                                    ) : null;
                                  })()}
                                  <Text style={styles.lessonMeta}>
                                    {lesson.duration}
                                  </Text>
                                  <Pressable
                                    onPress={() => joinLive(lesson, day)}
                                    accessibilityRole="link"
                                    hitSlop={6}
                                  >
                                    <Text
                                      style={[styles.liveUrl, styles.fieldValueLink]}
                                      numberOfLines={2}
                                      selectable
                                    >
                                      {lesson.joinUrl}
                                    </Text>
                                  </Pressable>
                                  {lesson.joinMeta ? (
                                    <Text style={styles.lessonMeta}>
                                      {lesson.joinMeta}
                                    </Text>
                                  ) : null}
                                  <Pressable
                                    style={styles.primaryBtn}
                                    onPress={() => joinLive(lesson, day)}
                                  >
                                    <Text style={styles.primaryBtnText}>
                                      Join Zoom now
                                    </Text>
                                  </Pressable>
                                  <Text style={styles.inlineHint}>
                                    Opens the meeting link, then marks this
                                    session attended so the quiz can unlock.
                                  </Text>
                                </View>
                              </View>
                            ) : null}

                            {open && lesson.kind === 'venue' ? (
                              <View style={styles.inlineVenue}>
                                {lesson.imageUrl ? (
                                  <Image
                                    source={{ uri: lesson.imageUrl }}
                                    style={styles.liveThumb}
                                    contentFit="cover"
                                  />
                                ) : null}
                                <Text style={styles.liveJoinEyebrow}>
                                  {lesson.isAttended
                                    ? 'Venue · attended'
                                    : 'Venue check-in'}
                                </Text>
                                <Text style={styles.venueName} numberOfLines={4}>
                                  {clampDisplayText(
                                    asPlainText(lesson.venue) ||
                                      asPlainText(path.title, 'Venue'),
                                    160,
                                  )}
                                </Text>
                                {(() => {
                                  const whenLabel = formatSessionWhenLabel(
                                    lesson.startsAt,
                                    lesson.checkInWindow,
                                    day.schedule,
                                  );
                                  return whenLabel ? (
                                    <FieldRow label="When" value={whenLabel} />
                                  ) : null;
                                })()}
                                {lesson.isAttended ? (
                                  <Text style={styles.attendedBanner}>
                                    Check-in complete
                                    {attendedAtLabel
                                      ? ` · ${attendedAtLabel}`
                                      : ''}
                                  </Text>
                                ) : (
                                  <>
                                    {lesson.address ? (
                                      <Text
                                        style={styles.lessonMeta}
                                        numberOfLines={4}
                                      >
                                        {lesson.address}
                                      </Text>
                                    ) : (
                                      <Text style={styles.lessonMeta}>
                                        Show this QR at the door for in-person
                                        attendance
                                      </Text>
                                    )}
                                    {lesson.checkInWindow &&
                                    !formatSessionWhenLabel(lesson.startsAt) ? (
                                      <Text
                                        style={styles.lessonMeta}
                                        numberOfLines={2}
                                      >
                                        {lesson.checkInWindow}
                                      </Text>
                                    ) : null}
                                    <SessionQrImage
                                      uri={
                                        lesson.qrImageBase64 || day.qrImageBase64
                                      }
                                      seed={lesson.passCode ?? lesson.id}
                                    />
                                    {lesson.passCode ? (
                                      <VenuePassCodeRow code={lesson.passCode} />
                                    ) : null}
                                  </>
                                )}
                              </View>
                            ) : null}
                          </View>
                        );
                      })
                    )}
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
      </View>

      <MyTrainingProgressNotes m={m} />

    </>
  );
}
