import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { MarketBackIcon } from '@/components/market/MarketIcons';
import {
  ORDERS_GREEN,
  ORDERS_TEAL,
  type OrdersTab,
} from '@/components/market/marketOrdersData';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

type MarketOrdersHeaderProps = {
  activeTab: OrdersTab;
  onTabChange: (tab: OrdersTab) => void;
};

export function MarketOrdersHeader({
  activeTab,
  onTabChange,
}: MarketOrdersHeaderProps) {
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
          <Text style={styles.eyebrow}>Marketplace</Text>
          <Text style={styles.title}>Orders</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {(['Subscriptions', 'Past orders'] as const).map((tab) => {
          const active = tab === activeTab;
          return (
            <Pressable
              key={tab}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => onTabChange(tab)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
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
    backgroundColor: ORDERS_GREEN,
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
  tabs: {
    marginTop: NU.sectionGap,
    flexDirection: 'row',
    gap: c(8, 6),
    zIndex: 1,
  },
  tab: {
    paddingVertical: c(8, 6),
    paddingHorizontal: c(15, 12),
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: c(12.5, 11.5),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabTextActive: {
    fontWeight: '700',
    color: ORDERS_TEAL,
  },
});
