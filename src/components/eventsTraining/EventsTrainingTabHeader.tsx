import { Dimensions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { MarketSearchIcon } from '@/components/market/MarketIcons';
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

type Props = {
  subtitle?: string;
  search: string;
  onSearchChange: (text: string) => void;
};

export function EventsTrainingTabHeader({
  subtitle = 'Cohorts, labs and skill programs to join',
  search,
  onSearchChange,
}: Props) {
  const router = useRouter();
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
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Discover</Text>
          <Text style={styles.title}>Trainings and Courses</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Pressable
          style={styles.enrollmentsBtn}
          onPress={() => router.push('/(main)/market/my-trainings')}
          accessibilityRole="button"
          accessibilityLabel="My Enrollments"
        >
          <Text style={styles.enrollmentsBtnText}>My Enrollments</Text>
        </Pressable>
      </View>

      <View style={styles.search}>
        <MarketSearchIcon />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search trainings and courses"
          placeholderTextColor="rgba(255,255,255,0.55)"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          accessibilityLabel="Search trainings and courses"
        />
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
  topRow: {
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: c(10, 8),
  },
  titleBlock: {
    flex: 1,
    gap: c(4, 3),
    minWidth: 0,
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
    maxWidth: '100%',
  },
  enrollmentsBtn: {
    paddingVertical: c(7, 6),
    paddingHorizontal: c(10, 9),
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  enrollmentsBtnText: {
    fontSize: c(11.5, 10.5),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  search: {
    zIndex: 1,
    marginTop: NU.sectionGap,
    height: c(44, 40),
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
    paddingHorizontal: NU.cardPad,
  },
  searchInput: {
    flex: 1,
    fontSize: NU.link,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
});
