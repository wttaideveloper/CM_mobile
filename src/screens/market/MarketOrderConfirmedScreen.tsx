import { Dimensions, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketOrderConfirmedBody } from '@/components/market/MarketOrderConfirmedBody';
import { MarketOrderConfirmedFooter } from '@/components/market/MarketOrderConfirmedFooter';
import { ORDER_CONFIRMED_GREEN } from '@/components/market/marketOrderConfirmedData';

const headerDeco = require('../../assets/images/order-confirmed-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

export function MarketOrderConfirmedScreen() {
  const scale = SCREEN_W / DESIGN_W;

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={ORDER_CONFIRMED_GREEN} />
      <StatusBarFill
        lightColor={ORDER_CONFIRMED_GREEN}
        darkColor={ORDER_CONFIRMED_GREEN}
      />

      <View style={[styles.decoWrap, { height: 300 * scale }]} pointerEvents="none">
        <Image
          source={headerDeco}
          style={{
            position: 'absolute',
            left: 0,
            top: -60 * scale,
            width: SCREEN_W,
            height: 460 * scale,
            opacity: 0.14,
          }}
          contentFit="fill"
          transition={0}
        />
        <LinearGradient
          colors={['rgba(37,125,63,0)', ORDER_CONFIRMED_GREEN]}
          style={styles.decoFade}
        />
      </View>

      <MarketOrderConfirmedBody />
      <MarketOrderConfirmedFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ORDER_CONFIRMED_GREEN,
  },
  decoWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    overflow: 'hidden',
  },
  decoFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
});
