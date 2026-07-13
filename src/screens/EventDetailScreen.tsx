import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { EmptyState } from '@/components/EmptyState';
import { LeafyGradientButton } from '@/components/LeafyGradientButton';

import {
  ChevronLeftIcon,
  ClockIcon,
  HeartIcon,
  MessageSquareIcon,
} from '@/components/dashboard/DashboardIcons';
import { getEventById } from '@/constants/events';
import { useDetailBack } from '@/hooks/useDetailBack';
import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const TEXT_MUTED = '#6B7280';
const TEXT_BLACK = '#111111';
const CARD_BG = '#F5F5F5';
const PROVIDER_CARD_BG = '#F7FAF8';
const BORDER = '#E8EDEA';
const STATUS_ORANGE = '#FF9F0A';
const PROGRESS_GRADIENT_START = '#1A5336';
const PROGRESS_GRADIENT_END = '#4CAF50';
const SPEAKER_COLORS = ['#1F5D4E', '#2D6A4E', '#40916C', '#52B788'];
const ORGANIZER_AVATAR_SIZE = isSmallDevice ? 34 : 38;
const SPEAKER_AVATAR_SIZE = isSmallDevice ? 34 : 38;
const PROGRESS_HEIGHT = isSmallDevice ? 6 : 8;
const HERO_BTN_SIZE = isSmallDevice ? 34 : 38;
const HERO_BTN_BG = 'rgba(255, 255, 255, 0.28)';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = isSmallDevice ? 16 : 20;
const HERO_HEIGHT = Math.round(SCREEN_WIDTH * (isSmallDevice ? 220 / 375 : 250 / 375));
const SHEET_OVERLAP = isSmallDevice ? 16 : 20;
const SPEAKER_OVERLAP = 10;

type InfoCardProps = {
  emoji: string;
  label: string;
  value: string;
};

function InfoCard({ emoji, label, value }: InfoCardProps) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoEmoji}>{emoji}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function HeroFadeOverlay({ width, height }: { width: number; height: number }) {
  const fadeHeight = Math.round(height * 0.55);

  return (
    <Svg
      width={width}
      height={fadeHeight}
      style={[styles.heroFade, { height: fadeHeight }]}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="eventHeroFade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity={0} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0.6} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={fadeHeight} fill="url(#eventHeroFade)" />
    </Svg>
  );
}

function GradientProgressBar({ percent }: { percent: number }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const fillWidth = Math.max(0, Math.round((trackWidth * percent) / 100));
  const radius = PROGRESS_HEIGHT / 2;

  return (
    <View
      style={styles.progressTrack}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
    >
      {fillWidth > 0 ? (
        <Svg width={fillWidth} height={PROGRESS_HEIGHT}>
          <Defs>
            <LinearGradient id="eventProgressGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={PROGRESS_GRADIENT_START} />
              <Stop offset="1" stopColor={PROGRESS_GRADIENT_END} />
            </LinearGradient>
          </Defs>
          <Rect
            x={0}
            y={0}
            width={fillWidth}
            height={PROGRESS_HEIGHT}
            rx={radius}
            fill="url(#eventProgressGrad)"
          />
        </Svg>
      ) : null}
    </View>
  );
}

function OrganizerAvatar({ initial }: { initial: string }) {
  return (
    <View style={styles.organizerAvatar}>
      <Svg
        width={ORGANIZER_AVATAR_SIZE}
        height={ORGANIZER_AVATAR_SIZE}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id="organizerAvatarGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1F5D4E" />
            <Stop offset="1" stopColor="#3E7041" />
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={ORGANIZER_AVATAR_SIZE}
          height={ORGANIZER_AVATAR_SIZE}
          rx={10}
          fill="url(#organizerAvatarGrad)"
        />
      </Svg>
      <Text style={styles.organizerAvatarText}>{initial}</Text>
    </View>
  );
}

export function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useDetailBack();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const [isFavorite, setIsFavorite] = useState(false);

  const event = id ? getEventById(id) : undefined;

  if (!event) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <EmptyState
          variant="notFound"
          entity="event"
          onAction={goBack}
          actionLabel="Go back"
        />
      </View>
    );
  }

  const fillPercent = Math.round((event.registered / event.capacity) * 100);
  const spotsRemaining = event.capacity - event.registered;
  const registerLabel = event.isFree
    ? 'Register Now — Free'
    : `Register Now — ${event.priceLabel}`;

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={styles.body}>
        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 76 }}
        >
          <View style={[styles.hero, { height: HERO_HEIGHT }]}>
            <Image
              source={{ uri: event.detailImage }}
              style={[styles.heroImage, { width: SCREEN_WIDTH, height: HERO_HEIGHT }]}
              contentFit="cover"
            />

            <HeroFadeOverlay width={SCREEN_WIDTH} height={HERO_HEIGHT} />

            <View style={styles.heroActions}>
              <Pressable
                onPress={goBack}
                style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
                hitSlop={8}
              >
                <ChevronLeftIcon size={20} color="#FFFFFF" />
              </Pressable>

              <Pressable
                onPress={() => setIsFavorite((current) => !current)}
                style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
                hitSlop={8}
              >
                <HeartIcon size={18} color={isFavorite ? '#F87171' : '#FFFFFF'} />
              </Pressable>
            </View>

            <View style={styles.heroBottom}>
              <View style={styles.statusBadge}>
                <ClockIcon size={10} color="#FFFFFF" />
                <Text style={styles.statusText}>{event.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.heroTitle}>{event.detailTitle}</Text>
            </View>
          </View>

          <View style={styles.contentSheet}>
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <InfoCard emoji="📅" label="Date & Time" value={event.schedule} />
                <InfoCard emoji="📍" label="Location" value={event.location} />
              </View>
              <View style={styles.infoRow}>
                <InfoCard
                  emoji="👥"
                  label="Attendees"
                  value={`${event.registered} / ${event.capacity} registered`}
                />
                <InfoCard emoji="🎟" label="Ticket Price" value={event.priceDetail} />
              </View>
            </View>

            <View style={styles.organizerCard}>
              <OrganizerAvatar initial={event.organizerInitial} />
              <View style={styles.organizerInfo}>
                <Text style={styles.organizerLabel}>Organized by</Text>
                <Text style={styles.organizerName} numberOfLines={1}>
                  {event.organizer}
                </Text>
              </View>
              <Pressable style={({ pressed }) => [styles.followBtn, pressed && styles.pressed]}>
                <Text style={styles.followBtnText}>Follow</Text>
              </Pressable>
            </View>

            <Text style={styles.description}>{event.description}</Text>

            <View style={styles.registrationSection}>
              <View style={styles.registrationHeader}>
                <Text style={styles.sectionTitle}>Registration</Text>
                <Text style={styles.registrationPercent}>{fillPercent}% full</Text>
              </View>

              <GradientProgressBar percent={fillPercent} />

              <Text style={styles.registrationMeta}>
                {event.registered} registered · {spotsRemaining} spots remaining
              </Text>
            </View>

            {event.speakerInitials.length > 0 ? (
              <View style={styles.speakersSection}>
                <Text style={styles.sectionTitle}>Keynote Speakers</Text>
                <View style={styles.speakerRow}>
                  {event.speakerInitials.map((initial, index) => (
                    <View
                      key={`${initial}-${index}`}
                      style={[
                        styles.speakerAvatar,
                        index > 0 && { marginLeft: -SPEAKER_OVERLAP },
                        { backgroundColor: SPEAKER_COLORS[index % SPEAKER_COLORS.length] },
                      ]}
                    >
                      <Text style={styles.speakerAvatarText}>{initial}</Text>
                    </View>
                  ))}
                  {event.additionalSpeakers > 0 ? (
                    <View
                      style={[
                        styles.speakerAvatar,
                        styles.speakerMore,
                        { marginLeft: -SPEAKER_OVERLAP },
                      ]}
                    >
                      <Text style={styles.speakerMoreText}>+{event.additionalSpeakers}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + 10, paddingTop: 10 },
          ]}
        >
          <Pressable style={({ pressed }) => [styles.chatBtn, pressed && styles.pressed]} hitSlop={6}>
            <MessageSquareIcon size={20} color={TEXT_MUTED} />
          </Pressable>

          <LeafyGradientButton
            onPress={() => router.replace('/(main)/(tabs)/events/courses')}
            style={styles.registerBtn}
            borderRadius={14}
          >
            <Text style={styles.registerBtnText}>{registerLabel}</Text>
          </LeafyGradientButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  statusBarFill: {
    backgroundColor: '#1A1A1A',
  },
  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentScroll: {
    flex: 1,
  },
  hero: {
    backgroundColor: '#1A1A1A',
    position: 'relative',
  },
  heroImage: {
    backgroundColor: '#E8EDEA',
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingTop: isSmallDevice ? 4 : 6,
  },
  heroBtn: {
    width: HERO_BTN_SIZE,
    height: HERO_BTN_SIZE,
    borderRadius: HERO_BTN_SIZE / 2,
    backgroundColor: HERO_BTN_BG,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    left: H_PAD,
    right: H_PAD,
    bottom: SHEET_OVERLAP + (isSmallDevice ? 8 : 12),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: STATUS_ORANGE,
    paddingHorizontal: isSmallDevice ? 6 : 8,
    paddingVertical: isSmallDevice ? 3 : 4,
    borderRadius: isSmallDevice ? 16 : 20,
    gap: isSmallDevice ? 3 : 4,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  statusText: {
    fontSize: isSmallDevice ? 9 : 10,
    lineHeight: isSmallDevice ? 11 : 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: isSmallDevice ? 17 : 21,
    lineHeight: isSmallDevice ? 24 : 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  contentSheet: {
    marginTop: -SHEET_OVERLAP,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 14 : 18,
    paddingBottom: 8,
  },
  infoGrid: {
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  infoRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
  },
  infoCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: CARD_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 10 : 12,
  },
  infoEmoji: {
    fontSize: isSmallDevice ? 14 : 16,
    marginBottom: isSmallDevice ? 2 : 4,
  },
  infoLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 17 : 19,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
    backgroundColor: PROVIDER_CARD_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 10 : 12,
    marginBottom: isSmallDevice ? 12 : 16,
  },
  organizerAvatar: {
    width: ORGANIZER_AVATAR_SIZE,
    height: ORGANIZER_AVATAR_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  organizerAvatarText: {
    fontSize: isSmallDevice ? 13 : 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  organizerInfo: {
    flex: 1,
    minWidth: 0,
  },
  organizerLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: 1,
  },
  organizerName: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 17 : 19,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  followBtn: {
    backgroundColor: MINT,
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 5 : 6,
    borderRadius: isSmallDevice ? 10 : 12,
    flexShrink: 0,
  },
  followBtnText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: PRIMARY,
  },
  description: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 20 : 23,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 14 : 18,
  },
  registrationSection: {
    backgroundColor: CARD_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 12 : 14,
    marginBottom: isSmallDevice ? 14 : 18,
  },
  registrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 8 : 10,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: isSmallDevice ? 20 : 22,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  registrationPercent: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 17 : 19,
    fontWeight: '800',
    color: PRIMARY,
  },
  progressTrack: {
    height: PROGRESS_HEIGHT,
    borderRadius: PROGRESS_HEIGHT / 2,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 10,
  },
  registrationMeta: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 15 : 17,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  speakersSection: {
    marginBottom: 8,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: isSmallDevice ? 8 : 10,
  },
  speakerAvatar: {
    width: SPEAKER_AVATAR_SIZE,
    height: SPEAKER_AVATAR_SIZE,
    borderRadius: SPEAKER_AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  speakerAvatarText: {
    fontSize: isSmallDevice ? 11 : 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  speakerMore: {
    backgroundColor: '#E5E7EB',
  },
  speakerMoreText: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '800',
    color: TEXT_MUTED,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
    paddingHorizontal: H_PAD,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    ...shadowSm,
  },
  chatBtn: {
    width: isSmallDevice ? 40 : 44,
    height: isSmallDevice ? 40 : 44,
    borderRadius: isSmallDevice ? 10 : 12,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtn: {
    flex: 1,
    height: isSmallDevice ? 42 : 46,
  },
  registerBtnText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: isSmallDevice ? 17 : 19,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.9,
  },
});
