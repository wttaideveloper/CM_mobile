import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { MarketBackIcon } from '@/components/market/MarketIcons';
import {
  TRAINING_GREEN,
} from '@/components/market/marketTrainingData';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

type Props = {
  eyebrow: string;
  title: string;
  rightLabel?: string;
  onRightPress?: () => void;
};

export function MarketTrainingHeader({
  eyebrow,
  title,
  rightLabel,
  onRightPress,
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
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <MarketBackIcon />
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
        {rightLabel ? (
          <Pressable onPress={onRightPress} hitSlop={8} accessibilityRole="button">
            <Text style={styles.right}>{rightLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: TRAINING_GREEN,
    paddingHorizontal: NU.hPad,
    paddingTop: NU.headerPadTop,
    paddingBottom: NU.headerPadBottomTall,
    borderBottomLeftRadius: c(30, 26),
    borderBottomRightRadius: c(30, 26),
    overflow: 'hidden',
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NU.rowGap,
    zIndex: 1,
  },
  backBtn: {
    width: NU.iconBtn,
    height: NU.iconBtn,
    borderRadius: NU.iconBtnRadius,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
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
  right: {
    fontSize: NU.link,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
