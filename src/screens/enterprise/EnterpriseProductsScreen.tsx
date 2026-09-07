import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { useInsideTabLayout } from '@/hooks/useInsideTabLayout';
import { EmptyState } from '@/components/EmptyState';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useEnterprise } from '@/hooks/useEnterprises';
import { useEnterpriseProducts } from '@/hooks/useProducts';
import { ProductGridCard } from '@/screens/shop/products/ProductsScreen';
import { isSmallDevice } from '@/utils/responsive';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Dimensions,
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
const CARD_GAP = isSmallDevice ? 10 : 12;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) / 2;

export function EnterpriseProductsScreen() {
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
    data: products = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useEnterpriseProducts(enterpriseId);

  const isLoading = isEnterpriseLoading || isProductsLoading;

  const rows: typeof products[] = [];
  for (let index = 0; index < products.length; index += 2) {
    rows.push(products.slice(index, index + 2));
  }

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
          <Text style={styles.title}>Products</Text>
          {!isEnterpriseLoading && enterprise ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {enterprise.name}
            </Text>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ProductGridSkeleton />
        </View>
      ) : isProductsError ? (
        <EmptyState variant="error" entity="products" />
      ) : products.length === 0 ? (
        <EmptyState entity="products" />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(_, index) => `row-${index}`}
          renderItem={({ item: row }) => (
            <View style={styles.gridRow}>
              {row.map((product) => (
                <ProductGridCard
                  key={product.id}
                  product={product}
                  fromEnterpriseId={enterpriseId}
                  fromSearch={openedFromSearch}
                />
              ))}
              {row.length === 1 ? <View style={{ width: CARD_WIDTH }} /> : null}
            </View>
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomInset + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.rowGap} />}
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
  gridRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  rowGap: {
    height: CARD_GAP,
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
