import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SearchIcon } from '@/components/dashboard/DashboardIcons';
import { HOME_SEARCH_ICON_SIZE } from '@/components/home/homeData';
import { homePartsStyles as styles } from '@/components/home/homePartsStyles';

export function HomeSearchBar() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/(main)/search-data')}
      style={({ pressed }) => [styles.searchBar, pressed && styles.pressed]}
      accessibilityRole="search"
      accessibilityLabel={t('home.searchA11y')}
    >
      <SearchIcon size={HOME_SEARCH_ICON_SIZE} color="rgba(255,255,255,0.55)" />
      <Text style={styles.searchPlaceholder}>{t('home.searchPlaceholder')}</Text>
    </Pressable>
  );
}
