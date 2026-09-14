import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

export const EVENTS_TRAINING_GREEN = '#257d3f';
export const EVENTS_TRAINING_TEAL = '#164744';
export const EVENTS_TRAINING_MUTED = '#7c9585';
export const EVENTS_TRAINING_BG = '#f2fff3';
export const EVENTS_TRAINING_BORDER = '#dbeadd';
export const EVENTS_TRAINING_TRACK = '#eef4ee';

export type EventsTrainingTab = 'Events' | 'Training';

type Props = {
  activeTab: EventsTrainingTab;
  onTabChange: (tab: EventsTrainingTab) => void;
  subtitle?: string;
};

export function EventsTrainingTabHeader({
  activeTab,
  onTabChange,
  subtitle = 'Browse nearby events and guided trainings',
}: Props) {
  const scale = SCREEN_W / DESIGN_W;

  return (
    <View style={styles.header}>
      <Image
        source={headerDeco}
        style={{
          position: 'absolute',
          left: 0,
          top: -32.5 * scale,
          width: SCREEN_W,
          height: 360 * scale,
        }}
        contentFit="cover"
        pointerEvents="none"
        transition={0}
      />
      <View style={styles.titleBlock}>
        <Text style={styles.eyebrow}>Discover</Text>
        <Text style={styles.title}>Events & Training</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.segment}>
        {(['Events', 'Training'] as const).map((tab) => {
          const active = tab === activeTab;
          return (
            <Pressable
              key={tab}
              style={[styles.segmentBtn, active && styles.segmentBtnActive]}
              onPress={() => onTabChange(tab)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.segmentText,
                  active && styles.segmentTextActive,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: EVENTS_TRAINING_GREEN,
    paddingHorizontal: NU.hPad,
    paddingTop: 0,
    paddingBottom: NU.headerPadBottom,
    borderBottomLeftRadius: c(30, 26),
    borderBottomRightRadius: c(30, 26),
    overflow: 'hidden',
    position: 'relative',
  },
  titleBlock: {
    zIndex: 1,
    gap: c(4, 3),
  },
  eyebrow: {
    fontSize: NU.eyebrow,
    color: 'rgba(255,255,255,0.85)',
  },
  title: {
    fontSize: NU.title,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: c(13, 12),
    lineHeight: c(18, 16),
    color: 'rgba(255,255,255,0.82)',
    maxWidth: '92%',
  },
  segment: {
    marginTop: NU.sectionGap,
    flexDirection: 'row',
    padding: c(4, 3),
    borderRadius: 99,
    backgroundColor: 'rgba(0,0,0,0.14)',
    gap: c(4, 3),
    zIndex: 1,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: c(10, 8),
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    fontSize: c(13.5, 12.5),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
  },
  segmentTextActive: {
    fontWeight: '800',
    color: EVENTS_TRAINING_TEAL,
  },
});
