import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  CONSULT_BORDER,
  CONSULT_MUTED,
  CONSULT_NEXT_BORDER,
  CONSULT_NEXT_ICON,
  CONSULT_NEXT_ICON_BG,
  CONSULT_NEXT_VISIT,
  CONSULT_PROVIDERS,
  CONSULT_RATING,
  CONSULT_SLOT_BORDER,
  CONSULT_SLOT_TEXT,
  CONSULT_TEAL,
  type ConsultProvider,
} from '@/components/coach/consultData';
import { c, NU } from '@/utils/newUiCompact';

type ConsultBodyProps = {
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
  onConfirm: () => void;
};

function CalendarIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        stroke={CONSULT_NEXT_ICON}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function StarIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="#e0a12a">
      <Path d="m12 2 3 6.5 7 .9-5 4.8 1.2 7-6.2-3.5L5.8 21 7 14.2 2 9.4l7-.9z" />
    </Svg>
  );
}

function ProviderCard({
  provider,
  selectedSlot,
  onSelectSlot,
}: {
  provider: ConsultProvider;
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
}) {
  return (
    <View style={styles.providerCard}>
      <View style={styles.providerTop}>
        <View style={[styles.avatar, { backgroundColor: provider.avatarBg }]}>
          <Text style={[styles.initials, { color: provider.avatarColor }]}>
            {provider.initials}
          </Text>
        </View>
        <View style={styles.providerCopy}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.specialty}>{provider.specialty}</Text>
        </View>
        <View style={styles.rating}>
          <StarIcon />
          <Text style={styles.ratingText}>{provider.rating}</Text>
        </View>
      </View>
      <View style={styles.slots}>
        {provider.slots.map((slot) => {
          const active = selectedSlot === slot;
          return (
            <Pressable
              key={slot}
              style={[styles.slot, active && styles.slotActive]}
              onPress={() => onSelectSlot(slot)}
              accessibilityRole="button"
            >
              <Text style={[styles.slotText, active && styles.slotTextActive]}>
                {slot}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function ConsultBody({
  selectedSlot,
  onSelectSlot,
  onConfirm,
}: ConsultBodyProps) {
  return (
    <View style={styles.body}>
      <View style={styles.nextCard}>
        <View style={styles.nextIcon}>
          <CalendarIcon />
        </View>
        <View style={styles.nextCopy}>
          <Text style={styles.nextLabel}>{CONSULT_NEXT_VISIT.title}</Text>
          <Text style={styles.nextDoctor}>{CONSULT_NEXT_VISIT.doctor}</Text>
          <Text style={styles.nextWhen}>{CONSULT_NEXT_VISIT.when}</Text>
        </View>
        <Pressable style={styles.joinBtn} accessibilityRole="button">
          <Text style={styles.joinText}>Join</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available this week</Text>
        {CONSULT_PROVIDERS.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            selectedSlot={selectedSlot}
            onSelectSlot={onSelectSlot}
          />
        ))}
      </View>

      <Pressable
        style={styles.confirm}
        onPress={onConfirm}
        accessibilityRole="button"
      >
        <Text style={styles.confirmText}>Confirm {selectedSlot}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: c(22, 18),
  },
  nextCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: CONSULT_NEXT_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPad,
    flexDirection: 'row',
    gap: NU.rowGap,
    alignItems: 'center',
  },
  nextIcon: {
    width: c(52, 46),
    height: c(52, 46),
    borderRadius: c(26, 23),
    backgroundColor: CONSULT_NEXT_ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextCopy: {
    flex: 1,
  },
  nextLabel: {
    fontSize: NU.bodySm,
    fontWeight: '700',
    letterSpacing: 1,
    color: CONSULT_RATING,
  },
  nextDoctor: {
    fontSize: NU.cardTitleLg,
    fontWeight: '700',
    color: CONSULT_TEAL,
    marginTop: c(3, 2),
  },
  nextWhen: {
    fontSize: NU.body,
    color: CONSULT_MUTED,
    marginTop: c(2, 1),
  },
  joinBtn: {
    paddingVertical: NU.chipPadV,
    paddingHorizontal: NU.cardPadSm,
    borderRadius: 99,
    backgroundColor: CONSULT_TEAL,
  },
  joinText: {
    fontSize: NU.chipFont,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    gap: NU.cardGap,
  },
  sectionTitle: {
    fontSize: NU.cardTitleXl,
    fontWeight: '800',
    color: CONSULT_TEAL,
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: CONSULT_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPad,
    gap: NU.rowGap,
  },
  providerTop: {
    flexDirection: 'row',
    gap: NU.rowGap,
    alignItems: 'center',
  },
  avatar: {
    width: c(48, 42),
    height: c(48, 42),
    borderRadius: c(24, 21),
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: NU.cardTitleLg,
    fontWeight: '800',
  },
  providerCopy: {
    flex: 1,
  },
  providerName: {
    fontSize: NU.cardTitleLg,
    fontWeight: '700',
    color: CONSULT_TEAL,
  },
  specialty: {
    fontSize: NU.body,
    color: CONSULT_MUTED,
    marginTop: c(2, 1),
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(5, 4),
  },
  ratingText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: CONSULT_RATING,
  },
  slots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: c(8, 6),
  },
  slot: {
    paddingVertical: NU.chipPadV,
    paddingHorizontal: NU.cardPadSm,
    borderRadius: c(10, 8),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: CONSULT_SLOT_BORDER,
  },
  slotActive: {
    backgroundColor: CONSULT_TEAL,
    borderColor: CONSULT_TEAL,
  },
  slotText: {
    fontSize: NU.chipFont,
    fontWeight: '600',
    color: CONSULT_SLOT_TEXT,
  },
  slotTextActive: {
    color: '#FFFFFF',
  },
  confirm: {
    height: NU.searchH,
    borderRadius: 99,
    backgroundColor: CONSULT_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: NU.cardTitleLg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
