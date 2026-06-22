import { Tabs, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabIcon } from '@/components/dashboard/DashboardIcons';

const TAB_ACTIVE = '#1F5D4E';
const TAB_INACTIVE = '#9CA3AF';
const TAB_ICON_SIZE = 20;
const TAB_BAR_CONTENT_HEIGHT = 58;
const EVENTS_TAB_ROOT = '/(main)/(tabs)/events' as const;
const EXPLORE_TAB_ROOT = '/(main)/(tabs)/explore' as const;

export default function MainTabLayout() {
  const { bottom } = useSafeAreaInsets();
  const tabBarPaddingBottom = bottom > 0 ? bottom + 4 : 10;

  const defaultTabBarStyle = {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EDEA',
    height: TAB_BAR_CONTENT_HEIGHT + tabBarPaddingBottom,
    paddingTop: 10,
    paddingBottom: tabBarPaddingBottom,
    paddingHorizontal: 4,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarStyle: defaultTabBarStyle,
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="home"
              color={focused ? TAB_ACTIVE : TAB_INACTIVE}
              size={TAB_ICON_SIZE}
            />
          ),
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
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="explore"
              color={focused ? TAB_ACTIVE : TAB_INACTIVE}
              size={TAB_ICON_SIZE}
            />
          ),
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
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="shop"
              color={focused ? TAB_ACTIVE : TAB_INACTIVE}
              size={TAB_ICON_SIZE}
            />
          ),
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
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="events"
              color={focused ? TAB_ACTIVE : TAB_INACTIVE}
              size={TAB_ICON_SIZE}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="profile"
              color={focused ? TAB_ACTIVE : TAB_INACTIVE}
              size={TAB_ICON_SIZE}
            />
          ),
        }}
      />
    </Tabs>
  );
}
