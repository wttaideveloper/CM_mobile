import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CheckinBody } from '@/components/checkin/CheckinBody';
import { CheckinHeader } from '@/components/checkin/CheckinHeader';
import {
  CHECKIN_BG,
  CHECKIN_PRACTICES,
} from '@/components/checkin/checkinData';

function initialValues() {
  return Object.fromEntries(
    CHECKIN_PRACTICES.map((p) => [p.id, p.value]),
  ) as Record<string, number>;
}

export function CheckinScreen() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);

  const goalsMet = useMemo(
    () =>
      CHECKIN_PRACTICES.filter((p) => (values[p.id] ?? 0) >= p.goal).length,
    [values],
  );

  return (
    <View style={styles.screen}>
      <ScrollView
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
          onSave={() => router.push('/(main)/(tabs)/hwi')}
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
