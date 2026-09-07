import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { LoginScreen } from '@/screens/auth/LoginScreen';
import { OnboardingScreen } from '@/screens/auth/OnboardingScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AuthPage = {
  key: 'onboarding' | 'login';
};

const PAGES: AuthPage[] = [{ key: 'onboarding' }, { key: 'login' }];

export function AuthPagerScreen() {
  const listRef = useRef<FlatList<AuthPage>>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const goToLogin = useCallback(() => {
    listRef.current?.scrollToIndex({ index: 1, animated: true });
    setPageIndex(1);
  }, []);

  const handleKeyboardVisibilityChange = useCallback((isOpen: boolean) => {
    setIsKeyboardOpen(isOpen);
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setPageIndex(nextIndex);
    },
    [],
  );

  // Lock horizontal swipe while typing on login, or once on the login page
  // so the form cannot be dragged back to onboarding by accident.
  const canSwipeHorizontally = pageIndex === 0 && !isKeyboardOpen;

  const renderItem: ListRenderItem<AuthPage> = useCallback(
    ({ item }) => (
      <View style={styles.page}>
        {item.key === 'onboarding' ? (
          <OnboardingScreen onNavigateToLogin={goToLogin} />
        ) : (
          <LoginScreen onKeyboardVisibilityChange={handleKeyboardVisibilityChange} />
        )}
      </View>
    ),
    [goToLogin, handleKeyboardVisibilityChange],
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
        scrollEnabled={canSwipeHorizontally}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
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
