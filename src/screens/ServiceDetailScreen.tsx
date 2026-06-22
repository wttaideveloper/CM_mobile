import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppStatusBar } from '@/components/AppStatusBar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import {
  getServiceById,
  type Service,
  type ServiceSlot,
} from '@/constants/services';
import { useService } from '@/hooks/useServices';
import { useEnterprise } from '@/hooks/useEnterprises';
import type { ServiceDetailItem } from '@/types/service.types';
import { formatServicePrice } from '@/utils/service.mapper';
import { shadowLg } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const SLOT_SELECTED_MUTED = 'rgba(255, 255, 255, 0.6)';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const H_PAD = 20;
const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * 0.28);

type ServiceViewModel = {
  name: string;
  category: string;
  provider: string;
  enterprise: string;
  duration: string;
  price: string;
  sessionType: string;
  format: string;
  description: string;
  image: string;
  availability: ServiceSlot[];
};

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
    sessionType: service.sessionType,
    format: service.format,
    description: service.description,
    image: service.bannerImage,
    availability: service.availabilitySlots,
  };
}

function mapStaticServiceToViewModel(service: Service): ServiceViewModel {
  return {
    name: service.name,
    category: service.category,
    provider: service.provider,
    enterprise: service.enterprise,
    duration: service.duration,
    price: service.price,
    sessionType: service.sessionType,
    format: service.format,
    description: service.description,
    image: service.image,
    availability: service.availability,
  };
}

export function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const serviceId = Array.isArray(id) ? id[0] : id ?? '';
  const staticService = serviceId ? getServiceById(serviceId) : undefined;
  const { service: apiService, isLoading, isError } = useService(serviceId, {
    enabled: Boolean(serviceId) && !staticService,
  });
  const { enterprise: enterpriseDetail } = useEnterprise(apiService?.enterpriseId ?? '', {
    enabled: Boolean(apiService?.enterpriseId) && apiService?.enterpriseName === 'NA',
  });

  const service = useMemo(() => {
    if (staticService) {
      return mapStaticServiceToViewModel(staticService);
    }

    if (apiService) {
      return mapApiServiceToViewModel(apiService, enterpriseDetail?.name);
    }

    return undefined;
  }, [apiService, enterpriseDetail?.name, staticService]);

  const isLoadingContent = !staticService && isLoading;
  const showNotFound = !service && !isLoadingContent && (isError || !staticService);

  if (!serviceId) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <View style={styles.loadingState}>
          <Text style={styles.errorText}>Service not found</Text>
        </View>
      </View>
    );
  }

  if (showNotFound) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <View style={[styles.statusBarFill, { height: insets.top }]} />
        <View style={styles.loadingState}>
          <Text style={styles.errorText}>Service not found</Text>
          <Pressable onPress={() => router.back()} style={styles.fallbackBtn}>
            <Text style={styles.fallbackBtnText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const weekAvailability = service?.availability ?? [];
  const activeSlotId = selectedSlotId ?? weekAvailability[0]?.id;

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top }]} />

      <View style={styles.body}>
        <View style={[styles.hero, { height: HERO_HEIGHT }]}>
          {service?.image ? (
            <Image
              source={{ uri: service.image }}
              style={[styles.heroImage, { width: SCREEN_WIDTH, height: HERO_HEIGHT }]}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.heroPlaceholder, { width: SCREEN_WIDTH, height: HERO_HEIGHT }]} />
          )}

          <View style={styles.heroActions}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
              hitSlop={8}
            >
              <ChevronLeftIcon size={22} color={PRIMARY} />
            </Pressable>
          </View>
        </View>

        {isLoadingContent ? (
          <View style={styles.loadingContent}>
            <ActivityIndicator color={PRIMARY} size="large" />
          </View>
        ) : service ? (
          <>
            <ScrollView
              style={styles.contentScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              <View style={styles.content}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{service.category}</Text>
                </View>

                <View style={styles.titleRow}>
                  <Text style={styles.serviceTitle} numberOfLines={2}>
                    {service.name}
                  </Text>
                  <Text style={styles.servicePrice}>{service.price}</Text>
                </View>

                <Text style={styles.providerText}>
                  by {service.provider} · {service.enterprise}
                </Text>

                <View style={styles.specsRow}>
                  <View style={styles.specCard}>
                    <Text style={styles.specValue}>{service.duration}</Text>
                    <Text style={styles.specLabel}>Duration</Text>
                  </View>
                  <View style={styles.specCard}>
                    <Text style={styles.specValue}>{service.sessionType}</Text>
                    <Text style={styles.specLabel}>Type</Text>
                  </View>
                  <View style={styles.specCard}>
                    <Text style={styles.specValue}>{service.format}</Text>
                    <Text style={styles.specLabel}>Format</Text>
                  </View>
                </View>

                <Text style={styles.description}>{service.description}</Text>

                <Text style={styles.sectionTitle}>AVAILABLE THIS WEEK</Text>

                {weekAvailability.length === 0 ? (
                  <Text style={styles.emptySlotsText}>No slots available this week.</Text>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.slotsScroll}
                  >
                    {weekAvailability.map((slot) => {
                      const isSelected = slot.id === activeSlotId;
                      return (
                        <Pressable
                          key={slot.id}
                          onPress={() => setSelectedSlotId(slot.id)}
                          style={[
                            styles.slotCard,
                            isSelected && styles.slotCardSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.slotDay,
                              isSelected && styles.slotDaySelected,
                            ]}
                          >
                            {slot.dayShort}
                          </Text>
                          <Text
                            style={[
                              styles.slotDate,
                              isSelected ? styles.slotDateSelected : styles.slotDateUnselected,
                            ]}
                          >
                            {slot.date}
                          </Text>
                          <Text
                            style={[
                              styles.slotCount,
                              isSelected && styles.slotCountSelected,
                            ]}
                          >
                            {slot.slots} slots
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            </ScrollView>

            <View
              style={[
                styles.footer,
                { paddingBottom: insets.bottom + 12, paddingTop: 12 },
              ]}
            >
              <Pressable
                style={({ pressed }) => [styles.bookBtn, pressed && styles.pressed]}
              >
                <Text style={styles.bookBtnText}>
                  Book Session — {service.price}
                </Text>
              </Pressable>
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
    backgroundColor: '#FFFFFF',
  },
  statusBarFill: {
    backgroundColor: '#FFFFFF',
  },
  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  hero: {
    backgroundColor: '#F0F2F1',
  },
  heroImage: {
    backgroundColor: '#F0F2F1',
  },
  heroPlaceholder: {
    backgroundColor: MINT,
  },
  heroActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal:isSmallDevice ? 12 : 16,
    paddingTop: isSmallDevice ? 6 : 8,
    paddingBottom: isSmallDevice ? 6 : 8,
  },
  heroBtn: {
    width: isSmallDevice ? 36 : 40,
    height: isSmallDevice ? 36 : 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowLg,
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 16 : 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: MINT,
    paddingHorizontal: isSmallDevice ? 8 : 10,
    paddingVertical: isSmallDevice ? 3 :  4,
    borderRadius: 12,
    marginBottom: isSmallDevice ? 8 : 10,
  },
  categoryBadgeText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '600',
    color: PRIMARY,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: isSmallDevice ? 3 : 4,
  },
  serviceTitle: {
    flex: 1,
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 28,
    fontWeight: '900',
    color: TEXT_BLACK,
  },
  servicePrice: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 28,
    fontWeight: '700',
    color: PRIMARY,
    flexShrink: 0,
  },
  providerText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 22,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  specsRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  specCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#F7FAF8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: isSmallDevice ? 8 : 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specValue: {
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: 22,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 1 : 2,
    textAlign: 'center',
  },
  specLabel: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  description: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 24,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 16 : 24,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '700',
    color: TEXT_BLACK,
    letterSpacing: 0.6,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  emptySlotsText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 6 :   8,
  },
  slotsScroll: {
    gap: isSmallDevice ? 8 : 10,
    paddingRight: H_PAD,
  },
  slotCard: {
    width: isSmallDevice ? 60 : 68,
    paddingVertical: isSmallDevice ? 6 : 8,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotCardSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  slotDay: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '600',
    color: PRIMARY,
    marginBottom: 2,
  },
  slotDaySelected: {
    color: SLOT_SELECTED_MUTED,
    fontWeight: '700',
  },
  slotDate: {
    fontSize: isSmallDevice ? 16 : 18,
    lineHeight: 26,
    fontWeight: '700',
    marginBottom: 2,
  },
  slotDateUnselected: {
    color: TEXT_BLACK,
  },
  slotDateSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  slotCount: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  slotCountSelected: {
    color: SLOT_SELECTED_MUTED,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: H_PAD,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  bookBtn: {
    height: isSmallDevice ? 40 : 52,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtnText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.9,
  },
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  fallbackBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: PRIMARY,
  },
  fallbackBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: TEXT_MUTED,
  },
});
