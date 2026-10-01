import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { ProfileSettingsHeader } from '@/components/settings/ProfileSettingsHeader';
import { SettingsDashBody } from '@/components/settings/SettingsDashBody';
import {
  SETTINGS_BG,
  SETTINGS_GREEN,
} from '@/components/settings/settingsDashData';
import { useInsideTabLayout } from '@/hooks/useInsideTabLayout';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

export function ProfileSettingsScreen({
  showBack = true,
}: {
  showBack?: boolean;
}) {
  const scrollRef = useScrollToTopOnFocus();
  const { screenOffsetStyle } = useInsideTabLayout();
  const [toggles, setToggles] = useState({
    push: true,
    digest: true,
    provider: false,
    reminders: true,
  });

  return (
    <View style={[styles.screen, showBack ? null : screenOffsetStyle]}>
      {showBack ? (
        <>
          <AppStatusBar variant="light" backgroundColor={SETTINGS_GREEN} />
          <StatusBarFill lightColor={SETTINGS_GREEN} darkColor={SETTINGS_GREEN} />
        </>
      ) : null}
      <ProfileSettingsHeader showBack={showBack} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.content}
      >
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
