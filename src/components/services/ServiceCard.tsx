import { ClockIcon, MessageSquareIcon, UsersIcon } from '@/components/dashboard/DashboardIcons';
import { useOpenServiceChat } from '@/hooks/useOpenServiceChat';
import { serviceKeys } from '@/hooks/useServices';
import { serviceService } from '@/services/service.service';
import { PRIMARY, styles, TEXT_MUTED } from '@/screens/shop/services/ServicesScreen.styles';
import type { ServiceListItem } from '@/types/service.types';
import { detailFromEnterpriseHref, detailHref, exploreTabServiceHref } from '@/utils/searchNavigation';
import { formatServicePrice } from '@/utils/service.mapper';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

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
    console.log('[ServiceChat] STEP 1 — Chat icon tapped on ServiceCard', {
      serviceId: service.id,
      serviceName: service.name,
      provider: service.provider,
      enterpriseName: service.enterpriseName,
    });
    void openServiceChat(service);
  };

  return (
    <View style={styles.serviceCard}>
      <Pressable
        onPress={openDetail}
        accessibilityRole="button"
        accessibilityLabel={`View ${service.name}`}
        style={({ pressed }) => [styles.thumbPressable, pressed && styles.cardPressed]}
      >
        <Image source={{ uri: service.image }} style={styles.thumb} contentFit="cover" />
      </Pressable>

      <View style={styles.cardBody}>
        <Pressable
          onPress={openDetail}
          accessibilityRole="button"
          accessibilityLabel={service.name}
          style={({ pressed }) => [pressed && styles.cardPressed]}
        >
          <View style={[styles.titleRow, !hasProvider && styles.titleRowCompact]}>
            <Text style={styles.serviceName} numberOfLines={2}>
              {service.name}
            </Text>
            <View style={styles.priceBlock}>
              <Text style={styles.servicePrice}>{formatServicePrice(service.price, service.currency)}</Text>
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
            accessibilityRole="button"
            accessibilityLabel={`View details for ${service.name}`}
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
            accessibilityRole="button"
            accessibilityLabel="Chat"
            accessibilityState={{ disabled: isOpeningChat }}
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
