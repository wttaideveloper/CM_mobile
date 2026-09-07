import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInput as TextInputType,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FunnelIcon, MapPinIcon, MessageSquareIcon, SearchIcon, ShoppingCartIcon } from '@/components/dashboard/DashboardIcons';
import { useCart } from '@/hooks/useCart';
import { useRouteSearchParam, useSyncedSearchState } from '@/hooks/useRouteSearchParam';
import { PRODUCT_CATEGORIES } from '@/constants/products';
import { SERVICE_CATEGORIES } from '@/constants/services';
import { ProductsListPanel } from '@/screens/shop/products/ProductsScreen';
import { PRIMARY, styles, TEXT_MUTED } from '@/screens/shop/ShopScreen.styles';
import { ServicesListPanel } from '@/screens/shop/services/ServicesScreen';
import { useCartStore } from '@/stores/cart.store';
import { chatInboxHref } from '@/utils/chatNavigation';

type ShopTab = 'services' | 'products';

function ShopTabBar({
  activeTab,
  onChange,
}: {
  activeTab: ShopTab;
  onChange: (tab: ShopTab) => void;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.tabBar}>
      {(['services', 'products'] as const).map((tab) => {
        const isActive = activeTab === tab;
        const label = tab === 'services' ? t('shop.services') : t('shop.products');

        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
          >
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ShopScreen() {
  const { t } = useTranslation();
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
  useCart();
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const cartBadge = cartCount > 99 ? '99+' : String(cartCount);

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
    activeTab === 'services' ? t('shop.searchServices') : t('shop.searchProducts');

  return (
    <View style={styles.screen}>
      <View style={[styles.topSection, { paddingTop: 12 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('shop.title')}</Text>
          {activeTab === 'services' ? (
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => router.push(chatInboxHref())}
                style={({ pressed }) => [styles.headerIconBtn, styles.chatIconBtn, pressed && styles.pressed]}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('shop.openChats')}
              >
                <MessageSquareIcon size={20} color={PRIMARY} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.nearMeBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={t('shop.nearMe')}
              >
                <MapPinIcon size={14} color={PRIMARY} />
                <Text style={styles.nearMeText}>{t('shop.nearMe')}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => router.push('/(main)/checkout/cart')}
                style={({ pressed }) => [styles.headerIconBtn, styles.cartIconBtn, pressed && styles.pressed]}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Open cart"
              >
                <ShoppingCartIcon size={18} color={PRIMARY} />
                {cartCount > 0 ? (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartBadge}</Text>
                  </View>
                ) : null}
              </Pressable>
              <Pressable
                onPress={() => searchInputRef.current?.focus()}
                style={({ pressed }) => [styles.headerIconBtn, styles.searchIconBtn, pressed && styles.pressed]}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={t('shop.focusSearch')}
              >
                <SearchIcon size={18} color={TEXT_MUTED} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.headerIconBtn, styles.filterBtn, pressed && styles.pressed]}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={t('shop.filterProducts')}
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
            accessibilityLabel={searchPlaceholder}
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
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={t('shop.categoryA11y', { name: category })}
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
