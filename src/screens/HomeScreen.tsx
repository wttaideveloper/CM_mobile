import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shadowLg, shadowMd, shadowSm } from '@/utils/shadows';
import { hdUnsplash } from '@/utils/hdImage';
import { HERO_IMAGE } from '@/constants/images';

import {
  BellIcon,
  BookOpenIcon,
  Building2Icon,
  CalendarDaysIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  ClockIcon,
  HeartIcon,
  MapPinIcon,
  ShoppingCartIcon,
  StarIcon,
  WrenchIcon,
} from '@/components/dashboard/DashboardIcons';
import { filterAppointments } from '@/constants/appointments';
import { COURSES } from '@/constants/courses';
import { EVENTS } from '@/constants/events';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const BODY_BG = '#F5F7F5';
const META = '#5a7a70';
const WHITE = '#FFFFFF';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = 20;
const HERO_BANNER_HEIGHT = 184;
const STREAK_DAYS = 12;
const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEK_COMPLETED = 5;
const APPOINTMENT_CARD_WIDTH = SCREEN_WIDTH * 0.62;

/** Rich HD images for home screen (2x–3x device resolution). */
const HOME_IMAGES = {
  hero: HERO_IMAGE,
  appointments: {
    'personal-training': hdUnsplash(
      'photo-1571019613454-1cb2f99b2d8b',
      APPOINTMENT_CARD_WIDTH,
      120,
    ),
    'nutrition-coaching': hdUnsplash(
      'photo-1490645935967-10de6ba17061',
      APPOINTMENT_CARD_WIDTH,
      120,
    ),
    'group-yoga': hdUnsplash(
      'photo-1599901860904-17e6ed7083a0',
      APPOINTMENT_CARD_WIDTH,
      120,
    ),
  } as Record<string, string>,
  event: hdUnsplash('photo-1540575467063-178a50c2df87', SCREEN_WIDTH - H_PAD * 2, 200),
  course: hdUnsplash('photo-1517836357463-d25dfeac3438', SCREEN_WIDTH - H_PAD * 2, 220),
};

function getAppointmentImage(id: string) {
  return (
    HOME_IMAGES.appointments[id] ??
    hdUnsplash('photo-1571019613454-1cb2f99b2d8b', APPOINTMENT_CARD_WIDTH, 120)
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type StatCardProps = {
  icon: ReactNode;
  value: string;
  label: string;
  hint?: string;
  bg: string;
  border: string;
  iconBg: string;
  valueColor: string;
};

function StatCard({ icon, value, label, hint, bg, border, iconBg, valueColor }: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg, borderColor: border }]}>
      <View style={styles.statCardTop}>
        <View style={[styles.statCardIcon, { backgroundColor: iconBg }]}>{icon}</View>
        {hint ? (
          <View style={[styles.statHintPill, { backgroundColor: iconBg }]}>
            <Text style={[styles.statHintText, { color: valueColor }]}>{hint}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.statCardValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.statCardLabel}>{label}</Text>
    </View>
  );
}

const EXPLORE_TILE_WIDTH = 76;

const EXPLORE_ITEMS = [
  {
    key: 'enterprises',
    label: 'Enterprises',
    icon: Building2Icon,
    color: PRIMARY,
    accentSoft: MINT,
    route: '/(main)/(tabs)/explore' as const,
  },
  {
    key: 'services',
    label: 'Services',
    icon: WrenchIcon,
    color: '#0D9488',
    accentSoft: '#E6FAF5',
    route: '/(main)/(tabs)/shop' as const,
  },
  {
    key: 'shop',
    label: 'Shop',
    icon: ShoppingCartIcon,
    color: '#7C3AED',
    accentSoft: '#F5F0FF',
    route: '/(main)/(tabs)/shop' as const,
  },
  {
    key: 'events',
    label: 'Events',
    icon: CalendarDaysIcon,
    color: '#2563EB',
    accentSoft: '#EFF6FF',
    route: '/(main)/(tabs)/events' as const,
  },
] as const;

type ExploreTileProps = {
  icon: ReactNode;
  label: string;
  accentSoft: string;
  onPress?: () => void;
};

function StreakHeroBanner({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.streakBanner, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Image
        source={HOME_IMAGES.hero}
        style={styles.streakBannerImage}
        contentFit="cover"
        contentPosition="center"
        priority="high"
        cachePolicy="memory-disk"
        allowDownscaling={false}
        transition={200}
      />
      <View style={styles.streakBannerOverlay} />
      <View style={styles.streakBannerGlow} />
      <View style={styles.streakBannerOrb} />
      <View style={styles.streakBannerContent}>
        <View style={styles.streakBannerTop}>
          <View style={styles.streakFireBadge}>
            <StarIcon size={12} color="#FBBF24" />
            <Text style={styles.streakFireText}>On fire</Text>
          </View>
          <View style={styles.streakTopRight}>
            <View style={styles.streakCountRing}>
              <Text style={styles.streakCountValue}>{STREAK_DAYS}</Text>
              <Text style={styles.streakCountUnit}>days</Text>
            </View>
            <View style={styles.streakBannerArrow}>
              <ChevronRightIcon size={16} color={WHITE} />
            </View>
          </View>
        </View>
        <Text style={styles.streakBannerTitle}>Keep your streak alive</Text>
        <Text style={styles.streakBannerSubtitle}>4 sessions completed this week</Text>
        {/* <View style={styles.streakWeekRow}> */}
          {/* {WEEK_DAYS.map((day, index) => {
            const done = index < WEEK_COMPLETED;
            return (
              <View key={`${day}-${index}`} style={styles.streakDayCol}>
                <View style={[styles.streakDayDot, done && styles.streakDayDotDone]}>
                  {done ? <CircleCheckIcon size={10} color={WHITE} /> : null}
                </View>
                <Text style={[styles.streakDayLabel, done && styles.streakDayLabelDone]}>{day}</Text>
              </View>
            );
          })} */}
        {/* </View> */}
      </View>
    </Pressable>
  );
}

function ExploreTile({ icon, label, accentSoft, onPress }: ExploreTileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.exploreTile, pressed && styles.pressed]}
    >
      <View style={[styles.exploreIconWrap, { backgroundColor: accentSoft }]}>{icon}</View>
      <Text style={styles.exploreLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function NotificationBell() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/(main)/notifications')}
      style={({ pressed }) => [styles.bellOuter, pressed && styles.pressed]}
      hitSlop={8}
    >
      <View style={styles.bellCircle}>
        <BellIcon size={20} color={WHITE} />
      </View>
      <View style={styles.bellBadge}>
        <Text style={styles.bellBadgeText}>2</Text>
      </View>
    </Pressable>
  );
}

const upcomingAppointments = filterAppointments('Upcoming').slice(0, 2);
const nextEvent = EVENTS[0];
const activeCourse = COURSES[0];

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const statusBarFill = useStatusBarBackground();

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SJ</Text>
            </View>
            <View style={styles.greetingText}>
              <Text style={styles.greetingMuted}>{getGreeting()}</Text>
              <Text style={styles.greetingName} numberOfLines={1}>
                Sarah Johnson
              </Text>
            </View>
            <NotificationBell />
          </View>

          <StreakHeroBanner
            onPress={() => router.navigate('/(main)/(tabs)/events/appointments')}
          />
        </View>

        {/* Body — curved top */}
        <View style={styles.body}>
          {/* Wellness stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard
                icon={<CircleCheckIcon size={18} color={PRIMARY} />}
                value="4"
                label="Sessions"
                hint="This week"
                bg="#F0FAF4"
                border="#C8E6D4"
                iconBg={WHITE}
                valueColor={PRIMARY}
              />
              <StatCard
                icon={<HeartIcon size={18} color="#E11D48" />}
                value="12"
                label="Day streak"
                hint="On fire"
                bg="#FFF5F7"
                border="#FECDD3"
                iconBg={WHITE}
                valueColor="#BE123C"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                icon={<ClockIcon size={18} color="#2563EB" />}
                value="3"
                label="Upcoming"
                hint="Booked"
                bg="#EFF6FF"
                border="#BFDBFE"
                iconBg={WHITE}
                valueColor="#1D4ED8"
              />
              <StatCard
                icon={<BookOpenIcon size={18} color="#7C3AED" />}
                value="2"
                label="Courses"
                hint="Active"
                bg="#F5F3FF"
                border="#DDD6FE"
                iconBg={WHITE}
                valueColor="#6D28D9"
              />
            </View>
          </View>

          <View style={styles.exploreSection}>
            <Text style={styles.exploreSectionTitle}>Explore</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.exploreRow}
            >
              {EXPLORE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <ExploreTile
                    key={item.key}
                    icon={<Icon size={20} color={item.color} />}
                    label={item.label}
                    accentSoft={item.accentSoft}
                    onPress={() => router.navigate(item.route)}
                  />
                );
              })}
            </ScrollView>
          </View>

          <SectionHeader
            title="Upcoming"
            actionLabel="See all"
            onAction={() => router.push('/(main)/(tabs)/events/appointments')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.upcomingScroll}
          >
            {upcomingAppointments.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => router.push('/(main)/(tabs)/events/appointments')}
                style={({ pressed }) => [styles.appointmentCard, pressed && styles.pressed]}
              >
                <Image
                  source={{ uri: getAppointmentImage(item.id) }}
                  style={styles.appointmentImage}
                  contentFit="cover"
                  contentPosition="center"
                  priority="normal"
                  cachePolicy="memory-disk"
                  allowDownscaling={false}
                  transition={200}
                />
                <View style={styles.appointmentBody}>
                  <View
                    style={[
                      styles.statusPill,
                      item.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.status === 'confirmed' ? styles.statusTextConfirmed : styles.statusTextPending,
                      ]}
                    >
                      {item.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </Text>
                  </View>
                  <Text style={styles.appointmentTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.appointmentMeta} numberOfLines={1}>
                    {item.instructor}
                  </Text>
                  <View style={styles.appointmentTimeRow}>
                    <ClockIcon size={12} color={META} />
                    <Text style={styles.appointmentTime}>{item.schedule}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          <SectionHeader
            title="Featured event"
            actionLabel="Browse"
            onAction={() => router.navigate('/(main)/(tabs)/events')}
          />
          <Pressable
            onPress={() => router.push(`/(main)/event/${nextEvent.id}`)}
            style={({ pressed }) => [styles.eventCard, pressed && styles.pressed]}
          >
            <Image
              source={{ uri: HOME_IMAGES.event }}
              style={styles.eventImage}
              contentFit="cover"
              contentPosition="center"
              priority="normal"
              cachePolicy="memory-disk"
              allowDownscaling={false}
              transition={200}
            />
            <View style={styles.eventOverlay} />
            <View style={styles.eventContent}>
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>{nextEvent.priceLabel}</Text>
              </View>
              <Text style={styles.eventTitle}>{nextEvent.name}</Text>
              <View style={styles.eventMetaRow}>
                <ClockIcon size={13} color="rgba(255,255,255,0.9)" />
                <Text style={styles.eventMeta}>{nextEvent.dateTime}</Text>
              </View>
              <View style={styles.eventMetaRow}>
                <MapPinIcon size={13} color="rgba(255,255,255,0.9)" />
                <Text style={styles.eventMeta}>{nextEvent.location}</Text>
              </View>
            </View>
          </Pressable>

          <SectionHeader
            title="Continue learning"
            actionLabel="My courses"
            onAction={() => router.navigate('/(main)/(tabs)/events/courses')}
          />
          <Pressable
            onPress={() => router.push(`/(main)/course/${activeCourse.id}`)}
            style={({ pressed }) => [styles.courseCard, pressed && styles.pressed]}
          >
            <Image
              source={{ uri: HOME_IMAGES.course }}
              style={styles.courseImage}
              contentFit="cover"
              contentPosition="center"
              priority="normal"
              cachePolicy="memory-disk"
              allowDownscaling={false}
              transition={200}
            />
            <View style={styles.courseOverlay} />
            <View style={styles.courseContent}>
              <Text style={styles.courseLevel}>{activeCourse.level}</Text>
              <Text style={styles.courseName}>{activeCourse.name}</Text>
              <Text style={styles.courseMeta}>
                {activeCourse.instructor} · {activeCourse.lessons} lessons · {activeCourse.weeks} weeks
              </Text>
              <View style={styles.courseProgressTrack}>
                <View style={styles.courseProgressFill} />
              </View>
              <Text style={styles.courseProgressLabel}>35% complete</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PRIMARY,
  },
  statusBarFill: {
    backgroundColor: PRIMARY,
  },
  scroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: H_PAD,
    paddingTop: 18,
    paddingBottom: 28,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  avatar: {
    width: isSmallDevice ? 40 : 48,
    height: isSmallDevice ? 40 : 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: WHITE,
    letterSpacing: 0.5,
  },
  greetingText: {
    flex: 1,
    minWidth: 0,
  },
  greetingMuted: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  greetingName: {
    fontSize: isSmallDevice ? 18 :  20,
    lineHeight: 26,
    fontWeight: '700',
    color: WHITE,
  },
  streakBanner: {
    height: isSmallDevice ? 160 :   HERO_BANNER_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    ...shadowLg,
  },
  streakBannerImage: {
    ...StyleSheet.absoluteFill,
  },
  streakBannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 52, 43, 0.78)',
  },
  streakBannerGlow: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(251, 191, 36, 0.22)',
  },
  streakBannerOrb: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
  },
  streakBannerContent: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  streakBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakFireBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(251, 191, 36, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  streakFireText: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '800',
    color: '#FDE68A',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  streakCountRing: {
    width: isSmallDevice ? 50 : 58,
    height: isSmallDevice ? 50 : 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCountValue: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 24,
    fontWeight: '900',
    color: WHITE,
    letterSpacing: -0.5,
  },
  streakCountUnit: {
    fontSize: isSmallDevice ? 8 : 9,
    lineHeight: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  streakBannerTitle: {
    fontSize: isSmallDevice ? 17 : 19,
    lineHeight: 24,
    fontWeight: '800',
    color: WHITE,
    marginTop: 4,
  },
  streakBannerSubtitle: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.82)',
    marginBottom: 10,
  },
  streakWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  streakDayCol: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  streakDayDot: {
    width: isSmallDevice ? 20 : 22,
    height: isSmallDevice ? 20 : 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakDayDotDone: {
    backgroundColor: '#F59E0B',
    borderColor: '#FCD34D',
  },
  streakDayLabel: {
    fontSize: isSmallDevice ? 8 : 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
  },
  streakDayLabelDone: {
    color: 'rgba(255,255,255,0.9)',
  },
  streakBannerArrow: {
    width: isSmallDevice ? 26 : 28,
    height: isSmallDevice ? 26 : 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bellOuter: {
    width: isSmallDevice ? 40 :  44,
    height: isSmallDevice ? 40 :  44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellCircle: {
    width: isSmallDevice ? 36 :  40,
    height: isSmallDevice ? 36 :  40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: isSmallDevice ? 1 :  2,
    right: 2,
    minWidth: 18,
    height: isSmallDevice ? 16 :  18,
    borderRadius: 9,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isSmallDevice ? 3 :  4,
  },
  bellBadgeText: {
    fontSize: isSmallDevice ? 9 : 10,
    fontWeight: '700',
    color: WHITE,
    lineHeight: 12,
  },
  body: {
    marginTop: isSmallDevice ? -14 :  -16,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: BODY_BG,
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 20 :  24,
  },
  statsGrid: {
    gap: 12,
    marginBottom: isSmallDevice ? 24 :  28,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    padding: isSmallDevice ? 12 : 16,
    minHeight: isSmallDevice ? 100 : 128,
    justifyContent: 'space-between',
    ...shadowSm,
  },
  statCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 12 : 14,
  },
  statCardIcon: {
    width: isSmallDevice ? 38 :  42,
    height: isSmallDevice ? 38 :  42,
    borderRadius: isSmallDevice ? 12 : 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowSm,
  },
  statHintPill: {
    paddingHorizontal: isSmallDevice ? 6 : 8,
    paddingVertical: isSmallDevice ? 3 : 4,
    borderRadius: isSmallDevice ? 10 : 20,
  },
  statHintText: {
    fontSize: isSmallDevice ? 9 : 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statCardValue: {
    fontSize: isSmallDevice ? 28 :  32,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statCardLabel: {
    fontSize: isSmallDevice ? 12 :  13,
    lineHeight: 18,
    fontWeight: '600',
    color: META,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 16 :  18,
    lineHeight: 24,
    fontWeight: '800',
    color: '#111111',
  },
  sectionAction: {
    fontSize: isSmallDevice ? 13 :  14,
    lineHeight: 20,
    fontWeight: '600',
    color: PRIMARY,
  },
  exploreSection: {
    backgroundColor: WHITE,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8EEE9',
    ...shadowSm,
  },
  exploreSectionTitle: {
    fontSize: isSmallDevice ? 14 :  16,
    lineHeight: 20,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  exploreRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: isSmallDevice ? 6 : 8,
    paddingHorizontal: isSmallDevice ? 3 : 4,
    paddingBottom: 2,
  },
  exploreTile: {
    width: isSmallDevice ? 72 : EXPLORE_TILE_WIDTH,
    alignItems: 'center',
    backgroundColor: '#FAFBFA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF2EE',
    paddingTop: isSmallDevice ? 8 : 10,
    paddingBottom: 8,
    paddingHorizontal: isSmallDevice ? 3 : 4,
    ...shadowSm,
  },
  exploreIconWrap: {
    width: isSmallDevice ? 40 :  44,
    height: isSmallDevice ? 40 :  44,
    borderRadius: isSmallDevice ? 12 : 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isSmallDevice ? 6 : 8,
  },
  exploreLabel: {
    fontSize: isSmallDevice ? 10 :  11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  upcomingScroll: {
    gap: 12,
    paddingBottom: 4,
    marginBottom: 28,
  },
  appointmentCard: {
    width: SCREEN_WIDTH * 0.62,
    backgroundColor: WHITE,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadowSm,
  },
  appointmentImage: {
    width: '100%',
    height: 120,
    backgroundColor: MINT,
  },
  appointmentBody: {
    padding: 14,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusConfirmed: {
    backgroundColor: MINT,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: isSmallDevice ? 9 : 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statusTextConfirmed: {
    color: PRIMARY,
  },
  statusTextPending: {
    color: '#B45309',
  },
  appointmentTitle: {
    fontSize: isSmallDevice ? 13 :  15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  appointmentMeta: {
    fontSize: isSmallDevice ? 11 :  12,
    lineHeight: 16,
    fontWeight: '500',
    color: META,
    marginBottom: 8,
  },
  appointmentTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  appointmentTime: {
    fontSize: isSmallDevice ? 10 :  11,
    lineHeight: 14,
    fontWeight: '500',
    color: META,
    flex: 1,
  },
  eventCard: {
    height: 180,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 28,
    ...shadowMd,
  },
  eventImage: {
    ...StyleSheet.absoluteFill,
  },
  eventOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(22, 69, 57, 0.55)',
  },
  eventContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
  },
  eventBadge: {
    alignSelf: 'flex-start',
    backgroundColor: WHITE,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  eventBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
  },
  eventTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: WHITE,
    marginBottom: 8,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  eventMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
  },
  courseCard: {
    height: 200,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 8,
    ...shadowMd,
  },
  courseImage: {
    ...StyleSheet.absoluteFill,
  },
  courseOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(22, 69, 57, 0.7)',
  },
  courseContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
  },
  courseLevel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  courseName: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: WHITE,
    marginBottom: 4,
  },
  courseMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 12,
  },
  courseProgressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: 6,
  },
  courseProgressFill: {
    width: '35%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#4ADE80',
  },
  courseProgressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
