import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';

import { OnboardingSlide } from '@/components/onboarding/OnboardingSlide';
import { ONBOARDING_SLIDES } from '@/constants/onboarding';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function OnboardingPagerScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList<typeof ONBOARDING_SLIDES[number]>>(null);

  const goToLogin = useCallback(() => {
    router.replace('/(auth)/login');
  }, [router]);

  const goToNext = useCallback((index: number) => {
    if (index >= ONBOARDING_SLIDES.length - 1) {
      goToLogin();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  }, [goToLogin]);

  const renderItem: ListRenderItem<typeof ONBOARDING_SLIDES[number]> = useCallback(
    ({ item, index }) => (
      <OnboardingSlide
        slide={item}
        slideIndex={index}
        totalSlides={ONBOARDING_SLIDES.length}
        isLast={index === ONBOARDING_SLIDES.length - 1}
        onContinue={() => goToNext(index)}
        onSkip={goToLogin}
      />
    ),
    [goToLogin, goToNext],
  );

  return (
    <View style={styles.container}>
      <AppStatusBar />
      <StatusBarFill />
      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
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
    backgroundColor: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
});
