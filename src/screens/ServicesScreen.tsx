import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { EmptyState } from '@/components/EmptyState';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { ChevronLeftIcon, ClockIcon, MessageSquareIcon, SearchIcon, UsersIcon } from '@/components/dashboard/DashboardIcons';
import { SERVICE_CATEGORIES } from '@/constants/services';
import { useEnterprises } from '@/hooks/useEnterprises';
import { serviceKeys, useInfiniteServices } from '@/hooks/useServices';
import { SERVICE_FILTER_PAGE_SIZE } from '@/services/service.service';
import type { ServiceListItem, ServiceListQuery } from '@/types/service.types';
import { formatServicePrice } from '@/utils/service.mapper';
import { useRouteSearchParam, useSyncedSearchState } from '@/hooks/useRouteSearchParam';
import { detailFromEnterpriseHref, detailHref, exploreTabServiceHref, isFromSearchParam } from '@/utils/searchNavigation';
import { useOpenServiceChat } from '@/hooks/useOpenServiceChat';
import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';
import { serviceService } from '@/services/service.service';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const BODY_BG = '#F5F7F5';
const HEADER_BG = '#FFFFFF';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const SEARCH_BORDER = '#E0E7E1';
const H_PAD = isSmallDevice ? 16 : 20;
const SEARCH_DEBOUNCE_MS = 400;

function providerInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

export function ServiceCard({
  service,
  fromSearch,
  fromEnterpriseId,
}: {
  service: ServiceListItem;
  enterpriseNameById?: Record<string, string>;
  fromSearch?: boolean;
  fromEnterpriseId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openServiceChat, isOpeningChat } = useOpenServiceChat();
  const hasProvider = Boolean(service.provider);

  const openDetail = () => {
    void queryClient.prefetchQuery({
      queryKey: serviceKeys.detail(service.id),
      queryFn: () => serviceService.getById(service.id),
    });

    if (fromEnterpriseId) {
      router.push(
        fromSearch
          ? detailFromEnterpriseHref('/(main)/service', service.id, fromEnterpriseId, true)
          : exploreTabServiceHref(service.id),
      );
      return;
    }

    router.push(detailHref('/(main)/service', service.id, fromSearch));
  };

  const openChat = () => {
    void openServiceChat(service);
  };

  return (
    <View style={styles.serviceCard}>
      <Pressable
        onPress={openDetail}
        style={({ pressed }) => [styles.thumbPressable, pressed && styles.cardPressed]}
      >
        <Image source={{ uri: service.image }} style={styles.thumb} contentFit="cover" />
      </Pressable>

      <View style={styles.cardBody}>
        <Pressable
          onPress={openDetail}
          style={({ pressed }) => [pressed && styles.cardPressed]}
        >
          <View style={[styles.titleRow, !hasProvider && styles.titleRowCompact]}>
            <Text style={styles.serviceName} numberOfLines={2}>
              {service.name}
            </Text>
            <View style={styles.priceBlock}>
              <Text style={styles.servicePrice}>{formatServicePrice(service.price)}</Text>
              <Text style={styles.serviceUnit}>{service.unit}</Text>
            </View>
          </View>

          {hasProvider && service.provider ? (
            <View style={styles.providerRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{providerInitial(service.provider)}</Text>
              </View>
              <Text style={styles.providerName} numberOfLines={1}>
                {service.provider}
              </Text>
            </View>
          ) : null}
        </Pressable>

        <View style={styles.metaRow}>
          <Pressable
            onPress={openDetail}
            style={({ pressed }) => [styles.metaItems, pressed && styles.cardPressed]}
          >
            {service.category !== 'NA' ? (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{service.category}</Text>
              </View>
            ) : null}
            {service.duration !== 'NA' ? (
              <View style={styles.metaItem}>
                <ClockIcon size={12} color={TEXT_MUTED} />
                <Text style={styles.metaText}>{service.duration}</Text>
              </View>
            ) : null}
            {service.maxParticipants != null && service.maxParticipants > 0 ? (
              <View style={styles.metaItem}>
                <UsersIcon size={12} color={TEXT_MUTED} />
                <Text style={styles.metaText}>{service.maxParticipants}</Text>
              </View>
            ) : null}
          </Pressable>

          <Pressable
            onPress={openChat}
            disabled={isOpeningChat}
            style={({ pressed }) => [
              styles.chatBtn,
              pressed && styles.cardPressed,
              isOpeningChat && styles.chatBtnDisabled,
            ]}
            hitSlop={4}
          >
            {isOpeningChat ? (
              <ActivityIndicator size="small" color={PRIMARY} />
            ) : (
              <>
                <MessageSquareIcon size={14} color={PRIMARY} />
                <Text style={styles.chatBtnText}>Chat</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

type ServicesListPanelProps = {
  enterpriseId?: string;
  search: string;
  debouncedSearch: string;
  onDebouncedSearchChange: (value: string) => void;
  activeCategory: string;
  bottomInset: number;
  fromSearch?: boolean;
};

export function ServicesListPanel({
  enterpriseId,
  search,
  debouncedSearch,
  onDebouncedSearchChange,
  activeCategory,
  bottomInset,
  fromSearch,
}: ServicesListPanelProps) {
  const listRef = useRef<FlatList<ServiceListItem>>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDebouncedSearchChange(search.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, onDebouncedSearchChange]);

  const apiQuery = useMemo((): ServiceListQuery => {
    const hasSearch = debouncedSearch.length > 0;
    const hasCategory = activeCategory !== 'All';
    const hasEnterprise = Boolean(enterpriseId);
    const isFiltered = hasSearch || hasCategory || hasEnterprise;

    const query: ServiceListQuery = {
      page_size: isFiltered ? SERVICE_FILTER_PAGE_SIZE : undefined,
    };

    if (hasEnterprise && enterpriseId) {
      query.enterprise_id = enterpriseId;
    }

    if (hasSearch) {
      query.search = debouncedSearch;
    }

    if (hasCategory) {
      query.category = activeCategory;
    }

    return query;
  }, [activeCategory, debouncedSearch, enterpriseId]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteServices(apiQuery);

  const services = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const totalCount = data?.pages[0]?.pagination.total ?? services.length;
  const isFiltering = isFetching && !isFetchingNextPage;

  const { data: enterprises = [] } = useEnterprises();

  const enterpriseNameById = useMemo(
    () =>
      Object.fromEntries(
        enterprises.map((enterprise) => [enterprise.id, enterprise.name]),
      ),
    [enterprises],
  );

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [apiQuery.search, apiQuery.category, apiQuery.enterprise_id]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <>
      <Text style={styles.resultCount}>{totalCount} services found</Text>
      <FlatList
        ref={listRef}
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            enterpriseNameById={enterpriseNameById}
            fromEnterpriseId={enterpriseId}
            fromSearch={fromSearch}
          />
        )}
        style={styles.listScroll}
        contentContainerStyle={[
          styles.listContent,
          services.length === 0 && styles.listContentEmpty,
          { paddingBottom: bottomInset + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => {
          void refetch();
        }}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        ListFooterComponent={
          isFetchingNextPage || (isFiltering && services.length > 0) ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={PRIMARY} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading || isFiltering ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={PRIMARY} size="large" />
            </View>
          ) : isError ? (
            <EmptyState variant="error" entity="services" onAction={() => void refetch()} />
          ) : (
            <EmptyState entity="services" />
          )
        }
      />
    </>
  );
}

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
    gap: 8,
    marginBottom: 10,
  },
  backBtn: {
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: isSmallDevice ? 18 : 24,
    lineHeight: 32,
    fontWeight: '700',
    color: TEXT_BLACK,
    minWidth: 0,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F7F3',
    borderRadius: isSmallDevice ? 16 : 18,
    borderWidth: 1,
    borderColor: SEARCH_BORDER,
    paddingHorizontal: isSmallDevice ? 12 : 16,
    height: isSmallDevice ? 40 : 48,
    marginBottom: isSmallDevice ? 12 : 16,
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
    paddingVertical: isSmallDevice ? 3 : 4,
    borderRadius: 20,
    backgroundColor: MINT,
  },
  categoryChipActive: {
    backgroundColor: PRIMARY,
  },
  categoryChipText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '600',
    color: PRIMARY,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  resultCount: {
    paddingHorizontal: isSmallDevice ? 16 : H_PAD,
    paddingTop: isSmallDevice ? 10 : 12,
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  listScroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  listContent: {
    paddingHorizontal: H_PAD,
  },
  listSeparator: {
    height: 12,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    paddingVertical: isSmallDevice ? 36 : 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: isSmallDevice ? 12 : 14,
    gap: 12,
    ...shadowSm,
  },
  thumbPressable: {
    flexShrink: 0,
  },
  thumb: {
    width: isSmallDevice ? 72 : 80,
    height: isSmallDevice ? 72 : 80,
    borderRadius: 14,
    backgroundColor: '#F0F2F1',
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  titleRowCompact: {
    marginBottom: 8,
  },
  serviceName: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  priceBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  servicePrice: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: 20,
    fontWeight: '800',
    color: PRIMARY,
  },
  serviceUnit: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  providerName: {
    flex: 1,
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#6B7C76',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  metaItems: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    minWidth: 0,
  },
  categoryBadge: {
    backgroundColor: MINT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: PRIMARY,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: isSmallDevice ? 8 : 10,
    paddingVertical: isSmallDevice ? 4 : 5,
    borderRadius: 8,
    backgroundColor: MINT,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1E7D6',
    flexShrink: 0,
  },
  chatBtnDisabled: {
    opacity: 0.7,
  },
  chatBtnText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 14,
    fontWeight: '700',
    color: PRIMARY,
  },
  cardPressed: {
    opacity: 0.92,
  },
});
