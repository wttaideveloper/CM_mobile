import { ScrollView, StyleSheet, View } from 'react-native';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { LibraryBody } from '@/components/library/LibraryBody';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { LIB_BG, LIB_GREEN } from '@/components/library/libraryData';

export function LibraryScreen() {
  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={LIB_GREEN} />
      <StatusBarFill lightColor={LIB_GREEN} darkColor={LIB_GREEN} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <LibraryHeader />
        <LibraryBody />
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
