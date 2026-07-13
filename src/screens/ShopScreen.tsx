import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInput as TextInputType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FunnelIcon, MapPinIcon, MessageSquareIcon, SearchIcon } from '@/components/dashboard/DashboardIcons';
import { useRouteSearchParam, useSyncedSearchState } from '@/hooks/useRouteSearchParam';
import { PRODUCT_CATEGORIES } from '@/constants/products';
import { SERVICE_CATEGORIES } from '@/constants/services';
import { ProductsListPanel } from '@/screens/ProductsScreen';
import { ServicesListPanel } from '@/screens/ServicesScreen';
import { chatInboxHref } from '@/utils/chatNavigation';
import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const BODY_BG = '#F5F7F5';
const HEADER_BG = '#FFFFFF';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const SEARCH_BORDER = '#E0E7E1';
const H_PAD = isSmallDevice ? 16 : 20;

type ShopTab = 'services' | 'products';

function ShopTabBar({
  activeTab,
  onChange,
}: {
  activeTab: ShopTab;
  onChange: (tab: ShopTab) => void;
}) {
  return (
    <View style={styles.tabBar}>
      {(['services', 'products'] as const).map((tab) => {
        const isActive = activeTab === tab;
        const label = tab === 'services' ? 'Services' : 'Products';

        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
          >
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ShopScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const routeSearch = useRouteSearchParam();
  const {
    enterpriseId: rawEnterpriseId,
    tab: rawTab,
  } = useLocalSearchParams<{
    enterpriseId?: string | string[];
    tab?: string | string[];
  }>();

  const enterpriseId = Array.isArray(rawEnterpriseId)
    ? rawEnterpriseId[0]
    : rawEnterpriseId;
  const tabParam = Array.isArray(rawTab) ? rawTab[0] : rawTab;

  const [activeTab, setActiveTab] = useState<ShopTab>(
    tabParam === 'products' ? 'products' : 'services',
  );

  useEffect(() => {
    if (tabParam === 'products' || tabParam === 'services') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const categories = useMemo(
    () => (activeTab === 'services' ? SERVICE_CATEGORIES : PRODUCT_CATEGORIES),
    [activeTab],
  );

  const { search, setSearch, debouncedSearch, setDebouncedSearch } =
    useSyncedSearchState(routeSearch);
  const [activeCategory, setActiveCategory] = useState('All');
  const searchInputRef = useRef<TextInputType>(null);
  const previousTabRef = useRef(activeTab);

  const handleDebouncedSearchChange = useCallback((value: string) => {
    setDebouncedSearch(value);
  }, [setDebouncedSearch]);

  useEffect(() => {
    if (previousTabRef.current === activeTab) {
      return;
    }

    previousTabRef.current = activeTab;
    setActiveCategory('All');
    setSearch('');
    setDebouncedSearch('');
  }, [activeTab, setDebouncedSearch, setSearch]);

  const searchPlaceholder =
    activeTab === 'services' ? 'Search services...' : 'Search products...';

  return (
    <View style={styles.screen}>
      <View style={[styles.topSection, { paddingTop: 12 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Shop</Text>
          {activeTab === 'services' ? (
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => router.push(chatInboxHref())}
                style={({ pressed }) => [styles.headerIconBtn, styles.chatIconBtn, pressed && styles.pressed]}
                hitSlop={8}
                accessibilityLabel="Open chats"
              >
                <MessageSquareIcon size={20} color={PRIMARY} />
              </Pressable>
              <Pressable style={({ pressed }) => [styles.nearMeBtn, pressed && styles.pressed]}>
                <MapPinIcon size={14} color={PRIMARY} />
                <Text style={styles.nearMeText}>Near Me</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => searchInputRef.current?.focus()}
                style={({ pressed }) => [styles.headerIconBtn, styles.searchIconBtn, pressed && styles.pressed]}
                hitSlop={6}
              >
                <SearchIcon size={18} color={TEXT_MUTED} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.headerIconBtn, styles.filterBtn, pressed && styles.pressed]}
                hitSlop={6}
              >
                <FunnelIcon size={16} color={PRIMARY} />
              </Pressable>
            </View>
          )}
        </View>

        <ShopTabBar activeTab={activeTab} onChange={setActiveTab} />

        <View style={styles.searchWrap}>
          <SearchIcon size={18} color={TEXT_MUTED} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder={searchPlaceholder}
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
          {categories.map((category) => {
            const isActive = activeCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() =>
                  setActiveCategory((current) => (current === category ? 'All' : category))
                }
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.listArea}>
        {activeTab === 'services' ? (
          <ServicesListPanel
            enterpriseId={enterpriseId}
            search={search}
            debouncedSearch={debouncedSearch}
            onDebouncedSearchChange={handleDebouncedSearchChange}
            activeCategory={activeCategory}
            bottomInset={insets.bottom}
          />
        ) : (
          <ProductsListPanel
            enterpriseId={enterpriseId}
            search={search}
            debouncedSearch={debouncedSearch}
            onDebouncedSearchChange={handleDebouncedSearchChange}
            activeCategory={activeCategory}
            bottomInset={insets.bottom}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  topSection: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: isSmallDevice ? 16 : H_PAD,
    paddingBottom: isSmallDevice ? 4 : 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EDEA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 12 : 14,
  },
  title: {
    fontSize: isSmallDevice ? 18 : 22,
    lineHeight: 34,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  nearMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: MINT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  nearMeText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: isSmallDevice ? 34 : 38,
    height: isSmallDevice ? 34 : 38,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconBtn: {
    backgroundColor: '#F1F5F3',
  },
  filterBtn: {
    backgroundColor: MINT,
  },
  chatIconBtn: {
    backgroundColor: MINT,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: MINT,
    borderRadius: 14,
    padding: 4,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? 9 : 10,
    borderRadius: 11,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    ...shadowSm,
  },
  tabLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: PRIMARY,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(245, 247, 246)',
    borderRadius: isSmallDevice ? 16 : 18,
    borderWidth: 1,
    borderColor: SEARCH_BORDER,
    paddingHorizontal: isSmallDevice ? 12 : 16,
    height: isSmallDevice ? 40 : 48,
    marginBottom: isSmallDevice ? 12 : 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    color: TEXT_BLACK,
    paddingVertical: 0,
  },
  categoriesScroll: {
    gap: isSmallDevice ? 6 : 8,
    paddingBottom: isSmallDevice ? 12 : 14,
  },
  categoryChip: {
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingVertical: isSmallDevice ? 4 : 5,
    borderRadius: 20,
    backgroundColor: '#EEF2EF',
  },
  categoryChipActive: {
    backgroundColor: PRIMARY,
  },
  categoryChipText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.85,
  },
  listArea: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
});
