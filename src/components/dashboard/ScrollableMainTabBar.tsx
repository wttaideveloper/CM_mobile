import { useEffect, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabIcon } from '@/components/dashboard/DashboardIcons';

const TAB_ACTIVE = '#257d3f';
const TAB_INACTIVE = '#98d1a9';
const TAB_BORDER = '#d6ecd9';
const TAB_ICON_SIZE = 22;
/** First viewport shows exactly these many tabs edge-to-edge */
const VISIBLE_TABS = 5;

/** TEMP: hidden from bottom bar (Explore / Shop / Events / Me) */
const HIDDEN_TAB_ROUTES = new Set(['explore', 'shop', 'events', 'profile']);

type TabName =
  | 'home'
  | 'hwi'
  | 'market'
  | 'check-in'
  | 'coach'
  | 'explore'
  | 'shop'
  | 'events'
  | 'profile';

type TabRoute = {
  key: string;
  name: string;
  params?: object;
};

type ScrollableMainTabBarProps = {
  // Expo Tabs passes React Navigation bottom-tab props; keep loose for SDK typing.
  state: {
    index: number;
    routes: TabRoute[];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  descriptors: Record<string, { options: { title?: string; [key: string]: any } }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
  insets?: unknown;
};

function routeToTabName(routeName: string): TabName {
  switch (routeName) {
    case 'index':
      return 'home';
    case 'hwi':
      return 'hwi';
    case 'market':
      return 'market';
    case 'check-in':
      return 'check-in';
    case 'coach':
      return 'coach';
    case 'explore':
      return 'explore';
    case 'shop':
      return 'shop';
    case 'events':
      return 'events';
    case 'profile':
      return 'profile';
    default:
      return 'home';
  }
}

function labelForRoute(routeName: string, fallback: string): string {
  if (routeName === 'hwi') return 'HWI™';
  if (routeName === 'market') return 'Market';
  if (routeName === 'check-in') return 'Check-in';
  if (routeName === 'coach') return 'Coach';
  if (routeName === 'index') return 'Home';
  if (routeName === 'profile') return 'Me';
  return fallback;
}

export function ScrollableMainTabBar({
  state,
  descriptors,
  navigation,
}: ScrollableMainTabBarProps) {
  const { bottom } = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const tabWidth = screenWidth / VISIBLE_TABS;
  const paddingBottom = Math.max(bottom, 8);

  useEffect(() => {
    const visibleRoutes = state.routes.filter(
      (route) => !HIDDEN_TAB_ROUTES.has(route.name),
    );
    const visibleIndex = visibleRoutes.findIndex(
      (route) => route.key === state.routes[state.index]?.key,
    );
    const index = visibleIndex >= 0 ? visibleIndex : 0;
    if (index < VISIBLE_TABS) {
      scrollRef.current?.scrollTo({ x: 0, animated: true });
      return;
    }
    // Keep the focused tab in view when it's past the first five.
    const maxOffset = Math.max(0, (visibleRoutes.length - VISIBLE_TABS) * tabWidth);
    const target = Math.min(index * tabWidth - tabWidth * 2, maxOffset);
    scrollRef.current?.scrollTo({ x: Math.max(0, target), animated: true });
  }, [state.index, state.routes, tabWidth]);

  return (
    <View style={[styles.bar, { paddingBottom }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        snapToInterval={tabWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={styles.scrollContent}
      >
        {state.routes
          .filter((route) => !HIDDEN_TAB_ROUTES.has(route.name))
          .map((route: TabRoute) => {
          const index = state.routes.findIndex((r) => r.key === route.key);
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = labelForRoute(
            route.name,
            typeof options.title === 'string' ? options.title : route.name,
          );
          const tabName = routeToTabName(route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[
                styles.item,
                { width: tabWidth },
                focused ? styles.itemActive : styles.itemInactive,
              ]}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={label}
            >
              <TabIcon
                name={tabName}
                color={focused ? TAB_ACTIVE : TAB_INACTIVE}
                size={TAB_ICON_SIZE}
              />
              <Text
                style={[
                  styles.label,
                  focused ? styles.labelActive : styles.labelInactive,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: TAB_BORDER,
  },
  scrollContent: {
    alignItems: 'stretch',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 3,
  },
  itemActive: {
    borderTopColor: TAB_ACTIVE,
  },
  itemInactive: {
    borderTopColor: 'transparent',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  labelActive: {
    color: TAB_ACTIVE,
  },
  labelInactive: {
    color: TAB_INACTIVE,
  },
});
