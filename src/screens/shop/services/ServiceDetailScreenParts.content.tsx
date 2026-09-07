import { Pressable, ScrollView, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { LeafyGradientButton } from '@/components/LeafyGradientButton';
import type { ServiceDetailSlot } from '@/types/service.types';
import {
  TIME_SLOT_COLS,
  styles,
} from '@/screens/shop/services/ServiceDetailScreen.styles';

import { ProviderAvatar } from '@/screens/shop/services/ServiceDetailScreenParts.hero';
import {
  formatTimeSlotDisplay,
  providerInitial,
  type SelectedBooking,
  type ServiceViewModel,
} from '@/screens/shop/services/ServiceDetailScreenParts.types';

export function ServiceDetailContent({
  service,
  displayProviderName,
  providerEnterprise,
  weekAvailability,
  selectedDateId,
  selectedTimeSlot,
  selectedDate,
  selectedSlotTimes,
  onDateSelect,
  onTimeSlotSelect,
}: {
  service: ServiceViewModel;
  displayProviderName: string | null;
  providerEnterprise: string;
  weekAvailability: ServiceDetailSlot[];
  selectedDateId: string | null;
  selectedTimeSlot: string | null;
  selectedDate: ServiceDetailSlot | null;
  selectedSlotTimes: string[];
  onDateSelect: (dateId: string) => void;
  onTimeSlotSelect: (timeSlot: string) => void;
}) {
  return (
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
                onPress={() => onDateSelect(slot.id)}
                accessibilityRole="button"
                accessibilityLabel={`${slot.dayShort} ${slot.date}, ${slot.slots ?? 0} slots`}
                accessibilityState={{ disabled: slot.isPast, selected: isSelected }}
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
                  onPress={() => onTimeSlotSelect(timeSlot)}
                  accessibilityRole="button"
                  accessibilityLabel={formatTimeSlotDisplay(timeSlot)}
                  accessibilityState={{ selected: isActive }}
                  style={[
                    styles.timeSlotPill,
                    !isLastInRow && styles.timeSlotPillSpaced,
                    isActive && styles.timeSlotPillActive,
                  ]}
                >
                  <Text
                    style={[styles.timeSlotText, isActive && styles.timeSlotTextActive]}
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
  );
}

export function ServiceDetailFooter({
  selectedBooking,
  price,
  paddingBottom,
  onBook,
}: {
  selectedBooking: SelectedBooking | null;
  price: string;
  paddingBottom: number;
  onBook: () => void;
}) {
  return (
    <View style={[styles.footer, { paddingBottom, paddingTop: 12 }]}>
      {selectedBooking ? (
        <LeafyGradientButton style={styles.footerBtn} borderRadius={14} onPress={onBook}>
          <Text style={styles.footerBtnText}>
            Book {formatTimeSlotDisplay(selectedBooking.timeSlot)} · {price}
          </Text>
        </LeafyGradientButton>
      ) : (
        <Pressable
          style={styles.footerBtnDisabled}
          disabled
          accessibilityRole="button"
          accessibilityLabel="Select a Time Slot"
          accessibilityState={{ disabled: true }}
        >
          <Text style={styles.footerBtnDisabledText}>Select a Time Slot</Text>
        </Pressable>
      )}
    </View>
  );
}
