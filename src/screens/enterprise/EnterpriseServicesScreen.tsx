import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { useInsideTabLayout } from '@/hooks/useInsideTabLayout';
import { EmptyState } from '@/components/EmptyState';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { ServiceCardSkeletonList } from '@/components/ui/Skeleton';
import { useEnterprise } from '@/hooks/useEnterprises';
import { useEnterpriseServices } from '@/hooks/useServices';
import { ServiceCard } from '@/screens/shop/services/ServicesScreen';
import { isSmallDevice } from '@/utils/responsive';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const PRIMARY = '#1F5D4E';
const PAGE_BG = '#FFFFFF';
const BODY_BG = '#F5F7F5';
const TEXT_MUTED = '#6B7280';
const TEXT_BLACK = '#111111';
const H_PAD = isSmallDevice ? 16 : 20;

export function EnterpriseServicesScreen() {
  const { bottomInset, screenOffsetStyle } = useInsideTabLayout();
  const router = useRouter();
  const { enterpriseId: rawEnterpriseId, fromSearch } = useLocalSearchParams<{
    enterpriseId?: string | string[];
    fromSearch?: string;
  }>();
  const enterpriseId = Array.isArray(rawEnterpriseId)
    ? rawEnterpriseId[0] ?? ''
    : rawEnterpriseId ?? '';
  const openedFromSearch = fromSearch === '1';

  const { enterprise, isLoading: isEnterpriseLoading } = useEnterprise(enterpriseId);
  const {
    data: services = [],
    isLoading: isServicesLoading,
    isError: isServicesError,
  } = useEnterpriseServices(enterpriseId);

  const isLoading = isEnterpriseLoading || isServicesLoading;

  return (
    <View style={[styles.screen, screenOffsetStyle]}>
      <AppStatusBar />
      <StatusBarFill />

      <View style={[styles.header, { paddingTop: isSmallDevice ? 10 : 12 }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <ChevronLeftIcon size={22} color={PRIMARY} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Services</Text>
          {!isEnterpriseLoading && enterprise ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {enterprise.name}
            </Text>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ServiceCardSkeletonList />
        </View>
      ) : isServicesError ? (
        <EmptyState variant="error" entity="services" />
      ) : services.length === 0 ? (
        <EmptyState entity="services" />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              fromEnterpriseId={enterpriseId}
              fromSearch={openedFromSearch}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomInset + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 12 : 14,
    backgroundColor: PAGE_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EDEA',
  },
  backBtn: {
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: isSmallDevice ? 18 : 20,
    lineHeight: isSmallDevice ? 24 : 26,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  subtitle: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 12 : 14,
  },
  separator: {
    height: isSmallDevice ? 10 : 12,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
});
