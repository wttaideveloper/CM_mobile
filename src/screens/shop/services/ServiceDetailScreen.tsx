import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { EmptyState } from '@/components/EmptyState';
import { useDetailBack } from '@/hooks/useDetailBack';
import { useInsideTabLayout } from '@/hooks/useInsideTabLayout';
import { useService } from '@/hooks/useServices';
import { useEnterprise } from '@/hooks/useEnterprises';
import {
  ServiceDetailContent,
  ServiceDetailFooter,
  ServiceDetailHero,
  mapApiServiceToViewModel,
  type SelectedBooking,
} from '@/screens/shop/services/ServiceDetailScreenParts';
import { PRIMARY, styles } from '@/screens/shop/services/ServiceDetailScreen.styles';

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
              <ServiceDetailHero service={service} onBack={goBack} />
              <ServiceDetailContent
                service={service}
                displayProviderName={displayProviderName}
                providerEnterprise={providerEnterprise}
                weekAvailability={weekAvailability}
                selectedDateId={selectedDateId}
                selectedTimeSlot={selectedTimeSlot}
                selectedDate={selectedDate}
                selectedSlotTimes={selectedSlotTimes}
                onDateSelect={handleDateSelect}
                onTimeSlotSelect={setSelectedTimeSlot}
              />
            </ScrollView>

            <ServiceDetailFooter
              selectedBooking={selectedBooking}
              price={service.price}
              paddingBottom={insets.bottom + 12}
              onBook={() => router.push('/(main)/(tabs)/events/appointments')}
            />
          </>
        ) : null}
      </View>
    </View>
  );
}
