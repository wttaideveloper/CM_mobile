import { Dimensions, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';

import { MarketSearchIcon } from '@/components/market/MarketIcons';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

export const ENTERPRISES_TAB_GREEN = '#257d3f';
export const ENTERPRISES_TAB_TEAL = '#164744';
export const ENTERPRISES_TAB_MUTED = '#7c9585';
export const ENTERPRISES_TAB_BORDER = '#dbeadd';
export const ENTERPRISES_TAB_BG = '#f2fff3';
export const ENTERPRISES_TAB_TRACK = '#eef4ee';

type EnterprisesTabHeaderProps = {
  count: number;
  search: string;
  onSearchChange: (text: string) => void;
};

export function EnterprisesTabHeader({
  count,
  search,
  onSearchChange,
}: EnterprisesTabHeaderProps) {
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
        <Text style={styles.eyebrow}>Directory</Text>
        <Text style={styles.title}>Enterprises</Text>
      </View>

      <View style={styles.search}>
        <MarketSearchIcon />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search name, category, location"
          placeholderTextColor="rgba(255,255,255,0.55)"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          accessibilityLabel="Search enterprises"
        />
      </View>

      <Text style={styles.count}>
        {count} {count === 1 ? 'enterprise' : 'enterprises'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: ENTERPRISES_TAB_GREEN,
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
  searchInput: {
    flex: 1,
    fontSize: NU.link,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  count: {
    marginTop: NU.cardGap,
    fontSize: c(12.5, 11.5),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    zIndex: 1,
  },
});
