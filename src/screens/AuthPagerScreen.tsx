import { useCallback, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';

import { LoginScreen } from '@/screens/LoginScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AuthPage = {
  key: 'onboarding' | 'login';
};

const PAGES: AuthPage[] = [{ key: 'onboarding' }, { key: 'login' }];

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
    flex: 1,
  },
});
