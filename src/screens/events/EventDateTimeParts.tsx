import { StyleSheet, Text, View } from 'react-native';

import { ClockIcon, GlobeIcon } from '@/components/dashboard/DashboardIcons';
import type { Event } from '@/constants/events';
import { InfoCard } from '@/screens/events/EventDetailScreenParts.shared';
import {
  BORDER,
  CARD_BG,
  MINT,
  PRIMARY,
  TEXT_BLACK,
} from '@/screens/events/EventDetailScreen.styles';
import type { EventAvailability } from '@/utils/event.mapper';
import { isSmallDevice } from '@/utils/responsive';

// Darker than the screen's TEXT_MUTED (#6B7280) so small secondary text keeps >= 4.5:1 contrast on these tints.
const TEXT_SECONDARY = '#4B5563';
// Large-text users still get a readable layout; the cap only stops the card from outgrowing the screen.
const MAX_FONT_SCALE = 1.5;

/**
 * Date & Time card: the Event's schedule in the Event's own timezone (never the phone's), full width so nothing
 * truncates, with the timezone on its own line under a globe icon. Layout only — every string comes from
 * Event.scheduleDisplay (utils/eventDateTimeDisplay.ts).
 */
export function EventScheduleCard({ event }: { event: Event }) {
  const display = event.scheduleDisplay;

  return (
    <View
      style={styles.card}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Date and time. ${display.accessibilityLabel}`}
    >
      <View style={styles.header}>
        <Text style={styles.emoji} importantForAccessibility="no" accessibilityElementsHidden>
          📅
        </Text>
        <Text style={styles.label} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Date & Time
        </Text>
      </View>

      {display.kind === 'tba' ? (
        <Text style={styles.date} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Date to be announced
        </Text>
      ) : display.kind === 'multi-day' ? (
        display.lines.map((line) => (
          <Text key={line.label} style={styles.multiLine} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            <Text style={styles.lineLabel}>{line.label}  </Text>
            <Text style={styles.date}>{line.date}</Text>
            <Text style={styles.time}>{` · ${line.time}`}</Text>
          </Text>
        ))
      ) : (
        display.lines.map((line) => (
          <View key={line.date}>
            <Text style={styles.date} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {line.date}
            </Text>
            <Text style={styles.time} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {line.time}
            </Text>
          </View>
        ))
      )}

      {display.timeZoneLabel ? (
        <View style={styles.zoneRow}>
          <View style={styles.zoneIcon} importantForAccessibility="no" accessibilityElementsHidden>
            <GlobeIcon size={isSmallDevice ? 12 : 14} color={TEXT_SECONDARY} />
          </View>
          <Text style={styles.zoneText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {display.timeZoneLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Schedule card above a full-width Location card — replaces the old side-by-side pair that cut the date off. */
export function EventScheduleAndLocation({ event }: { event: Event }) {
  return (
    <View style={styles.stack}>
      <EventScheduleCard event={event} />
      <InfoCard emoji="📍" label="Location" value={event.location} />
    </View>
  );
}

type NoticeTone = 'info' | 'neutral' | 'warning';

type NoticeContent = { tone: NoticeTone; title: string; body: string | null };

function getNoticeContent(availability: EventAvailability): NoticeContent | null {
  const { opensAt, closesAt } = availability;
  switch (availability.kind) {
    case 'registration_not_started':
      return {
        tone: 'info',
        title: 'Registration opens',
        body: opensAt ? `${opensAt.date} · ${opensAt.time} ${opensAt.zoneLabel}` : availability.detail,
      };
    case 'closed':
      return { tone: 'neutral', title: availability.label, body: availability.label === 'Registration closed' ? null : availability.detail };
    case 'event_ended':
      return { tone: 'neutral', title: availability.label, body: null };
    case 'unavailable':
      return { tone: 'warning', title: availability.label, body: availability.detail };
    case 'available':
      return closesAt
        ? { tone: 'info', title: 'Registration open', body: `Closes ${closesAt.date} · ${closesAt.time} ${closesAt.zoneLabel}` }
        : null;
    default:
      // full / cancelled / completed keep their existing treatment (waitlist CTA, cancelled banner, ...).
      return null;
  }
}

/**
 * Registration opening/closing information, kept visually apart from the schedule card. Display only — the
 * backend still decides whether a registration, quote, checkout or waitlist request is accepted.
 */
export function EventRegistrationNotice({ availability }: { availability: EventAvailability }) {
  const content = getNoticeContent(availability);
  if (!content) return null;

  const tone = TONES[content.tone];
  const spoken = content.body ? `${content.title}. ${content.body}` : content.title;

  return (
    <View
      style={[styles.notice, { backgroundColor: tone.background, borderColor: tone.border }]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={spoken}
    >
      <View style={styles.noticeIcon} importantForAccessibility="no" accessibilityElementsHidden>
        <ClockIcon size={isSmallDevice ? 16 : 18} color={tone.accent} />
      </View>
      <View style={styles.noticeText}>
        <Text style={[styles.noticeTitle, { color: tone.title }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {content.title}
        </Text>
        {content.body ? (
          <Text style={[styles.noticeBody, { color: tone.body }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {content.body}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const TONES: Record<NoticeTone, { background: string; border: string; accent: string; title: string; body: string }> = {
  info: { background: MINT, border: '#CFE5D6', accent: PRIMARY, title: '#14463A', body: '#1F4F43' },
  neutral: { background: CARD_BG, border: BORDER, accent: TEXT_SECONDARY, title: TEXT_BLACK, body: TEXT_SECONDARY },
  warning: { background: '#FFF6E5', border: '#F3D9A4', accent: '#8A5A00', title: '#6B4400', body: '#6B4400' },
};

const styles = StyleSheet.create({
  stack: {
    alignSelf: 'stretch',
    gap: isSmallDevice ? 8 : 10,
  },
  card: {
    alignSelf: 'stretch',
    backgroundColor: CARD_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 10 : 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: isSmallDevice ? 4 : 6,
  },
  emoji: {
    fontSize: isSmallDevice ? 14 : 16,
  },
  label: {
    flexShrink: 1,
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 15 : 16,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  date: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: isSmallDevice ? 20 : 22,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  time: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 19 : 20,
    fontWeight: '600',
    color: TEXT_BLACK,
  },
  multiLine: {
    marginBottom: 2,
  },
  lineLabel: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 20 : 22,
    fontWeight: '700',
    color: PRIMARY,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: isSmallDevice ? 4 : 6,
  },
  zoneIcon: {
    // Optically centres the 14px icon on the first text line even when the label wraps.
    marginTop: 2,
  },
  zoneText: {
    flex: 1,
    flexShrink: 1,
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 17 : 18,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 10 : 12,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  noticeIcon: {
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    minWidth: 0,
  },
  noticeTitle: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '800',
  },
  noticeBody: {
    fontSize: isSmallDevice ? 12.5 : 13.5,
    lineHeight: isSmallDevice ? 18 : 19,
    fontWeight: '500',
    marginTop: 2,
  },
});
