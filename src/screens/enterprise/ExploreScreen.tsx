import { useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { EmptyState } from '@/components/EmptyState';
import { ExploreScreenSkeleton } from '@/components/ui/Skeleton.screens';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEnterprise } from '@/hooks/useEnterprises';
import { useDetailBack } from '@/hooks/useDetailBack';
import { useEnterpriseProducts } from '@/hooks/useProducts';
import { useEnterpriseServices } from '@/hooks/useServices';
import type { ServiceListItem } from '@/types/service.types';
import {
  formatLocationShort,
  formatMembersCount,
  formatYearsEstablished,
} from '@/utils/enterprise.mapper';
import {
  detailFromEnterpriseHref,
  exploreEnterpriseProductsHref,
  exploreEnterpriseServicesHref,
  exploreTabProductHref,
  exploreTabServiceHref,
} from '@/utils/searchNavigation';
import {
  EnterpriseServiceRow,
  ExploreHero,
  ExploreProfileSection,
  ExploreStatsAndActions,
  ExploreTabPanel,
  type DetailTab,
} from '@/screens/enterprise/ExploreScreenParts';
import { BODY_BG, HERO_BG, styles } from '@/screens/enterprise/ExploreScreen.styles';

export function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const goBack = useDetailBack();
  const { id, fromSearch } = useLocalSearchParams<{ id: string; fromSearch?: string }>();
  const enterpriseId = id ?? '';
  const openedFromSearch = fromSearch === '1';
  const [activeTab, setActiveTab] = useState<DetailTab>('about');
  const [activeAction, setActiveAction] = useState<'services' | 'products'>('services');
  const isInsideTabs = segments.some((segment) => segment === '(tabs)');
  const screenOffsetStyle = isInsideTabs ? { marginTop: -insets.top } : null;

  const { enterprise, isLoading, isError } = useEnterprise(enterpriseId);
  const {
    data: products = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useEnterpriseProducts(enterpriseId);
  const {
    data: services = [],
    isLoading: isServicesLoading,
    isError: isServicesError,
  } = useEnterpriseServices(enterpriseId);

  const openService = useCallback(
    (serviceId: string) => {
      router.push(
        openedFromSearch
          ? detailFromEnterpriseHref('/(main)/service', serviceId, enterpriseId, true)
          : exploreTabServiceHref(serviceId),
      );
    },
    [enterpriseId, openedFromSearch, router],
  );

  const openProduct = useCallback(
    (productId: string) => {
      router.push(
        openedFromSearch
          ? detailFromEnterpriseHref('/(main)/product', productId, enterpriseId, true)
          : exploreTabProductHref(productId),
      );
    },
    [enterpriseId, openedFromSearch, router],
  );

  const serviceListData = useMemo(() => {
    if (activeTab !== 'services') return [];
    if (isServicesLoading || isServicesError || services.length === 0) return [];
    return services;
  }, [activeTab, isServicesError, isServicesLoading, services]);

  const renderServiceItem = useCallback(
    ({ item }: { item: ServiceListItem }) => (
      <View style={styles.serviceListItem}>
        <EnterpriseServiceRow service={item} onPress={() => openService(item.id)} />
      </View>
    ),
    [openService],
  );

  const listHeader = useMemo(() => {
    if (!enterprise) return null;

    const logoLetter = enterprise.name === 'NA' ? '?' : enterprise.name.charAt(0).toUpperCase();
    const hasLogo = Boolean(enterprise.logoUrl);
    const ratingValue =
      enterprise.rating === 'NA' || enterprise.rating === '0' ? '0.0' : enterprise.rating;
    const locationShort = formatLocationShort(enterprise.location);
    const reviewCount = formatMembersCount(enterprise.members);
    const yearsEstablished = formatYearsEstablished(enterprise.yearFounded);

    return (
      <>
        <ExploreHero heroImage={enterprise.heroImage} onBack={goBack} />

        <View style={styles.content}>
          <ExploreProfileSection
            enterprise={enterprise}
            logoLetter={logoLetter}
            hasLogo={hasLogo}
            ratingValue={ratingValue}
            reviewCount={reviewCount}
            locationShort={locationShort}
          />

          <ExploreStatsAndActions
            membersCount={formatMembersCount(enterprise.members)}
            productsCount={products.length}
            servicesCount={services.length}
            yearsEstablished={yearsEstablished}
            activeAction={activeAction}
            onBookService={() => {
              setActiveAction('services');
              router.push(exploreEnterpriseServicesHref(enterpriseId, openedFromSearch));
            }}
            onShopProducts={() => {
              setActiveAction('products');
              router.push(exploreEnterpriseProductsHref(enterpriseId, openedFromSearch));
            }}
          />

          <ExploreTabPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            enterprise={enterprise}
            services={services}
            products={products}
            isServicesLoading={isServicesLoading}
            isServicesError={isServicesError}
            isProductsLoading={isProductsLoading}
            isProductsError={isProductsError}
            onServicePress={openService}
            onProductPress={openProduct}
            servicesAsListItems
          />
        </View>
      </>
    );
  }, [
    activeAction,
    activeTab,
    enterprise,
    enterpriseId,
    goBack,
    isProductsError,
    isProductsLoading,
    isServicesError,
    isServicesLoading,
    openProduct,
    openService,
    openedFromSearch,
    products,
    router,
    services,
  ]);

  if (isLoading) {
    return (
      <View style={[styles.screen, screenOffsetStyle]}>
        <AppStatusBar variant="light" backgroundColor={HERO_BG} />
        <StatusBarFill lightColor={HERO_BG} darkColor={HERO_BG} />
        <ExploreScreenSkeleton />
      </View>
    );
  }

  if (isError || !enterprise) {
    return (
      <View style={[styles.screen, styles.fallback, screenOffsetStyle]}>
        <AppStatusBar variant="light" backgroundColor={HERO_BG} />
        <StatusBarFill lightColor={HERO_BG} darkColor={HERO_BG} />
        <EmptyState
          variant="notFound"
          entity="enterprise"
          onAction={goBack}
          actionLabel="Go back"
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, screenOffsetStyle]}>
      <AppStatusBar variant="light" backgroundColor={HERO_BG} />
      <StatusBarFill lightColor={HERO_BG} darkColor={HERO_BG} />

      <FlatList
        data={serviceListData}
        keyExtractor={(item) => item.id}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          backgroundColor: BODY_BG,
          paddingBottom: insets.bottom + 24,
        }}
        ListHeaderComponent={listHeader}
        ItemSeparatorComponent={
          serviceListData.length > 0
            ? () => <View style={styles.serviceListSeparator} />
            : null
        }
        renderItem={renderServiceItem}
        extraData={activeTab}
      />
    </View>
  );
}
