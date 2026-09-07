import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  CourseBookmarkIcon,
  CourseCalendarIcon,
  CourseCertificateIcon,
  CourseCheckIcon,
  CoursePlayFillIcon,
  CourseQuizIcon,
} from '@/components/market/CourseLearningIcons';
import {
  COURSE_BORDER,
  COURSE_GREEN,
  COURSE_LEARNING,
  COURSE_MUTED,
  COURSE_SOFT,
  COURSE_TEAL,
  COURSE_TRACK,
  COURSE_WEEK_LESSONS,
  type CourseLesson,
} from '@/components/market/courseLearningData';
import { c, NU } from '@/utils/newUiCompact';

function LessonStatusIcon({ lesson }: { lesson: CourseLesson }) {
  if (lesson.status === 'done') {
    return (
      <View style={styles.statusDone}>
        <CourseCheckIcon />
      </View>
    );
  }
  if (lesson.status === 'active') {
    return (
      <View style={styles.statusActive}>
        <CoursePlayFillIcon size={13} />
      </View>
    );
  }
  if (lesson.status === 'download') {
    return (
      <View style={styles.statusMuted}>
        <CourseBookmarkIcon />
      </View>
    );
  }
  return (
    <View style={styles.statusMuted}>
      <CourseQuizIcon />
    </View>
  );
}

export function CourseLearningBody() {
  return (
    <View style={styles.body}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{COURSE_LEARNING.continueLabel}</Text>
        <View style={styles.continueCard}>
          <View style={styles.video}>
            <View style={styles.playOuter}>
              <View style={styles.playInner}>
                <CoursePlayFillIcon size={19} />
              </View>
            </View>
            <View style={styles.videoBar}>
              <Text style={styles.timeOn}>{COURSE_LEARNING.currentTime}</Text>
              <View style={styles.videoTrack}>
                <View
                  style={[
                    styles.videoFill,
                    { width: `${COURSE_LEARNING.videoProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.timeOff}>{COURSE_LEARNING.totalTime}</Text>
            </View>
          </View>

          <View style={styles.continueCopy}>
            <View style={styles.badgeRow}>
              <Text style={styles.lessonBadge}>{COURSE_LEARNING.lessonBadge}</Text>
              <Text style={styles.lessonMeta}>{COURSE_LEARNING.lessonMeta}</Text>
            </View>
            <Text style={styles.lessonTitle}>{COURSE_LEARNING.lessonTitle}</Text>
            <Text style={styles.lessonBody}>{COURSE_LEARNING.lessonBody}</Text>
            <Pressable style={styles.resumeBtn} accessibilityRole="button">
              <CoursePlayFillIcon color="#fff" size={16} />
              <Text style={styles.resumeText}>Resume lesson</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.weekHeader}>
          <Text style={styles.sectionLabel}>{COURSE_LEARNING.weekLabel}</Text>
          <Text style={styles.allWeeks}>All weeks</Text>
        </View>
        <View style={styles.lessonList}>
          {COURSE_WEEK_LESSONS.map((lesson, index) => {
            const isLast = index === COURSE_WEEK_LESSONS.length - 1;
            const active = lesson.status === 'active';
            const done = lesson.status === 'done';
            return (
              <View
                key={lesson.id}
                style={[
                  styles.lessonRow,
                  !isLast && styles.lessonBorder,
                  active && styles.lessonActive,
                ]}
              >
                <LessonStatusIcon lesson={lesson} />
                <View style={styles.lessonCopy}>
                  <Text
                    style={[
                      styles.rowTitle,
                      done && styles.rowTitleDone,
                      active && styles.rowTitleActive,
                    ]}
                  >
                    {lesson.title}
                  </Text>
                  <Text style={[styles.rowMeta, active && styles.rowMetaActive]}>
                    {lesson.meta}
                  </Text>
                </View>
                {lesson.status === 'locked' ? (
                  <Text style={styles.locked}>LOCKED</Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.liveCard}>
        <View style={styles.liveIcon}>
          <CourseCalendarIcon />
        </View>
        <View style={styles.liveCopy}>
          <Text style={styles.liveTitle}>{COURSE_LEARNING.liveTitle}</Text>
          <Text style={styles.liveMeta}>{COURSE_LEARNING.liveMeta}</Text>
        </View>
        <Text style={styles.join}>Join</Text>
      </View>

      <View style={styles.certCard}>
        <CourseCertificateIcon />
        <View style={styles.certCopy}>
          <Text style={styles.certTitle}>{COURSE_LEARNING.certificateTitle}</Text>
          <Text style={styles.certBody}>{COURSE_LEARNING.certificateBody}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: c(22, 18),
  },
  section: {
    gap: NU.cardGap,
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: COURSE_MUTED,
  },
  continueCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COURSE_BORDER,
    borderRadius: c(18, 16),
    overflow: 'hidden',
  },
  video: {
    height: c(168, 140),
    backgroundColor: COURSE_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOuter: {
    width: c(62, 52),
    height: c(62, 52),
    borderRadius: c(31, 26),
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playInner: {
    width: c(46, 40),
    height: c(46, 40),
    borderRadius: c(23, 20),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoBar: {
    position: 'absolute',
    left: NU.cardPadSm,
    right: NU.cardPadSm,
    bottom: NU.cardPadXs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
  },
  timeOn: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeOff: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.72)',
  },
  videoTrack: {
    flex: 1,
    height: c(4, 3),
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  videoFill: {
    height: c(4, 3),
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
  },
  continueCopy: {
    paddingTop: NU.cardPadSm,
    paddingHorizontal: c(15, 12),
    paddingBottom: NU.cardPad,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    marginBottom: c(6, 4),
  },
  lessonBadge: {
    fontSize: NU.label,
    fontWeight: '700',
    color: COURSE_GREEN,
    backgroundColor: '#e6f4e8',
    paddingVertical: c(3, 2),
    paddingHorizontal: c(8, 6),
    borderRadius: c(4, 3),
    overflow: 'hidden',
  },
  lessonMeta: {
    fontSize: c(11.5, 10.5),
    color: COURSE_SOFT,
  },
  lessonTitle: {
    fontSize: NU.cardTitleLg,
    fontWeight: '700',
    color: COURSE_TEAL,
    lineHeight: c(21, 19),
  },
  lessonBody: {
    marginTop: c(5, 4),
    fontSize: NU.body,
    lineHeight: c(20, 18),
    color: '#5d7a67',
  },
  resumeBtn: {
    marginTop: c(13, 11),
    height: c(44, 40),
    borderRadius: 99,
    backgroundColor: COURSE_TEAL,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(8, 6),
  },
  resumeText: {
    fontSize: NU.link,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  allWeeks: {
    fontSize: c(12.5, 11.5),
    fontWeight: '600',
    color: COURSE_GREEN,
  },
  lessonList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COURSE_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  lessonRow: {
    paddingVertical: c(13, 11),
    paddingHorizontal: c(15, 12),
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  lessonBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COURSE_TRACK,
  },
  lessonActive: {
    backgroundColor: '#f5faf3',
  },
  statusDone: {
    width: c(30, 26),
    height: c(30, 26),
    borderRadius: c(15, 13),
    backgroundColor: COURSE_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusActive: {
    width: c(30, 26),
    height: c(30, 26),
    borderRadius: c(15, 13),
    borderWidth: 2,
    borderColor: COURSE_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusMuted: {
    width: c(30, 26),
    height: c(30, 26),
    borderRadius: c(15, 13),
    backgroundColor: COURSE_TRACK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonCopy: {
    flex: 1,
  },
  rowTitle: {
    fontSize: NU.link,
    fontWeight: '600',
    color: COURSE_TEAL,
  },
  rowTitleDone: {
    color: COURSE_MUTED,
    textDecorationLine: 'line-through',
  },
  rowTitleActive: {
    fontSize: c(14.5, 13.5),
    fontWeight: '700',
  },
  rowMeta: {
    marginTop: c(2, 1),
    fontSize: c(11.5, 10.5),
    color: COURSE_SOFT,
  },
  rowMetaActive: {
    color: COURSE_GREEN,
    fontWeight: '600',
  },
  locked: {
    fontSize: NU.label,
    fontWeight: '700',
    color: COURSE_MUTED,
    backgroundColor: COURSE_TRACK,
    paddingVertical: c(4, 3),
    paddingHorizontal: c(8, 6),
    borderRadius: c(5, 4),
    overflow: 'hidden',
  },
  liveCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COURSE_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: NU.cardPadSm,
    paddingHorizontal: c(15, 12),
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  liveIcon: {
    width: c(42, 36),
    height: c(42, 36),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#eaf1ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveCopy: {
    flex: 1,
  },
  liveTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: COURSE_TEAL,
  },
  liveMeta: {
    marginTop: c(2, 1),
    fontSize: NU.bodySm,
    color: COURSE_MUTED,
  },
  join: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: COURSE_GREEN,
  },
  certCard: {
    backgroundColor: '#e6f4e8',
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'flex-start',
  },
  certCopy: {
    flex: 1,
  },
  certTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: COURSE_TEAL,
  },
  certBody: {
    marginTop: c(3, 2),
    fontSize: c(12.5, 11.5),
    lineHeight: c(19, 17),
    color: '#3c6b47',
  },
});
