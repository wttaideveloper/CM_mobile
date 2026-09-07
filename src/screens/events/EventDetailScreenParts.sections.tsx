import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { LeafyGradientButton } from '@/components/LeafyGradientButton';
import {
  ChevronLeftIcon,
  ClockIcon,
  HeartIcon,
  MessageSquareIcon,
} from '@/components/dashboard/DashboardIcons';
import type { Event } from '@/constants/events';
import {
  HERO_HEIGHT,
  SCREEN_WIDTH,
  SPEAKER_COLORS,
  SPEAKER_OVERLAP,
  TEXT_MUTED,
  styles,
} from '@/screens/events/EventDetailScreen.styles';

import {
  GradientProgressBar,
  HeroFadeOverlay,
  InfoCard,
  OrganizerAvatar,
} from '@/screens/events/EventDetailScreenParts.shared';

export function EventDetailHero({
  event,
  isFavorite,
  onBack,
  onToggleFavorite,
}: {
  event: Event;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <View style={[styles.hero, { height: HERO_HEIGHT }]}>
      <Image
        source={{ uri: event.detailImage }}
        style={[styles.heroImage, { width: SCREEN_WIDTH, height: HERO_HEIGHT }]}
        contentFit="cover"
      />

      <HeroFadeOverlay width={SCREEN_WIDTH} height={HERO_HEIGHT} />

      <View style={styles.heroActions}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <ChevronLeftIcon size={20} color="#FFFFFF" />
        </Pressable>

        <Pressable
          onPress={onToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          accessibilityState={{ selected: isFavorite }}
          style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <HeartIcon size={18} color={isFavorite ? '#F87171' : '#FFFFFF'} />
        </Pressable>
      </View>

      <View style={styles.heroBottom}>
        <View style={styles.statusBadge}>
          <ClockIcon size={10} color="#FFFFFF" />
          <Text style={styles.statusText}>{event.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.heroTitle}>{event.detailTitle}</Text>
      </View>
    </View>
  );
}

export function EventDetailContent({
  event,
  fillPercent,
  spotsRemaining,
}: {
  event: Event;
  fillPercent: number;
  spotsRemaining: number;
}) {
  return (
    <View style={styles.contentSheet}>
      <View style={styles.infoGrid}>
        <View style={styles.infoRow}>
          <InfoCard emoji="📅" label="Date & Time" value={event.schedule} />
          <InfoCard emoji="📍" label="Location" value={event.location} />
        </View>
        <View style={styles.infoRow}>
          <InfoCard
            emoji="👥"
            label="Attendees"
            value={`${event.registered} / ${event.capacity} registered`}
          />
          <InfoCard emoji="🎟" label="Ticket Price" value={event.priceDetail} />
        </View>
      </View>

      <View style={styles.organizerCard}>
        <OrganizerAvatar initial={event.organizerInitial} />
        <View style={styles.organizerInfo}>
          <Text style={styles.organizerLabel}>Organized by</Text>
          <Text style={styles.organizerName} numberOfLines={1}>
            {event.organizer}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Follow"
          style={({ pressed }) => [styles.followBtn, pressed && styles.pressed]}
        >
          <Text style={styles.followBtnText}>Follow</Text>
        </Pressable>
      </View>

      <Text style={styles.description}>{event.description}</Text>

      <View style={styles.registrationSection}>
        <View style={styles.registrationHeader}>
          <Text style={styles.sectionTitle}>Registration</Text>
          <Text style={styles.registrationPercent}>{fillPercent}% full</Text>
        </View>

        <GradientProgressBar percent={fillPercent} />

        <Text style={styles.registrationMeta}>
          {event.registered} registered · {spotsRemaining} spots remaining
        </Text>
      </View>

      {event.speakerInitials.length > 0 ? (
        <View style={styles.speakersSection}>
          <Text style={styles.sectionTitle}>Keynote Speakers</Text>
          <View style={styles.speakerRow}>
            {event.speakerInitials.map((initial, index) => (
              <View
                key={`${initial}-${index}`}
                style={[
                  styles.speakerAvatar,
                  index > 0 && { marginLeft: -SPEAKER_OVERLAP },
                  { backgroundColor: SPEAKER_COLORS[index % SPEAKER_COLORS.length] },
                ]}
              >
                <Text style={styles.speakerAvatarText}>{initial}</Text>
              </View>
            ))}
            {event.additionalSpeakers > 0 ? (
              <View
                style={[
                  styles.speakerAvatar,
                  styles.speakerMore,
                  { marginLeft: -SPEAKER_OVERLAP },
                ]}
              >
                <Text style={styles.speakerMoreText}>+{event.additionalSpeakers}</Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function EventDetailFooter({
  registerLabel,
  paddingBottom,
  onRegister,
}: {
  registerLabel: string;
  paddingBottom: number;
  onRegister: () => void;
}) {
  return (
    <View style={[styles.footer, { paddingBottom, paddingTop: 10 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Chat"
        style={({ pressed }) => [styles.chatBtn, pressed && styles.pressed]}
        hitSlop={6}
      >
        <MessageSquareIcon size={20} color={TEXT_MUTED} />
      </Pressable>

      <LeafyGradientButton
        onPress={onRegister}
        style={styles.registerBtn}
        borderRadius={14}
      >
        <Text style={styles.registerBtnText}>{registerLabel}</Text>
      </LeafyGradientButton>
    </View>
  );
}

export function getEventRegisterLabel(event: Event): string {
  return event.isFree
    ? 'Register Now — Free'
    : `Register Now — ${event.priceLabel}`;
}
