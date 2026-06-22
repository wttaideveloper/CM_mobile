import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
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
  CircleCheckIcon,
  ChevronLeftIcon,
  MoreVerticalIcon,
} from '@/components/dashboard/DashboardIcons';
import { useEnterprise } from '@/hooks/useEnterprises';
import { useEnterpriseProducts } from '@/hooks/useProducts';
import { formatMembersCount } from '@/utils/enterprise.mapper';
import { formatProductPrice } from '@/utils/product.mapper';
import { shadowMd, shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';


const PRIMARY = '#1F5D4E';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const EMERALD = '#10b981';
const BORDER = '#E8EDEA';
const HERO_HEIGHT = 200;

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProductCard({
  name,
  price,
  image,
  onPress,
}: {
  name: string;
  price: string;
  image: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.productCard, pressed && styles.btnPressed]}
    >
      <Image source={{ uri: image }} style={styles.productImage} contentFit="cover" />
      <Text style={styles.productName} numberOfLines={1}>{name}</Text>
      <Text style={styles.productPrice}>{price}</Text>
    </Pressable>
  );
}

export function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const statusBarFill = useStatusBarBackground();
  const enterpriseId = id ?? '';
  const { enterprise, isLoading, isError } = useEnterprise(enterpriseId);
  const {
    data: products = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useEnterpriseProducts(enterpriseId);
  if (isLoading) {
    return (
      <View style={[styles.screen, styles.fallback]}>
        <AppStatusBar />
        <ActivityIndicator color={PRIMARY} size="large" />
      </View>
    );
  }

  if (isError || !enterprise) {
    return (
      <View style={[styles.screen, styles.fallback]}>
        <AppStatusBar />
        <Text style={styles.fallbackText}>Enterprise not found</Text>
        <Pressable onPress={() => router.back()} style={styles.fallbackBtn}>
          <Text style={styles.fallbackBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const logoLetter = enterprise.name === 'NA' ? '?' : enterprise.name.charAt(0).toUpperCase();

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

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

          <View style={styles.heroActions}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.heroBtn, pressed && styles.btnPressed]}
              hitSlop={8}
            >
              <ChevronLeftIcon size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.heroBtn, pressed && styles.btnPressed]}
              hitSlop={8}
            >
              <MoreVerticalIcon size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.profileRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>{logoLetter}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.businessName} numberOfLines={2}>
                {enterprise.name}
              </Text>
              <View style={styles.verifiedRow}>
                {enterprise.isVerified && (
                  <CircleCheckIcon size={12} color={EMERALD} />
                )}
                <Text style={styles.verifiedText}>
                  {enterprise.isVerified ? 'Verified · ' : ''}
                  {enterprise.status !== 'NA' ? `${enterprise.status} · ` : ''}
                  {enterprise.category}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatPill value={formatMembersCount(enterprise.members)} label="Members" />
            <StatPill
              value={String(products.length || enterprise.products)}
              label="Products"
            />
            <StatPill value={enterprise.rating} label="Rating" />
          </View>

          <Text style={styles.description}>{enterprise.description}</Text>

          <View style={styles.actionRow}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(main)/(tabs)/shop',
                  params: { enterpriseId },
                })
              }
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={styles.primaryBtnText}>Book Service</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(main)/products',
                  params: { enterpriseId },
                })
              }
              style={({ pressed }) => [
                styles.outlineBtn,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={styles.outlineBtnText}>View Products</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>FEATURED PRODUCTS</Text>
          {isProductsLoading ? (
            <View style={styles.productsLoading}>
              <ActivityIndicator color={PRIMARY} />
            </View>
          ) : isProductsError ? (
            <Text style={styles.productsEmpty}>Failed to load products.</Text>
          ) : products.length === 0 ? (
            <Text style={styles.productsEmpty}>No products found.</Text>
          ) : (
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsScroll}
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  price={formatProductPrice(product.price)}
                  image={product.image}
                  onPress={() => router.push(`/(main)/product/${product.id}`)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  statusBarFill: {
    backgroundColor: '#1A1A1A',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroWrap: {
    height: HERO_HEIGHT,
    backgroundColor: '#1A1A1A',
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:isSmallDevice ? 16 :  20,
    gap: 14,
  },
  logoBox: {
    width: isSmallDevice ? 48 :  56,
    height: isSmallDevice ? 48 :  56,
    flexShrink: 0,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowMd,
  },
  logoLetter: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: '700',
    color: PRIMARY,
    lineHeight: 32,
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  businessName: {
    fontSize: isSmallDevice ? 18 : 20,
    lineHeight: 26,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 4 :  6,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 4 :  6,
  },
  verifiedText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: TEXT_MUTED,
    flexShrink: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: isSmallDevice ? 12 :  15,
  },
  statPill: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: isSmallDevice ? 12 :  14,
    paddingHorizontal: 8,
    alignItems: 'center',
    ...shadowSm,
  },
  statValue: {
    fontSize: isSmallDevice ? 16 : 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  description: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 22,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 16 :  20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: isSmallDevice ? 24 :  28,
  },
  primaryBtn: {
    flex: 1,
    minWidth: 0,
    height: isSmallDevice ? 40 : 44,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtn: {
    flex: 1,
    minWidth: 0,
    height: isSmallDevice ? 40 : 44,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  outlineBtnText: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '700',
    color: PRIMARY,
  },
  btnPressed: {
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '700',
    color: TEXT_BLACK,
    letterSpacing: 0.6,
    marginBottom: isSmallDevice ? 12 :  16,
  },
  productsScroll: {
    gap: 14,
    paddingRight: isSmallDevice ? 16 :  20,
  },
  productsLoading: {
    paddingVertical: isSmallDevice ? 20 :  24,
    alignItems: 'center',
  },
  productsEmpty: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '500',
    color: TEXT_MUTED,
    paddingBottom: isSmallDevice ? 6 :    8,
  },
  productCard: {
    width: isSmallDevice ? 100 :  108,
  },
  productImage: {
    width: isSmallDevice ? 100 :  108,
    height: isSmallDevice ? 100 :  108,
    borderRadius: 16,
    backgroundColor: '#F0F2F1',
    marginBottom: isSmallDevice ? 8 :  10,
  },
  productName: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: isSmallDevice ? 3 :  4,
  },
  productPrice: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: PRIMARY,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fallbackText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 12 :  16,
  },
  fallbackBtn: {
    paddingHorizontal: isSmallDevice ? 16 :  20,
    paddingVertical: isSmallDevice ? 10 :  12,
    borderRadius: isSmallDevice ? 10 :  12,
    backgroundColor: PRIMARY,
  },
  fallbackBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
