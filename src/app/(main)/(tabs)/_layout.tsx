import { Tabs, router, useSegments } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppStatusBar,
  StatusBarFill,
  useStatusBarBackground,
} from '@/components/AppStatusBar';
import { isNestedExploreRoute } from '@/hooks/useInsideTabLayout';
import { TabIcon } from '@/components/dashboard/DashboardIcons';

const TAB_ACTIVE = '#1F5D4E';
const TAB_INACTIVE = '#9CA3AF';
const TAB_ACTIVE_BG = '#EAF4EC';
const TAB_ICON_SIZE = 20;
const TAB_BAR_CONTENT_HEIGHT = 58;
const EVENTS_TAB_ROOT = '/(main)/(tabs)/events' as const;
const EXPLORE_TAB_ROOT = '/(main)/(tabs)/explore' as const;

type TabName = 'home' | 'explore' | 'shop' | 'events' | 'profile';

function TabBarIcon({ name, focused }: { name: TabName; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <TabIcon
        name={name}
        color={focused ? TAB_ACTIVE : TAB_INACTIVE}
        size={TAB_ICON_SIZE}
      />
    </View>
  );
}

function TabBarLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.label, focused ? styles.labelActive : styles.labelInactive]}>
      {label}
    </Text>
  );
}

export default function MainTabLayout() {
  const { bottom } = useSafeAreaInsets();
  const segments = useSegments();
  const statusBarBg = useStatusBarBackground();
  const tabBarPaddingBottom = bottom > 0 ? bottom + 4 : 10;
  const hideTabBar = isNestedExploreRoute(segments);

  const defaultTabBarStyle = {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EDEA',
    height: TAB_BAR_CONTENT_HEIGHT + tabBarPaddingBottom,
    paddingTop: 8,
    paddingBottom: tabBarPaddingBottom,
    paddingHorizontal: 4,
    display: hideTabBar ? ('none' as const) : ('flex' as const),
  };

  return (
    <View style={[styles.root, { backgroundColor: statusBarBg }]}>
      <AppStatusBar />
      <StatusBarFill />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: TAB_ACTIVE,
          tabBarInactiveTintColor: TAB_INACTIVE,
          tabBarStyle: defaultTabBarStyle,
          tabBarItemStyle: {
            paddingVertical: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <TabBarIcon name="home" focused={focused} />,
            tabBarLabel: ({ focused }) => <TabBarLabel label="Home" focused={focused} />,
          }}
        />
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
            tabBarIcon: ({ focused }) => <TabBarIcon name="explore" focused={focused} />,
            tabBarLabel: ({ focused }) => <TabBarLabel label="Explore" focused={focused} />,
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
            tabBarIcon: ({ focused }) => <TabBarIcon name="shop" focused={focused} />,
            tabBarLabel: ({ focused }) => <TabBarLabel label="Shop" focused={focused} />,
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
            tabBarIcon: ({ focused }) => <TabBarIcon name="events" focused={focused} />,
            tabBarLabel: ({ focused }) => <TabBarLabel label="Events" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Me',
            tabBarIcon: ({ focused }) => <TabBarIcon name="profile" focused={focused} />,
            tabBarLabel: ({ focused }) => <TabBarLabel label="Me" focused={focused} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: TAB_ACTIVE_BG,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
  labelActive: {
    color: TAB_ACTIVE,
    fontWeight: '700',
  },
  labelInactive: {
    color: TAB_INACTIVE,
    fontWeight: '500',
  },
});
