import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { SettingsDashBody } from '@/components/settings/SettingsDashBody';
import { SettingsDashHeader } from '@/components/settings/SettingsDashHeader';
import {
  SETTINGS_BG,
  SETTINGS_GREEN,
} from '@/components/settings/settingsDashData';

export function SettingsDashScreen() {
  const [toggles, setToggles] = useState({
    push: true,
    digest: true,
    provider: false,
    reminders: true,
  });

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={SETTINGS_GREEN} />
      <StatusBarFill lightColor={SETTINGS_GREEN} darkColor={SETTINGS_GREEN} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <SettingsDashHeader />
        <SettingsDashBody
          toggles={toggles}
          onToggle={(key) =>
            setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
          }
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SETTINGS_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
});
