import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { ReadingBody } from '@/components/library/ReadingBody';
import { ReadingHeader } from '@/components/library/ReadingHeader';
import {
  LIB_BG,
  LIB_GREEN,
  getReadingContent,
} from '@/components/library/libraryData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

export function ReadingScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const scrollRef = useScrollToTopOnFocus();
  const content = getReadingContent(id);

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={LIB_GREEN} />
      <StatusBarFill lightColor={LIB_GREEN} darkColor={LIB_GREEN} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ReadingHeader content={content} />
        <ReadingBody content={content} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: LIB_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
});
