import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { MarketBackIcon } from '@/components/market/MarketIcons';
import { SETTINGS_GREEN } from '@/components/settings/settingsDashData';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

type Props = {
  showBack?: boolean;
};

export function ProfileSettingsHeader({ showBack = true }: Props) {
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
        {showBack ? (
          <Pressable
            style={styles.iconBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <MarketBackIcon />
          </Pressable>
        ) : null}
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Account</Text>
          <Text style={styles.title}>Profile & settings</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: SETTINGS_GREEN,
    paddingHorizontal: NU.hPad,
    paddingTop: 0,
    paddingBottom: NU.headerPadBottom,
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
  iconBtn: {
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
});
