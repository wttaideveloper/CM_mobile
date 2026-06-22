import { Image } from 'expo-image';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  APPOINTMENT_TABS,
  CALENDAR_DAYS,
  filterAppointments,
  type Appointment,
  type AppointmentStatus,
  type AppointmentTab,
} from '@/constants/appointments';
import { shadowMd } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const SURFACE_BG = '#f0f7f3';
const BODY_BG = '#F5F7F5';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const EMERALD_50 = '#ecfdf5';
const EMERALD_200 = '#a7f3d0';
const EMERALD_500 = '#10b981';
const EMERALD_700 = '#047857';
const AMBER_50 = '#fffbeb';
const AMBER_200 = '#fde68a';
const AMBER_500 = '#f59e0b';
const AMBER_700 = '#b45309';
const H_PAD = 20;

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const isConfirmed = status === 'confirmed';

  return (
    <View
      style={[
        styles.statusBadge,
        isConfirmed ? styles.statusBadgeConfirmed : styles.statusBadgePending,
      ]}
    >
      <View
        style={[
          styles.statusDot,
          isConfirmed ? styles.statusDotConfirmed : styles.statusDotPending,
        ]}
      />
      <Text
        style={[
          styles.statusText,
          isConfirmed ? styles.statusTextConfirmed : styles.statusTextPending,
        ]}
      >
        {isConfirmed ? 'Confirmed' : 'Pending'}
      </Text>
    </View>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <View style={styles.appointmentCard}>
      <Image
        source={{ uri: appointment.image }}
        style={styles.appointmentImage}
        contentFit="cover"
      />

      <View style={styles.appointmentContent}>
        <View style={styles.titleRow}>
          <Text style={styles.appointmentTitle} numberOfLines={1}>
            {appointment.title}
          </Text>
          <StatusBadge status={appointment.status} />
        </View>

        <Text style={styles.instructorText} numberOfLines={1}>
          {appointment.instructor}
        </Text>
        <Text style={styles.scheduleText} numberOfLines={1}>
          {appointment.schedule}
        </Text>
      </View>
    </View>
  );
}

export function AppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const [activeTab, setActiveTab] = useState<AppointmentTab>('Upcoming');
  const [selectedDate, setSelectedDate] = useState<string>(CALENDAR_DAYS[2].key);

  const appointments = useMemo(
    () => filterAppointments(activeTab),
    [activeTab],
  );

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={styles.topSection}>
        <View style={[styles.headerCard, { paddingTop: 12 }]}>
          <Text style={styles.title}>Appointments</Text>

          <View style={styles.tabSwitcher}>
            {APPOINTMENT_TABS.map((tab) => {
              const isActive = activeTab === tab;

              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={({ pressed }) => [
                    styles.tabOption,
                    isActive && styles.tabOptionActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabOptionText,
                      isActive && styles.tabOptionTextActive,
                    ]}
                  >
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {activeTab === 'Upcoming' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.calendarScroll}
            >
              {CALENDAR_DAYS.map((day) => {
                const isSelected = selectedDate === day.key;

                return (
                  <Pressable
                    key={day.key}
                    onPress={() => setSelectedDate(day.key)}
                    style={({ pressed }) => [
                      styles.dayCard,
                      isSelected && styles.dayCardSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayLabel,
                        isSelected && styles.dayLabelSelected,
                      ]}
                    >
                      {day.day}
                    </Text>
                    <Text
                      style={[
                        styles.dayNumber,
                        isSelected && styles.dayNumberSelected,
                      ]}
                    >
                      {day.date}
                    </Text>
                    {isSelected && <View style={styles.dayDot} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.listScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: H_PAD,
          paddingBottom: insets.bottom + 16,
          gap: 12,
        }}
      >
        {appointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  statusBarFill: {
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    backgroundColor: BODY_BG,
    marginBottom: isSmallDevice ? 12 :  15,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 12 :  16,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 30,
    fontWeight: '800',
    color: 'black',
    marginBottom: isSmallDevice ? 12 :  16,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: SURFACE_BG,
    borderRadius: 14,
    padding: isSmallDevice ? 4 :  6,
    marginBottom: 16,
  },
  tabOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? 6 :  8,
    borderRadius: 10,
  },
  tabOptionActive: {
    backgroundColor: '#FFFFFF',
  },
  tabOptionText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  tabOptionTextActive: {
    color: PRIMARY,
  },
  calendarScroll: {
    gap: isSmallDevice ? 6 :  8,
  },
  dayCard: {
    width: isSmallDevice ? 52 :  52,
    height: isSmallDevice ? 64 :  64,
    borderRadius: 14,
    backgroundColor: SURFACE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: isSmallDevice ? 8 :  10,
    paddingBottom: isSmallDevice ? 6 :  8,
  },
  dayCardSelected: {
    backgroundColor: PRIMARY,
  },
  dayLabel: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: PRIMARY,
    marginBottom: isSmallDevice ? 1 :  2,
  },
  dayLabelSelected: {
    color: '#FFFFFF',
  },
  dayNumber: {
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: 20,
    fontWeight: '700',
    color: 'black',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  dayDot: {
    width: isSmallDevice ? 4 :  4,
    height: isSmallDevice ? 4 :  4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF99',
    marginTop: isSmallDevice ? 2 :  4,
  },
  listScroll: {
    flex: 1,
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallDevice ? 14 :  16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: isSmallDevice ? 12 :  14,
    gap: 12,
    alignItems: 'center',
    ...shadowMd,
  },
  appointmentImage: {
    width: isSmallDevice ? 60 : 64,
    height: isSmallDevice ? 60 : 64,
    borderRadius: isSmallDevice ? 10 :  12,
    backgroundColor: BORDER,
    flexShrink: 0,
  },
  appointmentContent: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: isSmallDevice ? 6 :  8,
    marginBottom: isSmallDevice ? 3 : 4,
  },
  appointmentTitle: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  instructorText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 3 :  4,
  },
  scheduleText: {
    fontSize: isSmallDevice ? 12 : 14,
    lineHeight: 18,
    fontWeight: '700',
    color: PRIMARY,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 4 :  5,
    paddingHorizontal: 12,
    paddingVertical: isSmallDevice ? 3 :  4,
    borderRadius: 20,
    borderWidth: 1,
    flexShrink: 0,
  },
  statusBadgeConfirmed: {
    backgroundColor: EMERALD_50,
    borderColor: EMERALD_200,
  },
  statusBadgePending: {
    backgroundColor: AMBER_50,
    borderColor: AMBER_200,
  },
  statusDot: {
    width: isSmallDevice ? 4 : 6,
    height: isSmallDevice ? 4 : 6,
    borderRadius: isSmallDevice ? 2 : 3,
  },
  statusDotConfirmed: {
    backgroundColor: EMERALD_500,
  },
  statusDotPending: {
    backgroundColor: AMBER_500,
  },
  statusText: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: 14,
    fontWeight: '600',
  },
  statusTextConfirmed: {
    color: EMERALD_700,
  },
  statusTextPending: {
    color: AMBER_700,
  },
  pressed: {
    opacity: 0.9,
  },
});
