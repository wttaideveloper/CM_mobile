import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchIcon, WrenchIcon } from '@/components/dashboard/DashboardIcons';
import { useEnterpriseServices, useServices, serviceKeys } from '@/hooks/useServices';
import { useEnterprises } from '@/hooks/useEnterprises';
import type { ServiceListItem } from '@/types/service.types';
import { formatServicePrice } from '@/utils/service.mapper';
import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';
import { useQueryClient } from '@tanstack/react-query';
import { serviceService } from '@/services/service.service';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const BODY_BG = '#F5F7F5';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const SEARCH_BORDER = '#E0E7E1';
const H_PAD = 20;

function ServiceCard({
  service,
  enterpriseNameById,
}: {
  service: ServiceListItem;
  enterpriseNameById: Record<string, string>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const enterpriseName =
    service.enterpriseName !== 'NA'
      ? service.enterpriseName
      : enterpriseNameById[service.enterpriseId] ?? 'NA';

  const openDetail = () => {
    void queryClient.prefetchQuery({
      queryKey: serviceKeys.detail(service.id),
      queryFn: () => serviceService.getById(service.id),
    });
    router.push(`/(main)/service/${service.id}`);
  };

  return (
    <Pressable
      onPress={openDetail}
      style={({ pressed }) => [styles.serviceCard, pressed && styles.cardPressed]}
    >
      <View style={styles.iconBox}>
        <WrenchIcon size={22} color={PRIMARY} />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{service.category}</Text>
        </View>
        <Text style={styles.serviceName} numberOfLines={2}>
          {service.name}
        </Text>
        <Text style={styles.serviceMeta} numberOfLines={1}>
          {service.provider} · {enterpriseName}
        </Text>
      </View>

      <View style={styles.priceBlock}>
        <Text style={styles.servicePrice}>{formatServicePrice(service.price)}</Text>
        <Text style={styles.serviceUnit}>{service.unit}</Text>
      </View>
    </Pressable>
  );
}

export function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const { enterpriseId } = useLocalSearchParams<{ enterpriseId?: string }>();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const enterpriseServicesQuery = useEnterpriseServices(enterpriseId ?? '', {
    enabled: Boolean(enterpriseId),
  });
  const allServicesQuery = useServices({
    enabled: !enterpriseId,
  });
  const { data: enterprises = [] } = useEnterprises();

  const { data, isLoading, isError } = enterpriseId
    ? enterpriseServicesQuery
    : allServicesQuery;

  const services = data ?? [];

  const enterpriseNameById = useMemo(
    () =>
      Object.fromEntries(
        enterprises.map((enterprise) => [enterprise.id, enterprise.name]),
      ),
    [enterprises],
  );

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(services.map((service) => service.category).filter(Boolean)),
    ).sort();

    return ['All', ...uniqueCategories];
  }, [services]);

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesCategory =
        activeCategory === 'All' || service.category === activeCategory;
      const matchesSearch =
        query.length === 0 ||
        service.name.toLowerCase().includes(query) ||
        service.provider.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search, services]);

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={[styles.topSection, { paddingTop: 12 }]}>
        <Text style={styles.title}>Services</Text>

        <View style={styles.searchWrap}>
          <SearchIcon size={18} color={TEXT_MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor={TEXT_MUTED}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
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
                onPress={() => setActiveCategory(category)}
                style={[
                  styles.categoryChip,
                  isActive && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isActive && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.listScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          filteredServices.length === 0 && styles.listContentEmpty,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={PRIMARY} size="large" />
          </View>
        ) : isError ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Failed to load services.</Text>
          </View>
        ) : filteredServices.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No services found.</Text>
          </View>
        ) : (
          filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              enterpriseNameById={enterpriseNameById}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  statusBarFill: {
    backgroundColor: BODY_BG,
  },
  topSection: {
    backgroundColor: BODY_BG,
    paddingHorizontal: isSmallDevice ? 16 :  H_PAD,
    marginBottom: 0,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 24,
    lineHeight: 32,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 16,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F7F3',
    borderRadius: isSmallDevice ? 16 : 18,
    borderWidth: 1,
    borderColor: SEARCH_BORDER,
    paddingHorizontal:isSmallDevice ? 12 : 16,
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
    paddingBottom: isSmallDevice ? 12 : 16,
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
  listScroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  listContent: {
    paddingHorizontal: H_PAD,
    gap: 12,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyState: {
    paddingVertical: isSmallDevice ? 36 : 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: isSmallDevice ? 16 : 20,
    gap: 12,
    ...shadowSm,
  },
  iconBox: {
    width: isSmallDevice ? 48 : 52,
    height: isSmallDevice ? 48 : 52,
    borderRadius: 16,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: MINT,
    paddingHorizontal: isSmallDevice ? 8 : 10,
    paddingVertical: isSmallDevice ? 3 : 4,
    borderRadius: 12,
    marginBottom: isSmallDevice ? 4 : 6,
  },
  categoryBadgeText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '600',
    color: PRIMARY,
  },
  serviceName: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 3 : 4,
  },
  serviceMeta: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '400',
    color: TEXT_MUTED,
  },
  priceBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
    alignSelf: 'center',
  },
  servicePrice: {
    fontSize: isSmallDevice ? 16 : 18,
    lineHeight: 24,
    fontWeight: '700',
    color: PRIMARY,
  },
  serviceUnit: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginTop: isSmallDevice ? 1 : 2,
  },
  cardPressed: {
    opacity: 0.92,
  },
});
