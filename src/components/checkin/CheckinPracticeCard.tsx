import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  CheckinBarbellIcon,
  CheckinCheckIcon,
  CheckinDropIcon,
  CheckinLeafIcon,
  CheckinMinusIcon,
  CheckinMoonIcon,
  CheckinPlusIcon,
  CheckinSunIcon,
  CheckinWindIcon,
} from '@/components/checkin/CheckinIcons';
import {
  CHECKIN_BORDER,
  CHECKIN_MUTED,
  CHECKIN_TEAL,
  CHECKIN_TRACK,
  formatCheckinValue,
  type CheckinPractice,
} from '@/components/checkin/checkinData';
import { c, NU } from '@/utils/newUiCompact';

type CheckinPracticeCardProps = {
  practice: CheckinPractice;
  value: number;
  onChange: (next: number) => void;
};

function PracticeIcon({
  icon,
  color,
}: {
  icon: CheckinPractice['icon'];
  color: string;
}) {
  switch (icon) {
    case 'leaf':
      return <CheckinLeafIcon color={color} />;
    case 'drop':
      return <CheckinDropIcon color={color} />;
    case 'sun':
      return <CheckinSunIcon color={color} />;
    case 'wind':
      return <CheckinWindIcon color={color} />;
    case 'moon':
      return <CheckinMoonIcon color={color} />;
    case 'barbell':
      return <CheckinBarbellIcon color={color} />;
  }
}

const STEP_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

export function CheckinPracticeCard({
  practice,
  value,
  onChange,
}: CheckinPracticeCardProps) {
  const met = value >= practice.goal;
  const atMin = value <= 0;
  const pct = Math.min(100, (value / practice.goal) * 100);
  const valueLabel = formatCheckinValue(
    value,
    practice.unitSingular,
    practice.unitPlural,
  );
  const goalLabel = formatCheckinValue(
    practice.goal,
    practice.unitSingular,
    practice.unitPlural,
  );
  const statusLabel = met
    ? `goal met, ${valueLabel} of ${goalLabel}`
    : `${valueLabel} of ${goalLabel}, goal not met yet`;

  return (
    <View style={styles.card}>
      <View
        style={styles.top}
        accessible
        accessibilityRole="summary"
        accessibilityLabel={`${practice.title}. ${practice.subtitle}. ${statusLabel}.`}
      >
        <View
          style={[styles.iconWrap, { backgroundColor: practice.iconBg }]}
          importantForAccessibility="no-hide-descendants"
        >
          <PracticeIcon icon={practice.icon} color={practice.color} />
        </View>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: practice.color }]}>
              {practice.title}
            </Text>
            {met ? (
              <View
                style={[styles.metBadge, { backgroundColor: practice.iconBg }]}
              >
                <CheckinCheckIcon color={practice.color} size={10} />
                <Text style={[styles.metBadgeText, { color: practice.color }]}>
                  Goal met
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.subtitle}>{practice.subtitle}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.stepper}>
          <Pressable
            style={[
              styles.stepBtn,
              { backgroundColor: practice.iconBg },
              atMin && styles.stepBtnDisabled,
            ]}
            onPress={() => onChange(Math.max(0, value - 1))}
            disabled={atMin}
            hitSlop={STEP_HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel={`Decrease ${practice.title}`}
            accessibilityHint={`Currently ${valueLabel}`}
            accessibilityState={{ disabled: atMin }}
          >
            <CheckinMinusIcon color={practice.color} />
          </Pressable>
          <Text style={styles.count} accessibilityLiveRegion="polite">
            {value}
          </Text>
          <Pressable
            style={[styles.stepBtn, { backgroundColor: practice.iconBg }]}
            onPress={() => onChange(value + 1)}
            hitSlop={STEP_HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel={`Increase ${practice.title}`}
            accessibilityHint={`Currently ${valueLabel}`}
          >
            <CheckinPlusIcon color={practice.color} />
          </Pressable>
        </View>
        <View style={styles.goalBlock}>
          <Text style={styles.valueLabel} accessibilityLiveRegion="polite">
            {valueLabel}
          </Text>
          <Text style={styles.goalLabel}>Goal: {goalLabel}</Text>
        </View>
      </View>

      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: practice.goal, now: value }}
      >
        <View
          style={[
            styles.fill,
            { width: `${pct}%`, backgroundColor: practice.color },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: CHECKIN_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPadXs,
  },
  top: {
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: c(36, 32),
    height: c(36, 32),
    borderRadius: c(18, 16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: c(7, 6),
  },
  title: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
  },
  metBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: c(7, 6),
    paddingVertical: 2,
    borderRadius: 99,
  },
  metBadgeText: {
    fontSize: c(10.5, 10),
    fontWeight: '700',
  },
  subtitle: {
    fontSize: c(12.5, 11),
    color: CHECKIN_MUTED,
    marginTop: 2,
  },
  controls: {
    marginTop: c(10, 8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NU.cardGap,
  },
  stepBtn: {
    width: c(32, 28),
    height: c(32, 28),
    borderRadius: c(16, 14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
  count: {
    fontSize: NU.cardTitleXl,
    fontWeight: '800',
    color: CHECKIN_TEAL,
    minWidth: c(22, 18),
    textAlign: 'center',
  },
  goalBlock: {
    alignItems: 'flex-end',
  },
  valueLabel: {
    fontSize: NU.link,
    fontWeight: '700',
    color: CHECKIN_TEAL,
  },
  goalLabel: {
    fontSize: c(11.5, 10),
    color: CHECKIN_MUTED,
  },
  track: {
    marginTop: c(10, 8),
    height: 5,
    borderRadius: 99,
    backgroundColor: CHECKIN_TRACK,
    overflow: 'hidden',
  },
  fill: {
    height: 5,
    borderRadius: 99,
  },
});
