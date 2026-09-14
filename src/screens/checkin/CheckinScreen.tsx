import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { CheckinBody } from '@/components/checkin/CheckinBody';
import { CheckinHeader } from '@/components/checkin/CheckinHeader';
import {
  CHECKIN_BG,
  CHECKIN_GREEN,
  CHECKIN_PRACTICES,
} from '@/components/checkin/checkinData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

function initialValues() {
  return Object.fromEntries(
    CHECKIN_PRACTICES.map((p) => [p.id, p.value]),
  ) as Record<string, number>;
}

export function CheckinScreen() {
  const router = useRouter();
  const scrollRef = useScrollToTopOnFocus();
  const [values, setValues] = useState(initialValues);

  const goalsMet = useMemo(
    () =>
      CHECKIN_PRACTICES.filter((p) => (values[p.id] ?? 0) >= p.goal).length,
    [values],
  );

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={CHECKIN_GREEN} />
      <StatusBarFill lightColor={CHECKIN_GREEN} darkColor={CHECKIN_GREEN} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <CheckinHeader
          goalsMet={goalsMet}
          goalsTotal={CHECKIN_PRACTICES.length}
        />
        <CheckinBody
          values={values}
          onChange={(id, value) =>
            setValues((prev) => ({ ...prev, [id]: value }))
          }
          onSave={() => router.replace('/(main)/hwi')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CHECKIN_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
});
