import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MessageSquareIcon, PlusIcon } from '@/components/dashboard/DashboardIcons';
import { H_PAD, PRIMARY, styles } from '@/screens/events/appointments/AppointmentsScreen.styles';
import {
  APPOINTMENT_TABS,
  CALENDAR_DAYS,
  CALENDAR_MONTH_LABEL,
  filterAppointments,
  type Appointment,
  type AppointmentStatus,
  type AppointmentTab,
} from '@/constants/appointments';
import { appointmentChatHref, chatHref } from '@/utils/chatNavigation';
import { isSmallDevice } from '@/utils/responsive';

const LIST_GAP = isSmallDevice ? 10 : 12;

const STATUS_STYLES: Record<
  AppointmentStatus,
  { bg: string; text: string; dot: string; label: string }
> = {
  confirmed: {
    bg: '#ECFDF5',
    text: '#047857',
    dot: '#10B981',
    label: 'Confirmed',
  },
  pending: {
    bg: '#FFF7ED',
    text: '#C2410C',
    dot: '#F97316',
    label: 'Pending',
  },
  upcoming: {
    bg: '#EFF6FF',
    text: '#1D4ED8',
    dot: '#3B82F6',
    label: 'Upcoming',
  },
};

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const config = STATUS_STYLES[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: config.dot }]} />
      <Text style={[styles.statusText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const router = useRouter();
  const chatMode = appointment.isPast ? 'readonly' : 'full';

  return (
    <View style={[styles.appointmentCard, { borderTopColor: appointment.accentColor }]}>
      <View style={styles.cardTop}>
        <Image source={{ uri: appointment.image }} style={styles.appointmentImage} contentFit="cover" />

        <View style={styles.appointmentContent}>
          <View style={styles.titleRow}>
            <Text style={styles.appointmentTitle} numberOfLines={1}>
              {appointment.title}
            </Text>
            <StatusBadge status={appointment.status} />
          </View>

          <Text style={styles.instructorText} numberOfLines={1}>
            with {appointment.instructor}
          </Text>

          <Text style={styles.metaText}>🕐 {appointment.time}</Text>
          <Text style={styles.metaText}>📍 {appointment.location}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          onPress={() =>
            router.push(
              chatMode === 'readonly'
                ? chatHref(`appointment-${appointment.id}`, {
                    mode: 'readonly',
                    appointmentId: appointment.id,
                    title: appointment.title,
                    provider: appointment.instructor,
                    enterprise: appointment.location,
                  })
                : appointmentChatHref(appointment.id, {
                    title: appointment.title,
                    provider: appointment.instructor,
                    enterprise: appointment.location,
                  }),
            )
          }
          accessibilityRole="button"
          accessibilityLabel="Chat"
          style={({ pressed }) => [styles.chatBtn, pressed && styles.pressed]}
        >
          <MessageSquareIcon size={16} color={PRIMARY} />
          <Text style={styles.chatBtnText}>Chat</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reschedule"
          style={({ pressed }) => [styles.rescheduleBtn, pressed && styles.pressed]}
        >
          <Text style={styles.rescheduleBtnText}>Reschedule</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Join / Directions"
          style={({ pressed }) => [styles.directionsBtn, pressed && styles.pressed]}
        >
          <Text style={styles.directionsBtnText}>Join / Directions</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function AppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<AppointmentTab>('Upcoming');
  const [selectedDate, setSelectedDate] = useState<string>(CALENDAR_DAYS[2].key);

  const appointments = useMemo(
    () => filterAppointments(activeTab, activeTab === 'Upcoming' ? selectedDate : undefined),
    [activeTab, selectedDate],
  );

  const sectionLabel = appointments[0]?.sectionLabel;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: 12 }]}>
        <View style={styles.titleRowHeader}>
          <Text style={styles.title}>Appointments</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add appointment"
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            hitSlop={6}
          >
            <PlusIcon size={isSmallDevice ? 18 : 20} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.monthRow}>
          <Text style={styles.monthLabel}>{CALENDAR_MONTH_LABEL}</Text>

          <View style={styles.tabSwitcher}>
            {APPOINTMENT_TABS.map((tab) => {
              const isActive = activeTab === tab;

              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  accessibilityRole="tab"
                  accessibilityLabel={tab}
                  accessibilityState={{ selected: isActive }}
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
        </View>

        {activeTab === 'Upcoming' ? (
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
                  accessibilityRole="button"
                  accessibilityLabel={`${day.day} ${day.date}`}
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <View style={[styles.dayCard, isSelected && styles.dayCardSelected]}>
                    <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                      {day.day}
                    </Text>
                    <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                      {day.date}
                    </Text>
                    {isSelected ? <View style={styles.dayDotSelected} /> : null}
                    {!isSelected && day.hasDot ? <View style={styles.dayDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        style={styles.listScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: H_PAD,
          paddingBottom: insets.bottom + (isSmallDevice ? 20 : 24),
        }}
        ListHeaderComponent={
          sectionLabel ? <Text style={styles.sectionLabel}>{sectionLabel}</Text> : null
        }
        ItemSeparatorComponent={() => <View style={{ height: LIST_GAP }} />}
        renderItem={({ item }) => <AppointmentCard appointment={item} />}
      />
    </View>
  );
}
