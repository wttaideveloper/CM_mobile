import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { ChevronLeftIcon, SearchIcon } from '@/components/dashboard/DashboardIcons';
import { ServicesListPanel } from '@/components/services/ServicesListPanel';
import { SERVICE_CATEGORIES } from '@/constants/services';
import { useRouteSearchParam, useSyncedSearchState } from '@/hooks/useRouteSearchParam';
import { isFromSearchParam } from '@/utils/searchNavigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PRIMARY, styles, TEXT_MUTED } from '@/screens/shop/services/ServicesScreen.styles';

export { ServiceCard } from '@/components/services/ServiceCard';
export { ServicesListPanel } from '@/components/services/ServicesListPanel';

export function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const routeSearch = useRouteSearchParam();
  const { enterpriseId: rawEnterpriseId, fromSearch } = useLocalSearchParams<{
    enterpriseId?: string | string[];
    fromSearch?: string;
  }>();
  const openedFromSearch = isFromSearchParam(fromSearch);
  const enterpriseId = Array.isArray(rawEnterpriseId)
    ? rawEnterpriseId[0]
    : rawEnterpriseId;

  const { search, setSearch, debouncedSearch, setDebouncedSearch } =
    useSyncedSearchState(routeSearch);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <StatusBarFill />

      <View style={[styles.topSection, { paddingTop: 12 }]}>
        <View style={styles.headerRow}>
          {openedFromSearch ? (
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [styles.backBtn, pressed && styles.cardPressed]}
              hitSlop={8}
            >
              <ChevronLeftIcon size={22} color={PRIMARY} />
            </Pressable>
          ) : null}
          <Text style={styles.title}>Services</Text>
        </View>

        <View style={styles.searchWrap}>
          <SearchIcon size={18} color={TEXT_MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor={TEXT_MUTED}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
            onSubmitEditing={() => setDebouncedSearch(search.trim())}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {SERVICE_CATEGORIES.map((category) => {
            const isActive = activeCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() =>
                  setActiveCategory((current) => (current === category ? 'All' : category))
                }
                accessibilityRole="button"
                accessibilityLabel={category}
                accessibilityState={{ selected: isActive }}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              >
                <Text
                  style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ServicesListPanel
        enterpriseId={enterpriseId}
        search={search}
        debouncedSearch={debouncedSearch}
        onDebouncedSearchChange={setDebouncedSearch}
        activeCategory={activeCategory}
        bottomInset={insets.bottom}
        fromSearch={openedFromSearch}
      />
    </View>
  );
}
