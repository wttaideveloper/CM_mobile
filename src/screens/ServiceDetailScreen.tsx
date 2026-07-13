import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
} from '@/components/dashboard/DashboardIcons';
import { useDetailBack } from '@/hooks/useDetailBack';
import { useInsideTabLayout } from '@/hooks/useInsideTabLayout';
import { useService } from '@/hooks/useServices';
import { useEnterprise } from '@/hooks/useEnterprises';
import type { ServiceDetailItem, ServiceDetailSlot } from '@/types/service.types';
import { formatServicePrice, normalizeDetailSlot } from '@/utils/service.mapper';
import { shadowLg } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const PAGE_BG = '#FFFFFF';

const TEXT_DESC = '#6B7280';
const SPEC_CARD_BG = '#F5F7F5';
const PROVIDER_CARD_BG = '#F7FAF8';
const AVATAR_SIZE = isSmallDevice ? 44 : 48;
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const H_PAD = isSmallDevice ? 16 : 20;
const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * (isSmallDevice ? 0.28 : 0.30));
const TIME_SLOT_COLS = 3;
const TIME_SLOT_GAP = isSmallDevice ? 8 : 10;
const CONTENT_INNER_WIDTH = SCREEN_WIDTH - H_PAD * 2;
const TIME_SLOT_WIDTH = Math.floor(
  (CONTENT_INNER_WIDTH - TIME_SLOT_GAP * (TIME_SLOT_COLS - 1)) / TIME_SLOT_COLS,
);

type SelectedBooking = {
  dateId: string;
  timeSlot: string;
};

type ServiceViewModel = {
  name: string;
  category: string;
  provider: string | null;
  enterprise: string;
  duration: string;
  price: string;
  unit: string;
  sessionType: string;
  format: string;
  description: string;
  image: string;
  availability: ServiceDetailSlot[];
};

function providerInitial(name: string | null): string {
  if (!name?.trim()) {
    return '?';
  }
  return name.trim().charAt(0).toUpperCase();
}

function formatUnitLabel(unit: string): string {
  const trimmed = unit.trim();
  if (trimmed.startsWith('/')) {
    return `per ${trimmed.slice(1)}`;
  }
  return trimmed;
}

function formatTimeSlotDisplay(timeSlot: string): string {
  const start = timeSlot.split('-')[0]?.trim() ?? timeSlot;
  const [hoursRaw, minutesRaw] = start.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (Number.isNaN(hours)) {
    return timeSlot;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  const displayMinutes = Number.isNaN(minutes) ? '00' : String(minutes).padStart(2, '0');

  return `${displayHour}:${displayMinutes} ${period}`;
}

function mapApiServiceToViewModel(
  service: ServiceDetailItem,
  enterpriseFallback?: string,
): ServiceViewModel {
  const enterprise =
    service.enterpriseName !== 'NA'
      ? service.enterpriseName
      : enterpriseFallback && enterpriseFallback !== 'NA'
        ? enterpriseFallback
        : service.enterpriseName;

  return {
    name: service.name,
    category: service.category,
    provider: service.provider,
    enterprise,
    duration: service.duration,
    price: formatServicePrice(service.price),
    unit: formatUnitLabel(service.unit),
    sessionType: service.sessionType,
    format: service.format,
    description: service.description,
    image: service.bannerImage,
    availability: service.availabilitySlots.map((slot) =>
      normalizeDetailSlot(slot, new Date()),
    ),
  };
}

function ProviderAvatar({ initial }: { initial: string }) {
  return (
    <View style={styles.providerAvatar}>
      <Svg width={AVATAR_SIZE} height={AVATAR_SIZE} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="providerAvatarGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1F5D4E" />
            <Stop offset="1" stopColor="#3E7041" />
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          rx={12}
          fill="url(#providerAvatarGrad)"
        />
      </Svg>
      <Text style={styles.providerAvatarText}>{initial}</Text>
    </View>
  );
}

function HeroFadeOverlay({ width, height }: { width: number; height: number }) {
  const fadeHeight = Math.round(height * 0.5);

  return (
    <Svg
      width={width}
      height={fadeHeight}
      style={[styles.heroFade, { height: fadeHeight }]}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="serviceHeroFade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity={0} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0.55} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={fadeHeight} fill="url(#serviceHeroFade)" />
    </Svg>
  );
}

export function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useDetailBack();
  const insets = useSafeAreaInsets();
  const { screenOffsetStyle } = useInsideTabLayout();
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const statusBarFill = useStatusBarBackground();
  const serviceId = Array.isArray(id) ? id[0] : id ?? '';
  const { service: apiService, isLoading, isError } = useService(serviceId, {
    enabled: Boolean(serviceId),
  });
  const { enterprise: enterpriseDetail } = useEnterprise(apiService?.enterpriseId ?? '', {
    enabled: Boolean(apiService?.enterpriseId) && apiService?.enterpriseName === 'NA',
  });

  const service = useMemo(() => {
    if (!apiService) {
      return undefined;
    }

    return mapApiServiceToViewModel(apiService, enterpriseDetail?.name);
  }, [apiService, enterpriseDetail?.name]);

  const weekAvailability = service?.availability ?? [];
  const selectedDate =
    weekAvailability.find((slot) => slot.id === selectedDateId) ?? null;
  const selectedSlotTimes = selectedDate?.slotTimes ?? [];
  const selectedBooking: SelectedBooking | null =
    selectedDateId && selectedTimeSlot
      ? { dateId: selectedDateId, timeSlot: selectedTimeSlot }
      : null;

  useEffect(() => {
    if (!weekAvailability.length || selectedDateId) {
      return;
    }

    const firstAvailable = weekAvailability.find((slot) => !slot.isPast);
    if (firstAvailable) {
      setSelectedDateId(firstAvailable.id);
    }
  }, [weekAvailability, selectedDateId]);

  const isLoadingContent = isLoading;
  const showNotFound = !service && !isLoadingContent && isError;

  if (!serviceId) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <EmptyState variant="notFound" entity="service" />
      </View>
    );
  }

  if (showNotFound) {
    return (
      <View style={[styles.screen, screenOffsetStyle]}>
        <AppStatusBar />
        <View style={[styles.statusBarFill, { height: insets.top }]} />
        <EmptyState
          variant="notFound"
          entity="service"
          onAction={goBack}
          actionLabel="Go back"
        />
      </View>
    );
  }

  const handleDateSelect = (dateId: string) => {
    setSelectedDateId(dateId);
    setSelectedTimeSlot(null);
  };

  const displayProviderName =
    service?.provider ??
    (service?.enterprise && service.enterprise !== 'NA' ? service.enterprise : null);
  const providerEnterprise =
    service?.enterprise && service.enterprise !== 'NA' ? service.enterprise : '';

  return (
    <View style={[styles.screen, screenOffsetStyle]}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={styles.body}>
        {isLoadingContent ? (
          <View style={styles.loadingContent}>
            <ActivityIndicator color={PRIMARY} size="large" />
          </View>
        ) : service ? (
          <>
            <ScrollView
              style={styles.contentScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 72 }}
            >
              <View style={[styles.hero, { height: HERO_HEIGHT }]}>
                {service.image ? (
                  <Image
                    source={{ uri: service.image }}
                    style={[styles.heroImage, { width: SCREEN_WIDTH, height: HERO_HEIGHT }]}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View style={[styles.heroPlaceholder, { width: SCREEN_WIDTH, height: HERO_HEIGHT }]} />
                )}

                <HeroFadeOverlay width={SCREEN_WIDTH} height={HERO_HEIGHT} />

                <View style={styles.heroActions}>
                  <Pressable
                    onPress={goBack}
                    style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
                    hitSlop={8}
                  >
                    <ChevronLeftIcon size={22} color={PRIMARY} />
                  </Pressable>
                </View>

                <View style={styles.heroOverlay}>
                  {service.category !== 'NA' ? (
                    <View style={styles.heroCategoryBadge}>
                      <Text style={styles.heroCategoryText}>{service.category}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.heroTitle}>{service.name}</Text>
                </View>
              </View>

              <View style={styles.contentSheet}>
                <View style={styles.providerCard}>
                  <ProviderAvatar initial={providerInitial(displayProviderName)} />

                  <View style={styles.providerInfo}>
                    {displayProviderName ? (
                      <Text style={styles.providerName}>{displayProviderName}</Text>
                    ) : null}
                    <Text style={styles.providerRole}>Certified Personal Trainer ·</Text>
                    {providerEnterprise ? (
                      <Text style={styles.providerEnterprise} numberOfLines={1}>
                        {providerEnterprise}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.providerPriceBlock}>
                    <Text style={styles.providerPrice}>{service.price}</Text>
                    <Text style={styles.providerUnit}>{service.unit}</Text>
                  </View>
                </View>

                <View style={styles.specsRow}>
                  <View style={styles.specCard}>
                    <Text style={styles.specIcon}>🕐</Text>
                    <Text style={styles.specValue}>{service.duration}</Text>
                    <Text style={styles.specLabel}>Duration</Text>
                  </View>
                  <View style={styles.specCard}>
                    <Text style={styles.specIcon}>👤</Text>
                    <Text style={styles.specValue}>{service.sessionType}</Text>
                    <Text style={styles.specLabel}>Session Type</Text>
                  </View>
                  <View style={styles.specCard}>
                    <Text style={styles.specIcon}>📍</Text>
                    <Text style={styles.specValue}>{service.format}</Text>
                    <Text style={styles.specLabel}>Format</Text>
                  </View>
                </View>

                {service.description !== 'NA' ? (
                  <Text style={styles.description}>{service.description}</Text>
                ) : null}

                <Text style={styles.sectionTitle}>Select a Day</Text>

                {weekAvailability.length === 0 ? (
                  <EmptyState
                    compact
                    title="No availability"
                    description="There are no bookable slots for this week."
                  />
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.slotsScroll}
                  >
                    {weekAvailability.map((slot) => {
                      const isSelected = !slot.isPast && selectedDateId === slot.id;

                      return (
                        <Pressable
                          key={slot.id}
                          disabled={slot.isPast}
                          onPress={() => handleDateSelect(slot.id)}
                          style={[
                            styles.slotCard,
                            slot.isPast && styles.slotCardDisabled,
                            isSelected && styles.slotCardSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.slotDay,
                              slot.isPast && styles.slotTextDisabled,
                              !isSelected && !slot.isPast && styles.slotDayUnselected,
                              isSelected && styles.slotDaySelected,
                            ]}
                          >
                            {slot.dayShort}
                          </Text>
                          <Text
                            style={[
                              styles.slotDate,
                              slot.isPast && styles.slotTextDisabled,
                              isSelected ? styles.slotDateSelected : styles.slotDateUnselected,
                            ]}
                          >
                            {slot.date}
                          </Text>
                          <Text
                            style={[
                              styles.slotCount,
                              slot.isPast && styles.slotTextDisabled,
                              isSelected && styles.slotCountSelected,
                            ]}
                          >
                            {slot.slots ?? 0} slots
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                )}

                {selectedDate && selectedSlotTimes.length > 0 ? (
                  <>
                    <Text style={styles.sectionTitle}>Available Times</Text>
                    <View style={styles.timeSlotsGrid}>
                      {selectedSlotTimes.map((timeSlot, index) => {
                        const isActive = selectedTimeSlot === timeSlot;
                        const isLastInRow = (index + 1) % TIME_SLOT_COLS === 0;

                        return (
                          <Pressable
                            key={timeSlot}
                            onPress={() => setSelectedTimeSlot(timeSlot)}
                            style={[
                              styles.timeSlotPill,
                              !isLastInRow && styles.timeSlotPillSpaced,
                              isActive && styles.timeSlotPillActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.timeSlotText,
                                isActive && styles.timeSlotTextActive,
                              ]}
                            >
                              {formatTimeSlotDisplay(timeSlot)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                ) : null}
              </View>
            </ScrollView>

            <View
              style={[
                styles.footer,
                { paddingBottom: insets.bottom + 12, paddingTop: 12 },
              ]}
            >
              {selectedBooking ? (
                <LeafyGradientButton
                  style={styles.footerBtn}
                  borderRadius={14}
                  onPress={() => router.push('/(main)/(tabs)/events/appointments')}
                >
                  <Text style={styles.footerBtnText}>
                    Book {formatTimeSlotDisplay(selectedBooking.timeSlot)} · {service.price}
                  </Text>
                </LeafyGradientButton>
              ) : (
                <Pressable style={styles.footerBtnDisabled} disabled>
                  <Text style={styles.footerBtnDisabledText}>Select a Time Slot</Text>
                </Pressable>
              )}
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  statusBarFill: {
    backgroundColor: PAGE_BG,
  },
  body: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  contentScroll: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  hero: {
    backgroundColor: '#F0F2F1',
    position: 'relative',
  },
  heroImage: {
    backgroundColor: '#F0F2F1',
  },
  heroPlaceholder: {
    backgroundColor: MINT,
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroActions: {
    position: 'absolute',
    top: isSmallDevice ? 12 : 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: isSmallDevice ? 12 : 16,
  },
  heroBtn: {
    width: isSmallDevice ? 38 : 40,
    height: isSmallDevice ? 38 : 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowLg,
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 28 : 20,
  },
  heroCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(234, 244, 236, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  heroCategoryText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: PRIMARY,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: isSmallDevice ? 22 : 24,
    lineHeight: 34,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  contentSheet: {
    backgroundColor: PAGE_BG,
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 16 : 18,
    paddingBottom: 8,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: PROVIDER_CARD_BG,
    borderRadius: 16,
    padding: isSmallDevice ? 12 : 14,
    marginBottom: isSmallDevice ? 14 : 16,
  },
  providerAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  providerAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  providerInfo: {
    flex: 1,
    minWidth: 0,
  },
  providerName: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: 22,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 2,
  },
  providerRole: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: TEXT_DESC,
  },
  providerEnterprise: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: TEXT_DESC,
  },
  providerPriceBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  providerPrice: {
    fontSize: isSmallDevice ? 16 : 18,
    lineHeight: 28,
    fontWeight: '900',
    color: PRIMARY,
  },
  providerUnit: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_DESC,
    marginTop: 2,
  },
  specsRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 6 : 8,
    marginBottom: isSmallDevice ? 14 : 16,
  },
  specCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: SPEC_CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: isSmallDevice ? 8 : 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  specIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  specValue: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 16,
    fontWeight: '700',
    color: TEXT_BLACK,
    textAlign: 'center',
  },
  specLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
    color: TEXT_DESC,
    textAlign: 'center',
  },
  description: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 24,
    fontWeight: '400',
    color: TEXT_DESC,
    marginBottom: isSmallDevice ? 20 : 24,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 16 : 16,
    lineHeight: 24,
    fontWeight: '600',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  slotsScroll: {
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 14 : 16,
  },
  slotCard: {
    width: isSmallDevice ? 64 : 70,
    paddingVertical: isSmallDevice ? 8 : 10,
    paddingHorizontal: isSmallDevice ? 8 : 10,
    borderRadius: isSmallDevice ? 14 : 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PAGE_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotCardSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  slotCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  slotTextDisabled: {
    color: '#9CA3AF',
  },
  slotDay: {
    fontSize: isSmallDevice ? 11 : 13,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '600',
    marginBottom: isSmallDevice ? 2 : 4,
  },
  slotDayUnselected: {
    color: TEXT_DESC,
  },
  slotDaySelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  slotDate: {
    fontSize: isSmallDevice ? 15 : 20,
    lineHeight: isSmallDevice ? 18 : 26,
    fontWeight: '800',
    marginBottom: isSmallDevice ? 2 : 4,
  },
  slotDateUnselected: {
    color: TEXT_BLACK,
  },
  slotDateSelected: {
    color: '#FFFFFF',
  },
  slotCount: {
    fontSize: isSmallDevice ? 10 : 12,
    lineHeight: isSmallDevice ? 13 : 16,
    fontWeight: '500',
    color: TEXT_DESC,
  },
  slotCountSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 0,
  },
  timeSlotPill: {
    width: TIME_SLOT_WIDTH,
    paddingVertical: isSmallDevice ? 10 : 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PAGE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: TIME_SLOT_GAP,
  },
  timeSlotPillSpaced: {
    marginRight: TIME_SLOT_GAP,
  },
  timeSlotPillActive: {
    backgroundColor: MINT,
    borderColor: PRIMARY,
    borderWidth: 1.5,
  },
  timeSlotText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  timeSlotTextActive: {
    color: PRIMARY,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: H_PAD,
    backgroundColor: PAGE_BG,
  },
  footerBtn: {
    height: isSmallDevice ? 46 : 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnText: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footerBtnDisabled: {
    height: isSmallDevice ? 46 : 52,
    borderRadius: 14,
    backgroundColor: '#ECEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnDisabledText: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  pressed: {
    opacity: 0.9,
  },
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PAGE_BG,
  },
});
