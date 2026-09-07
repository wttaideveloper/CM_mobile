import { Tabs, usePathname, useSegments } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  AppStatusBar,
  StatusBarFill,
  useStatusBarBackground,
} from '@/components/AppStatusBar';
import { ScrollableMainTabBar } from '@/components/dashboard/ScrollableMainTabBar';
import { isNestedExploreRoute } from '@/hooks/useInsideTabLayout';

const HOME_STATUS_BAR = '#257d3f';
// TEMP: unused while Explore / Events tabs are hidden
// const EVENTS_TAB_ROOT = '/(main)/(tabs)/events' as const;
// const EXPLORE_TAB_ROOT = '/(main)/(tabs)/explore' as const;

export default function MainTabLayout() {
  const segments = useSegments();
  const pathname = usePathname();
  const statusBarBg = useStatusBarBackground();
  const hideTabBar = isNestedExploreRoute(segments);
  const isGreenHeroTab =
    pathname === '/' ||
    pathname === '/hwi' ||
    pathname.endsWith('/hwi') ||
    pathname === '/market' ||
    pathname.endsWith('/market') ||
    pathname === '/check-in' ||
    pathname.endsWith('/check-in') ||
    pathname === '/coach' ||
    pathname.endsWith('/coach');
  const heroStatusBar = HOME_STATUS_BAR;

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: isGreenHeroTab ? heroStatusBar : statusBarBg },
      ]}
    >
      {isGreenHeroTab ? (
        <>
          <AppStatusBar variant="light" backgroundColor={heroStatusBar} />
          <StatusBarFill lightColor={heroStatusBar} darkColor={heroStatusBar} />
        </>
      ) : (
        <>
          <AppStatusBar />
          <StatusBarFill />
        </>
      )}

      <Tabs
        tabBar={(props) =>
          hideTabBar ? null : (
            <ScrollableMainTabBar
              state={props.state}
              descriptors={props.descriptors}
              navigation={props.navigation}
              insets={props.insets}
            />
          )
        }
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="hwi"
          options={{
            title: 'HWI™',
          }}
        />
        <Tabs.Screen
          name="market"
          options={{
            title: 'Market',
          }}
        />
        <Tabs.Screen
          name="check-in"
          options={{
            title: 'Check-in',
          }}
        />
        <Tabs.Screen
          name="coach"
          options={{
            title: 'Coach',
          }}
        />
        {/* TEMP: hide Explore / Shop / Events / Me from bottom tabs (keep routes)
        <Tabs.Screen
          name="explore"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.replace(EXPLORE_TAB_ROOT);
            },
          }}
          options={{
            title: 'Explore',
          }}
        />
        <Tabs.Screen
          name="shop"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.replace('/(main)/(tabs)/shop');
            },
          }}
          options={{
            title: 'Shop',
          }}
        />
        <Tabs.Screen
          name="events"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.replace(EVENTS_TAB_ROOT);
            },
          }}
          options={{
            title: 'Events',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Me',
          }}
        />
        */}
        <Tabs.Screen name="explore" options={{ href: null }} />
        <Tabs.Screen name="shop" options={{ href: null }} />
        <Tabs.Screen name="events" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
