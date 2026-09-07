import { HeartIcon, PlusIcon, StarIcon } from '@/components/dashboard/DashboardIcons';
import type { ProductListItem } from '@/types/product.types';
import { detailFromEnterpriseHref, detailHref, exploreTabProductHref } from '@/utils/searchNavigation';
import { formatProductPrice } from '@/utils/product.mapper';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { CARD_WIDTH, styles } from '@/screens/shop/products/ProductsScreen.styles';

export function ProductGridCard({
  product,
  fromSearch,
  fromEnterpriseId,
}: {
  product: ProductListItem;
  fromSearch?: boolean;
  fromEnterpriseId?: string;
}) {
  const router = useRouter();

  const openDetail = () => {
    if (fromEnterpriseId) {
      router.push(
        fromSearch
          ? detailFromEnterpriseHref('/(main)/product', product.id, fromEnterpriseId, true)
          : exploreTabProductHref(product.id),
      );
      return;
    }

    router.push(detailHref('/(main)/product', product.id, fromSearch));
  };

  return (
    <Pressable
      onPress={openDetail}
      style={({ pressed }) => [
        styles.productCard,
        { width: CARD_WIDTH },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatProductPrice(product.price, product.currency)}`}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          contentFit="cover"
        />
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={({ pressed }) => [styles.heartBtn, pressed && styles.pressed]}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Save ${product.name}`}
        >
          <HeartIcon size={16} color="#9AA8A2" />
        </Pressable>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.categoryLabel}>{product.category}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.ratingRow}>
          <StarIcon size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>{product.rating}</Text>
          {product.stockCount > 0 ? (
            <>
              <Text style={styles.ratingDot}>·</Text>
              <Text style={styles.soldText}>{product.stockCount} sold</Text>
            </>
          ) : null}
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.productPrice}>{formatProductPrice(product.price, product.currency)}</Text>
          <Pressable
            onPress={openDetail}
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Open ${product.name}`}
          >
            <PlusIcon size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
