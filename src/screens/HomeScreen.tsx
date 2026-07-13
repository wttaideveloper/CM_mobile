import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BellIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  HeartIcon,
  MapPinIcon,
  SearchIcon,
  StarIcon,
} from '@/components/dashboard/DashboardIcons';
import { EVENTS } from '@/constants/events';
import { useEnterprises } from '@/hooks/useEnterprises';
import { fetchNotificationUnreadCount } from '@/services/notification.service';
import { useSearchStore } from '@/stores/search.store';
import type { EnterpriseListItem } from '@/types/enterprise.types';
import { formatMembersCount } from '@/utils/enterprise.mapper';
import { detailHref, SEARCH_DATA_ROUTE } from '@/utils/searchNavigation';
import { isSmallDevice } from '@/utils/responsive';
import { shadowSm } from '@/utils/shadows';

const PRIMARY = '#1F5D4E';
const ACCENT_GREEN = '#4CAF50';
const LEAF_GREEN = '#6BCF8E';
const BODY_BG = '#F5F7F5';
const TEXT_MUTED = '#6B7280';
const TEXT_BLACK = '#111111';
const WHITE = '#FFFFFF';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = isSmallDevice ? 16 : 20;
const FEATURED_BANNER_HEIGHT = isSmallDevice ? 100 : 120;
const FEATURED_BANNER_WIDTH = SCREEN_WIDTH - H_PAD * 2;

const HEADER_ICON_SIZE = isSmallDevice ? 36 : 40;
const HEADER_ICON_RADIUS = isSmallDevice ? 12 : 14;
const HEADER_BADGE_SIZE = isSmallDevice ? 16 : 18;
const HEADER_BADGE_RADIUS = HEADER_BADGE_SIZE / 2;

const QUICK_STAT_ICON_SIZE = isSmallDevice ? 12 : 14;
const SEARCH_ICON_SIZE = isSmallDevice ? 16 : 18;
const BELL_ICON_SIZE = isSmallDevice ? 18 : 20;
const CHEVRON_ICON_SIZE = isSmallDevice ? 16 : 18;
const CATEGORY_ICON_SIZE = isSmallDevice ? 52 : 58;
const CATEGORY_ITEM_WIDTH = isSmallDevice ? 58 : 64;
const ENTERPRISE_AVATAR_SIZE = isSmallDevice ? 44 : 50;
const STAT_GAP = isSmallDevice ? 6 : 8;

/** Decorative header arcs — left top-corner + large top-right sweep (Figma). */
const HEADER_ARC_LEFT_SIZE = SCREEN_WIDTH * 0.35;
const HEADER_ARC_RIGHT_SIZE = SCREEN_WIDTH * 1.12;

const CATEGORIES = [
  { key: 'fitness', label: 'Fitness', emoji: '💪' },
  { key: 'nutrition', label: 'Nutrition', emoji: '🥗' },
  { key: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
  { key: 'healthcare', label: 'Healthcare', emoji: '🏥' },
  { key: 'training', label: 'Training', emoji: '🎓' },
  { key: 'massage', label: 'Massage', emoji: '💆' },
] as const;

const QUICK_STATS = [
  {
    key: 'nearby',
    value: '24',
    label: 'Nearby',
    icon: (color: string) => <MapPinIcon size={QUICK_STAT_ICON_SIZE} color={color} />,
    iconColor: PRIMARY,
    iconBg: '#EAF4EC',
  },
  {
    key: 'booked',
    value: '3',
    label: 'Booked',
    icon: (color: string) => <CalendarDaysIcon size={QUICK_STAT_ICON_SIZE} color={color} />,
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
  },
  {
    key: 'saved',
    value: '12',
    label: 'Saved',
    icon: (color: string) => <HeartIcon size={QUICK_STAT_ICON_SIZE} color={color} />,
    iconColor: '#E11D48',
    iconBg: '#FFF1F2',
  },
  {
    key: 'reviews',
    value: '8',
    label: 'Reviews',
    icon: (color: string) => <StarIcon size={QUICK_STAT_ICON_SIZE} color={color} />,
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB',
  },
] as const;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function HeaderBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <SvgGradient id="headerGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#163D34" />
            <Stop offset="0.55" stopColor="#1A5245" />
            <Stop offset="1" stopColor="#1F5D4E" />
          </SvgGradient>
          <RadialGradient
            id="headerLeafGlow"
            cx="1"
            cy="1"
            r="1.05"
            gradientUnits="objectBoundingBox"
          >
            <Stop offset="0" stopColor={'#2B773F'} stopOpacity={0.80} />
            <Stop offset="0.32" stopColor="#2B773F" stopOpacity={0.6} />
            <Stop offset="0.65" stopColor="#2B773F" stopOpacity={0.22} />
            <Stop offset="1" stopColor="#2B773F" stopOpacity={0} />
          </RadialGradient>
          <SvgGradient id="headerLeafSweep" x1="1" y1="1" x2="0.1" y2="0.15">
            <Stop offset="0" stopColor={ACCENT_GREEN} stopOpacity={0.45} />
            <Stop offset="0.4" stopColor="#38A06E" stopOpacity={0.22} />
            <Stop offset="1" stopColor="#163D34" stopOpacity={0} />
          </SvgGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#headerGrad)" />
        <Rect width="100%" height="100%" fill="url(#headerLeafGlow)" />
        <Rect width="100%" height="100%" fill="url(#headerLeafSweep)" />
      </Svg>
      <View style={styles.headerArcLeft} />
      <View style={styles.headerArcRight} />
    </View>
  );
}

function BannerGradientOverlay() {
  return (
    <View style={styles.featuredOverlayWrap} pointerEvents="none">
      <Svg
        width={FEATURED_BANNER_WIDTH}
        height={FEATURED_BANNER_HEIGHT}
        preserveAspectRatio="none"
      >
        <Defs>
          <SvgGradient id="homeFeaturedGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#1F5D4E" stopOpacity={0.85} />
            <Stop offset="1" stopColor="#1F5D4E" stopOpacity={0.4} />
          </SvgGradient>
        </Defs>
        <Rect
          width={FEATURED_BANNER_WIDTH}
          height={FEATURED_BANNER_HEIGHT}
          fill="url(#homeFeaturedGrad)"
        />
      </Svg>
    </View>
  );
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

type QuickStatCardProps = {
  icon: ReactNode;
  value: string;
  label: string;
  iconBg: string;
};

function QuickStatCard({ icon, value, label, iconBg }: QuickStatCardProps) {
  return (
    <View style={styles.quickStatCard}>
      <View style={[styles.quickStatIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.quickStatValue}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
  );
}

type CategoryItemProps = {
  emoji: string;
  label: string;
  active: boolean;
  onPress: () => void;
};

function CategoryItem({ emoji, label, active, onPress }: CategoryItemProps) {
  return (
    <Pressable onPress={onPress} style={styles.categoryItem}>
      <View style={[styles.categoryIcon, active && styles.categoryIconActive]}>
        <Text style={[styles.categoryEmoji, active && styles.categoryEmojiActive]}>{emoji}</Text>
      </View>
      <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function HomeStarRating({ rating }: { rating: string }) {
  const value = Math.max(0, Math.min(5, Number.parseFloat(rating) || 0));
  const fullStars = Math.floor(value);
  const hasHalf = value - fullStars >= 0.5;

  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < fullStars || (index === fullStars && hasHalf);
        return (
          <StarIcon
            key={index}
            size={11}
            color={filled ? '#FBBF24' : '#E5E7EB'}
          />
        );
      })}
    </View>
  );
}

function EnterpriseHomeCard({ enterprise }: { enterprise: EnterpriseListItem }) {
  const router = useRouter();
  const initial = enterprise.name === 'NA' ? '?' : enterprise.name.charAt(0).toUpperCase();
  const hasLogo = Boolean(enterprise.logoUrl);
  const rating =
    enterprise.rating === 'NA' || enterprise.rating === '0' ? '0' : enterprise.rating;

  return (
    <Pressable
      onPress={() =>
        router.push(detailHref('/(main)/(tabs)/explore', enterprise.id))
      }
      style={({ pressed }) => [styles.enterpriseCard, pressed && styles.pressed]}
    >
      <View style={styles.enterpriseAvatar}>
        {hasLogo ? (
          <Image
            source={{ uri: enterprise.logoUrl! }}
            style={styles.enterpriseAvatarImage}
            contentFit="cover"
          />
        ) : (
          <Text style={styles.enterpriseAvatarText}>{initial}</Text>
        )}
      </View>

      <View style={styles.enterpriseMain}>
        <View style={styles.enterpriseNameRow}>
          <Text style={styles.enterpriseName} numberOfLines={1}>
            {enterprise.name}
          </Text>
          {enterprise.isVerified ? (
            <CircleCheckIcon size={14} color={ACCENT_GREEN} />
          ) : null}
        </View>
        <Text style={styles.enterpriseMeta} numberOfLines={1}>
          {enterprise.category}
          {enterprise.location !== 'NA' ? ` · ${enterprise.location}` : ''}
        </Text>
        <View style={styles.enterpriseRatingRow}>
          <HomeStarRating rating={rating} />
          <Text style={styles.enterpriseRatingText}>
            {rating} · {formatMembersCount(enterprise.members)} members
          </Text>
        </View>
      </View>

      <ChevronRightIcon size={CHEVRON_ICON_SIZE} color="#9CA3AF" />
    </Pressable>
  );
}

function NotificationBell() {
  const router = useRouter();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await fetchNotificationUnreadCount();
      setUnreadNotifications(data.unread_notifications);
    } catch (error) {
      if (__DEV__) {
        console.error('[NOTIFICATIONS] Unread count API ← failed', error);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadUnreadCount();
    }, [loadUnreadCount]),
  );

  const badgeLabel =
    unreadNotifications > 99 ? '99+' : String(unreadNotifications);

  return (
    <Pressable
      onPress={() => router.push('/(main)/notifications')}
      style={({ pressed }) => [styles.bellOuter, pressed && styles.pressed]}
      hitSlop={8}
    >
      <View style={styles.headerIconWrap}>
        <BellIcon size={BELL_ICON_SIZE} color={WHITE} />
      </View>
      <View style={styles.headerIconBadge}>
        <Text style={styles.headerIconBadgeText}>{badgeLabel}</Text>
      </View>
    </Pressable>
  );
}

function SearchBar() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/(main)/search-data')}
      style={({ pressed }) => [styles.searchBar, pressed && styles.pressed]}
    >
      <SearchIcon size={SEARCH_ICON_SIZE} color="rgba(255,255,255,0.55)" />
      <Text style={styles.searchPlaceholder}>Search wellness services...</Text>
    </Pressable>
  );
}

const featuredEvent = EVENTS[0];
const featuredBannerImage = featuredEvent.detailImage || featuredEvent.image;
const featuredDateLabel = featuredEvent.dateTime.split(' · ')[0] ?? featuredEvent.dateTime;

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setSearchQuery = useSearchStore((state) => state.setQuery);
  const [activeCategory, setActiveCategory] = useState<string>('fitness');

  const { data: enterprises, isLoading: isEnterprisesLoading } = useEnterprises();
  const topEnterprises = useMemo(() => (enterprises ?? []).slice(0, 3), [enterprises]);

  const openCategorySearch = (category: (typeof CATEGORIES)[number]) => {
    setActiveCategory(category.key);
    setSearchQuery(category.label);
    router.push(SEARCH_DATA_ROUTE);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + (isSmallDevice ? 20 : 24) }}
      >
        <View style={styles.header}>
          <HeaderBackground />

          <View style={styles.greetingRow}>
            <View style={styles.headerIconWrap}>
              <Text style={styles.avatarText}>S</Text>
            </View>
            <View style={styles.greetingText}>
              <Text style={styles.greetingMuted}>{getGreeting()} ✦</Text>
              <Text style={styles.greetingName} numberOfLines={1}>
                Sarah Johnson
              </Text>
            </View>
            <NotificationBell />
          </View>

          <SearchBar />
        </View>

        <View style={styles.statsRow}>
          {QUICK_STATS.map((stat) => (
            <QuickStatCard
              key={stat.key}
              icon={stat.icon(stat.iconColor)}
              value={stat.value}
              label={stat.label}
              iconBg={stat.iconBg}
            />
          ))}
        </View>

        <View style={styles.body}>
          <SectionHeader
            title="Browse Categories"
            actionLabel="See all"
            onAction={() => router.navigate('/(main)/(tabs)/explore')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {CATEGORIES.map((category) => (
              <CategoryItem
                key={category.key}
                emoji={category.emoji}
                label={category.label}
                active={activeCategory === category.key}
                onPress={() => openCategorySearch(category)}
              />
            ))}
          </ScrollView>

          <Pressable
            onPress={() => router.push(`/(main)/event/${featuredEvent.id}`)}
            style={({ pressed }) => [styles.featuredBanner, pressed && styles.pressed]}
          >
            <Image
              source={{ uri: featuredBannerImage }}
              style={styles.featuredImage}
              contentFit="cover"
              contentPosition="center"
              cachePolicy="memory-disk"
              transition={200}
            />
            <BannerGradientOverlay />
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTag}>FEATURED THIS WEEK</Text>
              <Text style={styles.featuredTitle}>{featuredEvent.name}</Text>
              <Text style={styles.featuredMeta}>
                {featuredDateLabel} · {featuredEvent.location} · {featuredEvent.priceLabel}
              </Text>
            </View>
            <View style={styles.featuredJoinBtn}>
              <Text style={styles.featuredJoinText}>Join</Text>
            </View>
          </Pressable>

          <SectionHeader
            title="Top Enterprises"
            actionLabel="See all"
            onAction={() => router.navigate('/(main)/(tabs)/explore')}
          />

          {isEnterprisesLoading ? (
            <View style={styles.enterprisesLoading}>
              <ActivityIndicator color={PRIMARY} />
            </View>
          ) : topEnterprises.length > 0 ? (
            <View style={styles.enterprisesList}>
              {topEnterprises.map((enterprise) => (
                <EnterpriseHomeCard key={enterprise.id} enterprise={enterprise} />
              ))}
            </View>
          ) : (
            <View style={styles.enterprisesEmpty}>
              <Text style={styles.enterprisesEmptyText}>No enterprises available yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const STAT_CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - STAT_GAP * 3) / 4;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PRIMARY,
  },
  scroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  header: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 10 : 14,
    paddingBottom: isSmallDevice ? 72 : 84,
    overflow: 'visible',
  },
  headerArcLeft: {
    position: 'absolute',
    top: -H_PAD - HEADER_ARC_LEFT_SIZE *-0.36,
    left: -H_PAD - HEADER_ARC_LEFT_SIZE * 0.2,
    width: HEADER_ARC_LEFT_SIZE,
    height: HEADER_ARC_LEFT_SIZE,
    borderRadius: HEADER_ARC_LEFT_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerArcRight: {
    position: 'absolute',
    top: -H_PAD - HEADER_ARC_RIGHT_SIZE * 0.4,
    right: -H_PAD - HEADER_ARC_RIGHT_SIZE * 0.48,
    width: HEADER_ARC_RIGHT_SIZE,
    height: HEADER_ARC_RIGHT_SIZE,
    borderRadius: HEADER_ARC_RIGHT_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 14 : 20,
    gap: isSmallDevice ? 10 : 12,
    zIndex: 2,
  },
  headerIconWrap: {
    width: HEADER_ICON_SIZE,
    height: HEADER_ICON_SIZE,
    borderRadius: HEADER_ICON_RADIUS,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: WHITE,
  },
  greetingText: {
    flex: 1,
    minWidth: 0,
  },
  greetingMuted: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 2,
  },
  greetingName: {
    fontSize: isSmallDevice ? 17 : 20,
    lineHeight: isSmallDevice ? 22 : 26,
    fontWeight: '900',
    color: WHITE,
    letterSpacing: -0.3,
  },
  bellOuter: {
    width: HEADER_ICON_SIZE,
    height: HEADER_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconBadge: {
    position: 'absolute',
    top: isSmallDevice ? 4 : 6,
    right: isSmallDevice ? 2 : 4,
    minWidth: HEADER_BADGE_SIZE,
    height: HEADER_BADGE_SIZE,
    borderRadius: HEADER_BADGE_RADIUS,
    backgroundColor: ACCENT_GREEN,
    borderWidth: 2,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    transform: [
      { translateX: HEADER_BADGE_RADIUS },
      { translateY: -HEADER_BADGE_RADIUS },
    ],
  },
  headerIconBadgeText: {
    fontSize: isSmallDevice ? 9 : 10,
    fontWeight: '700',
    color: WHITE,
    lineHeight: HEADER_BADGE_SIZE - 4,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 10 : 13,
    gap: isSmallDevice ? 8 : 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: H_PAD,
    gap: STAT_GAP,
    marginTop: isSmallDevice ? -40 : -48,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  quickStatCard: {
    width: STAT_CARD_WIDTH,
    backgroundColor: WHITE,
    borderRadius: isSmallDevice ? 16 : 20,
    paddingVertical: isSmallDevice ? 10 : 12,
    paddingHorizontal: isSmallDevice ? 4 : 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...shadowSm,
  },
  quickStatIcon: {
    width: isSmallDevice ? 24 : 28,
    height: isSmallDevice ? 24 : 28,
    borderRadius: isSmallDevice ? 8 : 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isSmallDevice ? 6 : 8,
  },
  quickStatValue: {
    fontSize: isSmallDevice ? 16 : 20,
    lineHeight: isSmallDevice ? 20 : 24,
    fontWeight: '800',
    color: TEXT_BLACK,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: isSmallDevice ? 9 : 10,
    lineHeight: isSmallDevice ? 12 : 13,
    fontWeight: '500',
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  body: {
    paddingHorizontal: H_PAD,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 8 : 10,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 15 : 17,
    lineHeight: isSmallDevice ? 20 : 24,
    fontWeight: '800',
    color: TEXT_BLACK,
    letterSpacing: -0.3,
  },
  sectionAction: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '600',
    color: PRIMARY,
  },
  categoriesRow: {
    gap: isSmallDevice ? 10 : 14,
    paddingBottom: 4,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  categoryItem: {
    alignItems: 'center',
    width: CATEGORY_ITEM_WIDTH,
  },
  categoryIcon: {
    width: CATEGORY_ICON_SIZE,
    height: CATEGORY_ICON_SIZE,
    borderRadius: isSmallDevice ? 16 : 20,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isSmallDevice ? 6 : 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...shadowSm,
  },
  categoryIconActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
    shadowOpacity: 0,
    elevation: 0,
  },
  categoryEmoji: {
    fontSize: isSmallDevice ? 20 : 24,
  },
  categoryEmojiActive: {
    opacity: 1,
  },
  categoryLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 13 : 14,
    fontWeight: '500',
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  categoryLabelActive: {
    fontWeight: '700',
    color: PRIMARY,
  },
  featuredBanner: {
    borderRadius: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    height: FEATURED_BANNER_HEIGHT,
    marginBottom: isSmallDevice ? 18 : 24,
    position: 'relative',
    ...shadowSm,
  },
  featuredImage: {
    width: FEATURED_BANNER_WIDTH,
    height: FEATURED_BANNER_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  featuredOverlayWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: FEATURED_BANNER_WIDTH,
    height: FEATURED_BANNER_HEIGHT,
  },
  featuredContent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: isSmallDevice ? 14 : 18,
    paddingVertical: isSmallDevice ? 12 : 16,
    justifyContent: 'center',
    maxWidth: '68%',
  },
  featuredTag: {
    fontSize: isSmallDevice ? 9 : 10,
    fontWeight: '700',
    color: ACCENT_GREEN,
    letterSpacing: 0.08 * 10,
    textTransform: 'uppercase',
  },
  featuredTitle: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '800',
    color: WHITE,
    marginTop: isSmallDevice ? 2 : 4,
    letterSpacing: -0.3,
  },
  featuredMeta: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  featuredJoinBtn: {
    position: 'absolute',
    right: isSmallDevice ? 10 : 14,
    top: '50%',
    transform: [{ translateY: isSmallDevice ? -14 : -16 }],
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 6 : 8,
    backgroundColor: WHITE,
    borderRadius: isSmallDevice ? 10 : 12,
  },
  featuredJoinText: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '700',
    color: PRIMARY,
  },
  enterprisesList: {
    gap: isSmallDevice ? 8 : 10,
    marginBottom: 8,
  },
  enterpriseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: isSmallDevice ? 14 : 18,
    padding: isSmallDevice ? 10 : 14,
    gap: isSmallDevice ? 10 : 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...shadowSm,
  },
  enterpriseAvatar: {
    width: ENTERPRISE_AVATAR_SIZE,
    height: ENTERPRISE_AVATAR_SIZE,
    borderRadius: isSmallDevice ? 12 : 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  enterpriseAvatarImage: {
    width: '100%',
    height: '100%',
  },
  enterpriseAvatarText: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: WHITE,
  },
  enterpriseMain: {
    flex: 1,
    minWidth: 0,
  },
  enterpriseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  enterpriseName: {
    flexShrink: 1,
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  enterpriseMeta: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 14 : 15,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 2 : 4,
  },
  enterpriseRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  enterpriseRatingText: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 13 : 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  enterprisesLoading: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  enterprisesEmpty: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  enterprisesEmptyText: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
