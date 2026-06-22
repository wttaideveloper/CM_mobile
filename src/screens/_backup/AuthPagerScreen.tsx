import { useCallback, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';

import { LoginScreen } from './LoginScreen';
import { OnboardingScreen } from './OnboardingScreen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type AuthPage = {
  key: 'onboarding' | 'login';
};

const PAGES: AuthPage[] = [{ key: 'onboarding' }, { key: 'login' }];

/**
 * Original splash → onboarding → login pager flow.
 * Swap `onboarding.tsx` to use this when the client wants login back in the flow.
 */
export function AuthPagerScreen() {
  const listRef = useRef<FlatList<AuthPage>>(null);

  const goToLogin = useCallback(() => {
    listRef.current?.scrollToIndex({ index: 1, animated: true });
  }, []);

  const renderItem: ListRenderItem<AuthPage> = useCallback(
    ({ item }) => (
      <View style={styles.page}>
        {item.key === 'onboarding' ? (
          <OnboardingScreen onNavigateToLogin={goToLogin} />
        ) : (
          <LoginScreen />
        )}
      </View>
    ),
    [goToLogin],
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        ref={listRef}
        data={PAGES}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
