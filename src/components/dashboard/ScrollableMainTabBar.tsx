import { useEffect, useMemo, useRef } from 'react';
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

type TabName =
  | 'home'
  | 'enterprises'
  | 'hwi'
  | 'market'
  | 'events-training'
  | 'me'
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
  descriptors: Record<string, { options: { title?: string; href?: string | null; [key: string]: any } }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
  insets?: unknown;
};

function routeToTabName(routeName: string): TabName {
  switch (routeName) {
    case 'index':
      return 'home';
    case 'enterprises':
      return 'enterprises';
    case 'hwi':
      return 'hwi';
    case 'market':
      return 'market';
    case 'events-training':
      return 'events-training';
    case 'me':
      return 'me';
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
  if (routeName === 'enterprises') return 'Enterprise';
  if (routeName === 'events-training') return 'Events & Training';
  if (routeName === 'me') return 'Me';
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
  const visibleRoutes = useMemo(
    () =>
      state.routes.filter((route) => {
        const href = descriptors[route.key]?.options?.href;
        return href !== null;
      }),
    [descriptors, state.routes],
  );
  const tabWidth = screenWidth / VISIBLE_TABS;
  const paddingBottom = Math.max(bottom, 8);

  useEffect(() => {
    const focusedRoute = state.routes[state.index];
    const visibleIndex = visibleRoutes.findIndex(
      (route) => route.key === focusedRoute?.key,
    );
    if (visibleIndex < 0) return;
    if (visibleIndex < VISIBLE_TABS) {
      scrollRef.current?.scrollTo({ x: 0, animated: true });
      return;
    }
    const maxOffset = Math.max(
      0,
      (visibleRoutes.length - VISIBLE_TABS) * tabWidth,
    );
    const target = Math.min(visibleIndex * tabWidth - tabWidth * 2, maxOffset);
    scrollRef.current?.scrollTo({ x: Math.max(0, target), animated: true });
  }, [state.index, state.routes, tabWidth, visibleRoutes]);

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
        {visibleRoutes.map((route: TabRoute) => {
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
