import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  HOME_DASH_BORDER,
  HOME_DASH_GREEN,
  HOME_DASH_MUTED,
  HOME_DASH_TEAL,
  HOME_DASH_TRACK,
  HWI_TREND_30D,
  HWI_TREND_7D,
  HWI_TREND_STATS,
  type HwiTrendRange,
} from '@/components/hwi/hwiDashboardData';
import { c, NU } from '@/utils/newUiCompact';

export function HwiTrendCard() {
  const [range, setRange] = useState<HwiTrendRange>('7D');
  const bars = range === '7D' ? HWI_TREND_7D : HWI_TREND_30D;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>HWI™ Trend ›</Text>
        <View style={styles.toggle}>
          {(['7D', '30D'] as const).map((key) => {
            const active = range === key;
            return (
              <Pressable
                key={key}
                style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                onPress={() => setRange(key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
                  {key}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.chart}>
        {bars.map((bar, index) => (
          <View key={`${bar.label}-${index}`} style={styles.barCol}>
            <View
              style={[
                styles.bar,
                {
                  height: bar.height,
                  backgroundColor: bar.active ? HOME_DASH_GREEN : '#c2e6c8',
                },
              ]}
            />
            <Text style={styles.barLabel}>{bar.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.stats}>
        <View>
          <Text style={styles.statLabel}>Lowest</Text>
          <Text style={styles.statValue}>{HWI_TREND_STATS.lowest}</Text>
        </View>
        <View style={styles.statCenter}>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={styles.statValue}>{HWI_TREND_STATS.average}</Text>
        </View>
        <View style={styles.statRight}>
          <Text style={styles.statLabel}>Highest</Text>
          <Text style={styles.statValue}>{HWI_TREND_STATS.highest}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: HOME_DASH_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(18, 14),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: NU.cardTitleXl,
    fontWeight: '800',
    color: HOME_DASH_TEAL,
  },
  toggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d6ecd9',
    borderRadius: c(8, 6),
    overflow: 'hidden',
  },
  toggleBtn: {
    paddingVertical: c(7, 5),
    paddingHorizontal: NU.cardPadSm,
    backgroundColor: '#FFFFFF',
  },
  toggleBtnActive: {
    backgroundColor: HOME_DASH_GREEN,
  },
  toggleText: {
    fontSize: NU.chipFont,
    fontWeight: '700',
    color: '#4c6b58',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  chart: {
    marginTop: c(22, 18),
    height: c(110, 96),
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: c(10, 8),
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: c(8, 6),
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: c(8, 6),
    borderTopRightRadius: c(8, 6),
    borderBottomLeftRadius: c(4, 3),
    borderBottomRightRadius: c(4, 3),
  },
  barLabel: {
    fontSize: NU.bodySm,
    color: HOME_DASH_MUTED,
  },
  stats: {
    marginTop: NU.sectionGap,
    paddingTop: NU.cardPad,
    borderTopWidth: 1,
    borderTopColor: HOME_DASH_TRACK,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: NU.bodySm,
    color: HOME_DASH_MUTED,
  },
  statValue: {
    fontSize: c(17, 15),
    fontWeight: '800',
    color: HOME_DASH_TEAL,
  },
  statCenter: {
    alignItems: 'center',
  },
  statRight: {
    alignItems: 'flex-end',
  },
});
