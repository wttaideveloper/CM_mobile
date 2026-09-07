import { PlusIcon } from '@/components/dashboard/DashboardIcons';
import { PAGE_BG, PRIMARY, checkoutStyles as styles } from '@/screens/checkout/checkout.styles';
import type { MockCartItem } from '@/stores/cart.store';
import { formatProductPrice } from '@/utils/product.mapper';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

type CartRowProps = {
  item: MockCartItem;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
};

export function CartRow({
  item,
  disabled,
  onDecrease,
  onIncrease,
  onRemove,
}: CartRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.itemRow}>
        <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
        <View style={styles.itemBody}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.itemMeta}>
            {formatProductPrice(item.unitPrice, item.currency)} each
          </Text>
          <View style={styles.qtyRow}>
            <Pressable
              onPress={onDecrease}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
              style={({ pressed }) => [styles.qtyBtn, pressed && styles.pressed]}
            >
              <View style={{ width: 10, height: 2, backgroundColor: PRIMARY, borderRadius: 1 }} />
            </Pressable>
            <Text style={styles.qtyValue}>{item.quantity}</Text>
            <Pressable
              onPress={onIncrease}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
              style={({ pressed }) => [styles.qtyBtn, styles.qtyBtnPlus, pressed && styles.pressed]}
            >
              <PlusIcon size={14} color={PAGE_BG} />
            </Pressable>
          </View>
          <Pressable
            onPress={onRemove}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Remove item"
          >
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
        <Text style={styles.itemPrice}>
          {formatProductPrice(item.unitPrice * item.quantity, item.currency)}
        </Text>
      </View>
    </View>
  );
}
