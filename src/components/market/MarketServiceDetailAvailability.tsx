import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  SERVICE_DETAIL_BORDER,
  SERVICE_DETAIL_GREEN,
  SERVICE_DETAIL_MUTED,
  SERVICE_DETAIL_TEAL,
  type MarketServiceDetail,
} from '@/components/market/marketServiceDetailData';
import { formatTimeSlotDisplay } from '@/screens/shop/services/ServiceDetailScreenParts.types';
import { c, NU } from '@/utils/newUiCompact';

type AvailabilitySlot = MarketServiceDetail['availabilitySlots'][number];

type MarketServiceDetailAvailabilityProps = {
  slots: AvailabilitySlot[];
  selectedDateId: string | null;
  selectedTimeSlot: string | null;
  onDateSelect: (dateId: string) => void;
  onTimeSlotSelect: (timeSlot: string) => void;
};

export function MarketServiceDetailAvailability({
  slots,
  selectedDateId,
  selectedTimeSlot,
  onDateSelect,
  onTimeSlotSelect,
}: MarketServiceDetailAvailabilityProps) {
  const bookable = slots.filter((slot) => !slot.isPast && slot.slotTimes.length > 0);
  const selectedDay =
    bookable.find((slot) => slot.id === selectedDateId) ??
    slots.find((slot) => slot.id === selectedDateId) ??
    null;
  const timeSlots = selectedDay && !selectedDay.isPast ? selectedDay.slotTimes : [];

  if (slots.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Select a day</Text>
      {bookable.length === 0 ? (
        <Text style={styles.emptyText}>No bookable slots right now.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysRow}
        >
          {slots.map((slot) => {
            const disabled = slot.isPast || slot.slotTimes.length === 0;
            const selected = !disabled && selectedDateId === slot.id;

            return (
              <Pressable
                key={slot.id}
                disabled={disabled}
                onPress={() => onDateSelect(slot.id)}
                accessibilityRole="button"
                accessibilityState={{ disabled, selected }}
                style={[
                  styles.dayCard,
                  disabled && styles.dayCardDisabled,
                  selected && styles.dayCardSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayShort,
                    disabled && styles.textDisabled,
                    selected && styles.textSelected,
                  ]}
                >
                  {slot.dayShort}
                </Text>
                <Text
                  style={[
                    styles.dayDate,
                    disabled && styles.textDisabled,
                    selected && styles.textSelected,
                  ]}
                >
                  {slot.date}
                </Text>
                <Text
                  style={[
                    styles.daySlots,
                    disabled && styles.textDisabled,
                    selected && styles.daySlotsSelected,
                  ]}
                >
                  {slot.slotTimes.length} slots
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {timeSlots.length > 0 ? (
        <>
          <Text style={[styles.sectionLabel, styles.timesLabel]}>Available times</Text>
          <View style={styles.timesGrid}>
            {timeSlots.map((timeSlot) => {
              const active = selectedTimeSlot === timeSlot;
              return (
                <Pressable
                  key={timeSlot}
                  onPress={() => onTimeSlotSelect(timeSlot)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[styles.timePill, active && styles.timePillActive]}
                >
                  <Text style={[styles.timeText, active && styles.timeTextActive]}>
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

const styles = StyleSheet.create({
  section: {
    gap: c(10, 8),
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: SERVICE_DETAIL_MUTED,
  },
  timesLabel: {
    marginTop: c(6, 4),
  },
  emptyText: {
    fontSize: NU.link,
    color: SERVICE_DETAIL_MUTED,
  },
  daysRow: {
    gap: c(10, 8),
    paddingVertical: c(2, 1),
  },
  dayCard: {
    width: c(72, 64),
    borderRadius: c(13, 11),
    borderWidth: 1,
    borderColor: SERVICE_DETAIL_BORDER,
    backgroundColor: '#FFFFFF',
    paddingVertical: c(10, 8),
    alignItems: 'center',
    gap: c(2, 1),
  },
  dayCardSelected: {
    borderColor: SERVICE_DETAIL_GREEN,
    backgroundColor: '#e6f4e8',
  },
  dayCardDisabled: {
    opacity: 0.45,
  },
  dayShort: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: SERVICE_DETAIL_MUTED,
    textTransform: 'uppercase',
  },
  dayDate: {
    fontSize: c(20, 18),
    fontWeight: '800',
    color: SERVICE_DETAIL_TEAL,
  },
  daySlots: {
    fontSize: c(10.5, 9.5),
    color: SERVICE_DETAIL_MUTED,
  },
  daySlotsSelected: {
    color: SERVICE_DETAIL_GREEN,
  },
  textSelected: {
    color: SERVICE_DETAIL_GREEN,
  },
  textDisabled: {
    color: SERVICE_DETAIL_MUTED,
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: c(8, 7),
  },
  timePill: {
    minWidth: '30%',
    flexGrow: 1,
    paddingVertical: c(10, 8),
    paddingHorizontal: c(10, 8),
    borderRadius: 99,
    borderWidth: 1,
    borderColor: SERVICE_DETAIL_BORDER,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  timePillActive: {
    borderColor: SERVICE_DETAIL_TEAL,
    backgroundColor: SERVICE_DETAIL_TEAL,
  },
  timeText: {
    fontSize: NU.body,
    fontWeight: '600',
    color: SERVICE_DETAIL_TEAL,
  },
  timeTextActive: {
    color: '#FFFFFF',
  },
});
