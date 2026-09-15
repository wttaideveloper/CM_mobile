import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketServiceDetailBody } from '@/components/market/MarketServiceDetailBody';
import { MarketServiceDetailFooter } from '@/components/market/MarketServiceDetailFooter';
import { MarketServiceDetailHeader } from '@/components/market/MarketServiceDetailHeader';
import {
  getMarketServiceDetail,
  SERVICE_DETAIL_BG,
  SERVICE_DETAIL_GREEN,
  SERVICE_DETAIL_MUTED,
} from '@/components/market/marketServiceDetailData';
import { useService } from '@/hooks/useServices';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import { mapServiceDetailToMarketUI } from '@/utils/marketServiceDetail.mapper';
import { c } from '@/utils/newUiCompact';

export function MarketServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const serviceId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const scrollRef = useScrollToTopOnFocus();
  const staticFallback = getMarketServiceDetail(serviceId);
  const { service: apiService, isLoading, isError } = useService(serviceId, {
    enabled: Boolean(serviceId),
  });
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const service =
    apiService != null
      ? mapServiceDetailToMarketUI(apiService, staticFallback)
      : !serviceId || isError
        ? staticFallback
        : null;

  const availabilitySlots = service?.availabilitySlots ?? [];
  const requiresSlot = availabilitySlots.some(
    (slot) => !slot.isPast && slot.slotTimes.length > 0,
  );

  useEffect(() => {
    setSelectedDateId(null);
    setSelectedTimeSlot(null);
  }, [service?.id]);

  useEffect(() => {
    if (!requiresSlot || selectedDateId) {
      return;
    }
    const firstAvailable = availabilitySlots.find(
      (slot) => !slot.isPast && slot.slotTimes.length > 0,
    );
    if (firstAvailable) {
      setSelectedDateId(firstAvailable.id);
    }
  }, [availabilitySlots, requiresSlot, selectedDateId]);

  const handleDateSelect = (dateId: string) => {
    setSelectedDateId(dateId);
    setSelectedTimeSlot(null);
  };

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={SERVICE_DETAIL_GREEN} />
      <StatusBarFill
        lightColor={SERVICE_DETAIL_GREEN}
        darkColor={SERVICE_DETAIL_GREEN}
      />
      {isLoading && serviceId && service == null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={SERVICE_DETAIL_GREEN} size="large" />
          <Text style={styles.loadingText}>Loading service…</Text>
        </View>
      ) : service != null ? (
        <>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <MarketServiceDetailHeader service={service} />
            <MarketServiceDetailBody
              service={service}
              selectedDateId={selectedDateId}
              selectedTimeSlot={selectedTimeSlot}
              onDateSelect={handleDateSelect}
              onTimeSlotSelect={setSelectedTimeSlot}
            />
          </ScrollView>
          <MarketServiceDetailFooter
            service={service}
            selectedTimeSlot={selectedTimeSlot}
            requiresSlot={requiresSlot}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SERVICE_DETAIL_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(12, 10),
  },
  loadingText: {
    fontSize: c(14, 13),
    color: SERVICE_DETAIL_MUTED,
  },
});
