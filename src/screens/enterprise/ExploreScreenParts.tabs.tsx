import { EmptyState } from '@/components/EmptyState';
import { MessageSquareIcon, WrenchIcon } from '@/components/dashboard/DashboardIcons';
import { ServiceCardSkeletonList } from '@/components/ui/Skeleton';
import { HorizontalProductSkeleton } from '@/components/ui/Skeleton.screens';
import type { EnterpriseListItem } from '@/types/enterprise.types';
import type { ProductListItem } from '@/types/product.types';
import type { ServiceListItem } from '@/types/service.types';
import { useOpenServiceChat } from '@/hooks/useOpenServiceChat';
import { formatProductPrice } from '@/utils/product.mapper';
import { formatServicePrice } from '@/utils/service.mapper';
import { PRIMARY, styles } from '@/screens/enterprise/ExploreScreen.styles';

import { type DetailTab, TabBar } from '@/screens/enterprise/ExploreScreenParts.shared';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';

export function EnterpriseServiceRow({
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
    console.log('[ServiceChat] STEP 1 — Chat icon tapped on enterprise service row', {
      serviceId: service.id,
      serviceName: service.name,
      provider: service.provider,
      enterpriseName: service.enterpriseName,
    });
    void openServiceChat(service);
  };

  return (
    <View style={styles.serviceRow}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={service.name}
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
        <Text style={styles.servicePrice}>{formatServicePrice(service.price, service.currency)}</Text>
      </Pressable>

      <Pressable
        onPress={openChat}
        disabled={isOpeningChat}
        accessibilityRole="button"
        accessibilityLabel={`Chat about ${service.name}`}
        accessibilityState={{ disabled: isOpeningChat }}
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
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatProductPrice(product.price, product.currency)}`}
      style={({ pressed }) => [styles.productCard, pressed && styles.btnPressed]}
    >
      <Image source={{ uri: product.image }} style={styles.productImage} contentFit="cover" />
      <Text style={styles.productName} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.productPrice}>{formatProductPrice(product.price, product.currency)}</Text>
    </Pressable>
  );
}

export function ExploreTabPanel({
  activeTab,
  onTabChange,
  enterprise,
  services,
  products,
  isServicesLoading,
  isServicesError,
  isProductsLoading,
  isProductsError,
  onServicePress,
  onProductPress,
  /** When true, parent FlatList renders service rows (avoids nested VirtualizedList). */
  servicesAsListItems = false,
}: {
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  enterprise: EnterpriseListItem;
  services: ServiceListItem[];
  products: ProductListItem[];
  isServicesLoading: boolean;
  isServicesError: boolean;
  isProductsLoading: boolean;
  isProductsError: boolean;
  onServicePress: (serviceId: string) => void;
  onProductPress: (productId: string) => void;
  servicesAsListItems?: boolean;
}) {
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
        return <ServiceCardSkeletonList count={3} />;
      }
      if (isServicesError) {
        return <EmptyState compact variant="error" entity="services" />;
      }
      if (services.length === 0) {
        return <EmptyState compact entity="services" />;
      }
      if (servicesAsListItems) {
        return null;
      }
      return (
        <View style={styles.serviceList}>
          {services.map((service) => (
            <EnterpriseServiceRow
              key={service.id}
              service={service}
              onPress={() => onServicePress(service.id)}
            />
          ))}
        </View>
      );
    }

    if (isProductsLoading) {
      return <HorizontalProductSkeleton />;
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
            onPress={() => onProductPress(product.id)}
          />
        ))}
      </ScrollView>
    );
  };

  const tabContent = renderTabContent();

  return (
    <>
      <TabBar activeTab={activeTab} onChange={onTabChange} />
      {tabContent != null ? <View style={styles.tabContent}>{tabContent}</View> : null}
    </>
  );
}
