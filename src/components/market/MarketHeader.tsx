import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import {
  MarketBackIcon,
  MarketBookmarkIcon,
  MarketCartIcon,
  MarketSearchIcon,
} from '@/components/market/MarketIcons';
import {
  MARKET_FILTERS,
  MARKET_GREEN,
  MARKET_TEAL,
} from '@/components/market/marketDashboardData';
import { useCartStore } from '@/stores/cart.store';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

type MarketHeaderProps = {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
};

export function MarketHeader({ activeFilter, onFilterChange }: MarketHeaderProps) {
  const router = useRouter();
  const scale = SCREEN_W / DESIGN_W;
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );

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
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(main)/(tabs)');
          }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Back"
          accessibilityHint="Returns to the previous screen"
        >
          <MarketBackIcon />
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Nearby & online</Text>
          <Text style={styles.title} accessibilityRole="header">
            Marketplace
          </Text>
        </View>
        <View style={styles.spacer} />
        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          onPress={() => router.push('/(main)/market/orders')}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Orders and subscriptions"
          accessibilityHint="Opens your orders"
        >
          <MarketBookmarkIcon />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          onPress={() => router.push('/(main)/market/cart')}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel={
            cartCount > 0 ? `Cart, ${cartCount} items` : 'Cart, empty'
          }
          accessibilityHint="Opens your cart"
        >
          <MarketCartIcon />
          {cartCount > 0 ? (
            <View style={styles.badge} importantForAccessibility="no-hide-descendants">
              <Text style={styles.badgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.search, pressed && styles.searchPressed]}
        onPress={() => router.push('/(main)/search-data')}
        accessibilityRole="button"
        accessibilityLabel="Search"
        accessibilityHint="Search businesses, products or services"
      >
        <MarketSearchIcon />
        <Text style={styles.searchText}>Businesses, products or services</Text>
      </Pressable>

      <View style={styles.filtersRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {MARKET_FILTERS.map((filter) => {
            const active = filter === activeFilter;
            return (
              <Pressable
                key={filter}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onFilterChange(filter)}
                accessibilityRole="button"
                accessibilityLabel={`Filter: ${filter}`}
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: MARKET_GREEN,
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
  iconBtn: {
    width: NU.iconBtn,
    height: NU.iconBtn,
    borderRadius: NU.iconBtnRadius,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  titleBlock: {
    flexShrink: 1,
  },
  spacer: {
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
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 99,
    backgroundColor: '#fdf0e3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: c(5, 4),
  },
  badgeText: {
    fontSize: c(10.5, 9.5),
    fontWeight: '800',
    color: '#8a5c17',
  },
  search: {
    marginTop: NU.sectionGap,
    height: c(44, 40),
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
    paddingHorizontal: NU.cardPad,
    zIndex: 1,
  },
  searchText: {
    fontSize: NU.link,
    color: 'rgba(255,255,255,0.8)',
  },
  searchPressed: {
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  filtersRow: {
    marginTop: NU.cardGap,
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    zIndex: 1,
  },
  filters: {
    flexDirection: 'row',
    gap: c(8, 6),
    paddingRight: c(4, 2),
  },
  chip: {
    paddingVertical: c(7, 5),
    paddingHorizontal: c(13, 11),
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  chipActive: {
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    fontSize: c(12.5, 11.5),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chipTextActive: {
    fontWeight: '700',
    color: MARKET_TEAL,
  },
});
