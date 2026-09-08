import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { CourseLearningBody } from '@/components/market/CourseLearningBody';
import { CourseLearningHeader } from '@/components/market/CourseLearningHeader';
import { COURSE_BG, COURSE_GREEN } from '@/components/market/courseLearningData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

export function CourseLearningScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useScrollToTopOnFocus();

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={COURSE_GREEN} />
      <StatusBarFill lightColor={COURSE_GREEN} darkColor={COURSE_GREEN} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <CourseLearningHeader />
        <CourseLearningBody />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COURSE_BG,
  },
  scroll: {
    flex: 1,
  },
});
