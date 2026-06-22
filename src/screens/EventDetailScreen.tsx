import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import type { ReactNode } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChevronLeftIcon,
  ClockIcon,
  DollarSignIcon,
  MapPinIcon,
  UsersIcon,
} from '@/components/dashboard/DashboardIcons';
import { getEventById } from '@/constants/events';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const BODY_BG = '#F5F7F5';
const STATUS_ORANGE = '#D97706';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const H_PAD = 20;
const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * 0.32);

type InfoCellProps = {
  icon: ReactNode;
  label: string;
};

function InfoCell({ icon, label }: InfoCellProps) {
  return (
    <View style={styles.infoCell}>
      {icon}
      <Text style={styles.infoCellText} numberOfLines={2}>{label}</Text>
    </View>
  );
}

export function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();

  const event = id ? getEventById(id) : undefined;

  if (!event) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  const fillPercent = Math.round((event.registered / event.capacity) * 100);
  const registerLabel = event.isFree
    ? 'Register — Free'
    : `Register — ${event.priceLabel}`;

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={styles.body}>
        <View style={[styles.hero, { height: HERO_HEIGHT }]}>
          <Image
            source={{ uri: event.detailImage }}
            style={[styles.heroImage, { width: SCREEN_WIDTH, height: HERO_HEIGHT }]}
            contentFit="cover"
          />
          <View style={styles.heroGradient} />

          <View style={styles.heroActions}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
              hitSlop={8}
            >
              <ChevronLeftIcon size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.heroBottom}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{event.status}</Text>
            </View>
            <Text style={styles.heroTitle}>{event.detailTitle}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <View style={styles.content}>
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <InfoCell
                  icon={<ClockIcon size={16} color={PRIMARY} />}
                  label={event.schedule}
                />
                <InfoCell
                  icon={<MapPinIcon size={16} color={PRIMARY} />}
                  label={event.location}
                />
              </View>
              <View style={styles.infoRow}>
                <InfoCell
                  icon={<UsersIcon size={16} color={PRIMARY} />}
                  label={`${event.registered} / ${event.capacity} registered`}
                />
                <InfoCell
                  icon={<DollarSignIcon size={16} color={PRIMARY} />}
                  label={event.priceDetail}
                />
              </View>
            </View>

            <Text style={styles.description}>{event.description}</Text>

            <Text style={styles.sectionTitle}>CAPACITY</Text>

            <View style={styles.capacityCard}>
              <View style={styles.capacityHeader}>
                <Text style={styles.capacityRegistered}>
                  {event.registered} registered
                </Text>
                <Text style={styles.capacityPercent}>{fillPercent}% full</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${fillPercent}%` }]}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + 12, paddingTop: 12 },
          ]}
        >
          <Pressable
            onPress={() => router.replace('/(main)/(tabs)/events/courses')}
            style={({ pressed }) => [styles.registerBtn, pressed && styles.pressed]}
          >
            <Text style={styles.registerBtnText}>{registerLabel}</Text>
          </Pressable>
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
  hero: {
    backgroundColor: '#1A1A1A',
  },
  heroImage: {
    backgroundColor: '#E8EDEA',
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  heroActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: isSmallDevice ? 12 :  16,
    paddingTop: isSmallDevice ? 6 :  8,
    paddingBottom: isSmallDevice ? 6 :  8,
  },
  heroBtn: {
    width: isSmallDevice ? 36 : 40,
    height: isSmallDevice ? 36 : 40,
    borderRadius: 20,
    backgroundColor: '#fff3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    left: H_PAD,
    right: H_PAD,
    bottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: isSmallDevice ? 8 :  10,
    paddingVertical: isSmallDevice ? 4 :  5,
    borderRadius: 20,
    gap: 6,
    marginBottom: isSmallDevice ? 8 :  10,
  },
  statusDot: {
    width: isSmallDevice ? 6 :  7,
    height: isSmallDevice ? 6 :  7,
    borderRadius: 4,
    backgroundColor: STATUS_ORANGE,
  },
  statusText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '600',
    color: STATUS_ORANGE,
  },
  heroTitle: {
    fontSize: isSmallDevice ? 20 :  22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 16 :  20,
  },
  infoGrid: {
    gap: isSmallDevice ? 8 :  10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 :  10,
  },
  infoCell: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F7FAF8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: isSmallDevice ? 12 :  14,
    minHeight: 68,
  },
  infoCellText: {
    flex: 1,
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '600',
    color: 'black',
  },
  description: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 24,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '700',
    color: TEXT_BLACK,
    letterSpacing: 0.6,
    marginBottom: isSmallDevice ? 8 :  10,
  },
  capacityCard: {
    backgroundColor: '#f7faf8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: isSmallDevice ? 12 :  14,
    paddingVertical: isSmallDevice ? 12 :   14,
  },
  capacityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 10 :  12,
  },
  capacityRegistered: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#5a7a70',
  },
  capacityPercent: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  progressTrack: {
    height: isSmallDevice ? 6 :  8,
    borderRadius: 4,
    backgroundColor: MINT,
    overflow: 'hidden',
  },
  progressFill: {
    height: isSmallDevice ? 6 :  8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },
  footer: {
    paddingHorizontal: H_PAD,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  registerBtn: {
    height: isSmallDevice ? 40 : 52,
    borderRadius: isSmallDevice ? 14 :  16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: isSmallDevice ? 0.9 :  0.9,
  },
  errorText: {
    margin: 24,
    fontSize: isSmallDevice ? 14 : 16,
    color: TEXT_MUTED,
  },
});
