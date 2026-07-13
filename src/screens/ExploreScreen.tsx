import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { useState } from 'react';
import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { EmptyState } from '@/components/EmptyState';
import { LeafyGradientButton } from '@/components/LeafyGradientButton';
import { VerifiedCheckBadge } from '@/components/VerifiedCheckBadge';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChevronLeftIcon,
  HeartIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
  StarIcon,
  WrenchIcon,
} from '@/components/dashboard/DashboardIcons';
import { useEnterprise } from '@/hooks/useEnterprises';
import { useDetailBack } from '@/hooks/useDetailBack';
import { useEnterpriseProducts } from '@/hooks/useProducts';
import { useEnterpriseServices } from '@/hooks/useServices';
import type { ProductListItem } from '@/types/product.types';
import type { ServiceListItem } from '@/types/service.types';
import {
  formatLocationShort,
  formatMembersCount,
  formatYearsEstablished,
} from '@/utils/enterprise.mapper';
import { formatProductPrice } from '@/utils/product.mapper';
import { formatServicePrice } from '@/utils/service.mapper';
import {
  detailFromEnterpriseHref,
  exploreEnterpriseProductsHref,
  exploreEnterpriseServicesHref,
  exploreTabProductHref,
  exploreTabServiceHref,
  withFromSearch,
} from '@/utils/searchNavigation';
import { useOpenServiceChat } from '@/hooks/useOpenServiceChat';
import { shadowMd, shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const ACCENT_GREEN = '#4CAF50';
const MINT = '#EAF4EC';
const TEXT_MUTED = '#6B7280';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const BODY_BG = '#F5F7F5';
const HERO_BG = '#1A1A1A';
const HERO_HEIGHT = isSmallDevice ? 200 : 220;
const H_PAD = isSmallDevice ? 16 : 20;
const HERO_ACTIONS_TOP = isSmallDevice ? 8 : 10;
const STAR_SIZE = isSmallDevice ? 15 : 17;

type DetailTab = 'about' | 'services' | 'products';

function DetailStarRating({ rating }: { rating: string }) {
  const value = Math.max(0, Math.min(5, Number.parseFloat(rating) || 0));
  const fullStars = Math.floor(value);
  const hasHalf = value - fullStars >= 0.5;

  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < fullStars || (index === fullStars && hasHalf);
        return (
          <StarIcon key={index} size={STAR_SIZE} color={filled ? '#FBBF24' : '#E5E7EB'} />
        );
      })}
    </View>
  );
}

function EnterpriseActionButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  if (active) {
    return (
      <LeafyGradientButton onPress={onPress} style={styles.actionBtn} borderRadius={14}>
        <Text style={styles.actionBtnTextActive}>{label}</Text>
      </LeafyGradientButton>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionBtnOutline, pressed && styles.btnPressed]}
    >
      <Text style={styles.actionBtnTextOutline}>{label}</Text>
    </Pressable>
  );
}
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: DetailTab;
  onChange: (tab: DetailTab) => void;
}) {
  const tabs: { key: DetailTab; label: string }[] = [
    { key: 'about', label: 'About' },
    { key: 'services', label: 'Services' },
    { key: 'products', label: 'Products' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tabItem, active && styles.tabItemActive]}
          >
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function EnterpriseServiceRow({
  service,
  onPress,
}: {
  service: ServiceListItem;
  onPress: () => void;
}) {
  const { openServiceChat, isOpeningChat } = useOpenServiceChat();
  const meta = [service.duration !== 'NA' ? service.duration : null, service.provider]
    .filter(Boolean)
    .join(' · ');

  const openChat = () => {
    void openServiceChat(service);
  };

  return (
    <View style={styles.serviceRow}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.serviceRowMain, pressed && styles.btnPressed]}
      >
        <View style={styles.serviceIconBox}>
          <WrenchIcon size={20} color={PRIMARY} />
        </View>
        <View style={styles.serviceMain}>
          <Text style={styles.serviceName} numberOfLines={2}>
            {service.name}
          </Text>
          {meta ? (
            <Text style={styles.serviceMeta} numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
        </View>
        <Text style={styles.servicePrice}>{formatServicePrice(service.price)}</Text>
      </Pressable>

      <Pressable
        onPress={openChat}
        disabled={isOpeningChat}
        style={({ pressed }) => [
          styles.serviceChatBtn,
          pressed && styles.btnPressed,
          isOpeningChat && styles.serviceChatBtnDisabled,
        ]}
        hitSlop={4}
      >
        {isOpeningChat ? (
          <ActivityIndicator size="small" color={PRIMARY} />
        ) : (
          <MessageSquareIcon size={16} color={PRIMARY} />
        )}
      </Pressable>
    </View>
  );
}

function EnterpriseProductCard({
  product,
  onPress,
}: {
  product: ProductListItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.productCard, pressed && styles.btnPressed]}
    >
      <Image source={{ uri: product.image }} style={styles.productImage} contentFit="cover" />
      <Text style={styles.productName} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.productPrice}>{formatProductPrice(product.price)}</Text>
    </Pressable>
  );
}

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
  // Tab layout already renders a status-bar fill; pull under it so hero fill is continuous.
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

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.fallback, screenOffsetStyle]}>
        <AppStatusBar variant="light" backgroundColor={HERO_BG} />
        <StatusBarFill lightColor={HERO_BG} darkColor={HERO_BG} />
        <ActivityIndicator color={PRIMARY} size="large" />
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

  const logoLetter = enterprise.name === 'NA' ? '?' : enterprise.name.charAt(0).toUpperCase();
  const hasLogo = Boolean(enterprise.logoUrl);
  const ratingValue =
    enterprise.rating === 'NA' || enterprise.rating === '0' ? '0.0' : enterprise.rating;
  const locationShort = formatLocationShort(enterprise.location);
  const reviewCount = formatMembersCount(enterprise.members);
  const yearsEstablished = formatYearsEstablished(enterprise.yearFounded);

  const renderTabContent = () => {
    if (activeTab === 'about') {
      return (
        <Text style={styles.aboutText}>
          {enterprise.description !== 'NA'
            ? enterprise.description
            : 'No description available for this enterprise yet.'}
        </Text>
      );
    }

    if (activeTab === 'services') {
      if (isServicesLoading) {
        return (
          <View style={styles.tabLoading}>
            <ActivityIndicator color={PRIMARY} />
          </View>
        );
      }
      if (isServicesError) {
        return <EmptyState compact variant="error" entity="services" />;
      }
      if (services.length === 0) {
        return <EmptyState compact entity="services" />;
      }
      return (
        <View style={styles.serviceList}>
          {services.map((service) => (
            <EnterpriseServiceRow
              key={service.id}
              service={service}
              onPress={() =>
                router.push(
                  openedFromSearch
                    ? detailFromEnterpriseHref('/(main)/service', service.id, enterpriseId, true)
                    : exploreTabServiceHref(service.id),
                )
              }
            />
          ))}
        </View>
      );
    }

    if (isProductsLoading) {
      return (
        <View style={styles.tabLoading}>
          <ActivityIndicator color={PRIMARY} />
        </View>
      );
    }
    if (isProductsError) {
      return <EmptyState compact variant="error" entity="products" />;
    }
    if (products.length === 0) {
      return <EmptyState compact entity="products" />;
    }
    return (
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsScroll}
      >
        {products.map((product) => (
          <EnterpriseProductCard
            key={product.id}
            product={product}
            onPress={() =>
              router.push(
                openedFromSearch
                  ? detailFromEnterpriseHref('/(main)/product', product.id, enterpriseId, true)
                  : exploreTabProductHref(product.id),
              )
            }
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.screen, screenOffsetStyle]}>
      <AppStatusBar variant="light" backgroundColor={HERO_BG} />
      <StatusBarFill lightColor={HERO_BG} darkColor={HERO_BG} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: enterprise.heroImage }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <View style={[styles.heroActions, { paddingTop: HERO_ACTIONS_TOP }]}>
            <Pressable
              onPress={goBack}
              style={({ pressed }) => [styles.heroBtn, pressed && styles.btnPressed]}
              hitSlop={8}
            >
              <ChevronLeftIcon size={22} color="#FFFFFF" />
            </Pressable>
            <View style={styles.heroActionsRight}>
              <Pressable
                style={({ pressed }) => [styles.heroBtn, pressed && styles.btnPressed]}
                hitSlop={8}
              >
                <HeartIcon size={18} color="#FFFFFF" />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.heroBtn, pressed && styles.btnPressed]}
                hitSlop={8}
              >
                <MoreVerticalIcon size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.profileSection}>
            <View style={styles.profileRow}>
              <View style={styles.logoBox}>
                {hasLogo ? (
                  <Image
                    source={{ uri: enterprise.logoUrl! }}
                    style={styles.logoImage}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.logoLetter}>{logoLetter}</Text>
                )}
              </View>
              <View style={styles.profileText}>
                <View style={styles.nameRow}>
                  <Text style={styles.businessName} numberOfLines={2}>
                    {enterprise.name}
                  </Text>
                  {enterprise.isVerified ? <VerifiedCheckBadge size={16} /> : null}
                </View>
                <Text style={styles.categoryLocation} numberOfLines={2}>
                  {enterprise.category}
                  {locationShort !== 'NA' ? ` · ${locationShort}` : ''}
                </Text>
              </View>
            </View>
            <View style={styles.ratingRow}>
              <DetailStarRating rating={ratingValue} />
              <Text style={styles.ratingText} numberOfLines={1}>
                <Text style={styles.ratingValue}>{ratingValue}</Text>
                {` (${reviewCount} reviews)`}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatCard value={formatMembersCount(enterprise.members)} label="Members" />
            <StatCard value={String(products.length)} label="Products" />
            <StatCard value={String(services.length)} label="Services" />
            <StatCard value={yearsEstablished} label="Est." />
          </View>

          <View style={styles.actionRow}>
            <EnterpriseActionButton
              label="Book Service"
              active={activeAction === 'services'}
              onPress={() => {
                setActiveAction('services');
                router.push(exploreEnterpriseServicesHref(enterpriseId, openedFromSearch));
              }}
            />
            <EnterpriseActionButton
              label="Shop Products"
              active={activeAction === 'products'}
              onPress={() => {
                setActiveAction('products');
                router.push(exploreEnterpriseProductsHref(enterpriseId, openedFromSearch));
              }}
            />
          </View>

          <TabBar activeTab={activeTab} onChange={setActiveTab} />
          <View style={styles.tabContent}>{renderTabContent()}</View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: HERO_BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  heroWrap: {
    height: HERO_HEIGHT,
    backgroundColor: HERO_BG,
  },
  heroImage: {
    width: '100%',
    height: HERO_HEIGHT,
  },
  heroActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingBottom: 8,
  },
  heroActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: BODY_BG,
    paddingHorizontal: H_PAD,
    paddingTop: 0,
    paddingBottom: 8,
  },
  profileSection: {
    marginTop: -24,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 10,
  },
  logoBox: {
    width: isSmallDevice ? 68 : 76,
    height: isSmallDevice ? 68 : 76,
    flexShrink: 0,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadowMd,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoLetter: {
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: '700',
    color: PRIMARY,
  },
  profileText: {
    flex: 1,
    minWidth: 0,
    paddingTop: 38,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  businessName: {
    flexShrink: 1,
    fontSize: isSmallDevice ? 17 : 19,
    lineHeight: 24,
    fontWeight: '800',
    color: TEXT_BLACK,
    letterSpacing: -0.3,
  },
  categoryLocation: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingLeft: 2,
  },
  ratingText: {
    flex: 1,
    flexShrink: 1,
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    flexShrink: 0,
  },
  ratingValue: {
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: isSmallDevice ? 12 : 14,
    paddingHorizontal: 4,
    alignItems: 'center',
    ...shadowSm,
  },
  statValue: {
    fontSize: isSmallDevice ? 15 : 17,
    lineHeight: 22,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: isSmallDevice ? 20 : 24,
  },
  actionBtn: {
    flex: 1,
    minWidth: 0,
    borderRadius: 14,
    height: isSmallDevice ? 44 : 48,
  },
  actionBtnOutline: {
    flex: 1,
    minWidth: 0,
    height: isSmallDevice ? 44 : 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnTextActive: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnTextOutline: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '700',
    color: PRIMARY,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: MINT,
    borderRadius: 14,
    padding: 4,
    marginBottom: isSmallDevice ? 16 : 20,
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
  tabContent: {
    minHeight: 80,
  },
  tabLoading: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  aboutText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 22,
    fontWeight: '400',
    color: TEXT_MUTED,
  },
  serviceList: {
    gap: 10,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingRight: 10,
    gap: 8,
    ...shadowSm,
  },
  serviceRowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    minWidth: 0,
  },
  serviceChatBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceChatBtnDisabled: {
    opacity: 0.7,
  },
  serviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceMain: {
    flex: 1,
    minWidth: 0,
  },
  serviceName: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 3,
  },
  serviceMeta: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  servicePrice: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: 22,
    fontWeight: '800',
    color: PRIMARY,
    flexShrink: 0,
  },
  productsScroll: {
    gap: 14,
    paddingRight: 4,
  },
  productCard: {
    width: isSmallDevice ? 108 : 116,
  },
  productImage: {
    width: isSmallDevice ? 108 : 116,
    height: isSmallDevice ? 108 : 116,
    borderRadius: 16,
    backgroundColor: '#F0F2F1',
    marginBottom: 10,
  },
  productName: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 18,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '800',
    color: PRIMARY,
  },
  btnPressed: {
    opacity: 0.9,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
