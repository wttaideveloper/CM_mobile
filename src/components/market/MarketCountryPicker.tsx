import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MarketCartChevronIcon } from '@/components/market/MarketCartIcons';
import { MarketCheckoutCheckIcon } from '@/components/market/MarketCheckoutIcons';
import {
  MARKET_CHECKOUT_BORDER,
  MARKET_CHECKOUT_GREEN,
  MARKET_CHECKOUT_MUTED,
  MARKET_CHECKOUT_TEAL,
  MARKET_CHECKOUT_TRACK,
} from '@/components/market/marketCheckoutData';
import { MARKET_COUNTRIES } from '@/constants/countries';
import { c, NU } from '@/utils/newUiCompact';

type Props = {
  value: string;
  onChange: (country: string) => void;
};

export function MarketCountryPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MARKET_COUNTRIES;
    return MARKET_COUNTRIES.filter((country) =>
      country.toLowerCase().includes(q),
    );
  }, [query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Country</Text>
        <Pressable
          style={styles.trigger}
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Select country"
        >
          <Text style={styles.triggerText} numberOfLines={1}>
            {value || 'Select country'}
          </Text>
          <View style={styles.chevron}>
            <MarketCartChevronIcon color={MARKET_CHECKOUT_MUTED} size={16} />
          </View>
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Dismiss country picker"
          />

          <View style={styles.card} accessibilityViewIsModal>
            <View style={styles.headerAccent} />

            <View style={styles.sheetHeader}>
              <View style={styles.titleBlock}>
                <Text style={styles.sheetTitle}>Select country</Text>
                <Text style={styles.sheetSubtitle}>
                  Search or pick from the list
                </Text>
              </View>
              <Pressable
                onPress={close}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text style={styles.doneText}>Close</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.search}
              value={query}
              onChangeText={setQuery}
              placeholder="Search countries"
              placeholderTextColor={MARKET_CHECKOUT_MUTED}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />

            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const active = item === value;
                return (
                  <Pressable
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => {
                      onChange(item);
                      close();
                    }}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.optionText,
                        active && styles.optionTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                    {active ? (
                      <View style={styles.check}>
                        <MarketCheckoutCheckIcon />
                      </View>
                    ) : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.empty}>
                  No countries match that search.
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: c(6, 4),
  },
  fieldLabel: {
    fontSize: c(12, 11),
    fontWeight: '700',
    color: MARKET_CHECKOUT_MUTED,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  trigger: {
    borderWidth: 1,
    borderColor: MARKET_CHECKOUT_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(12, 10),
    paddingVertical: c(12, 10),
    backgroundColor: '#f8fcf9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  triggerText: {
    flex: 1,
    fontSize: NU.link,
    color: MARKET_CHECKOUT_TEAL,
  },
  chevron: {
    transform: [{ rotate: '90deg' }],
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 36, 28, 0.48)',
    justifyContent: 'center',
    paddingHorizontal: c(22, 18),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: c(22, 18),
    height: '58%',
    maxHeight: '58%',
    overflow: 'hidden',
    shadowColor: '#0F241C',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  headerAccent: {
    height: 6,
    backgroundColor: MARKET_CHECKOUT_GREEN,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: c(12, 10),
    paddingHorizontal: c(18, 15),
    paddingTop: c(16, 14),
    paddingBottom: c(8, 6),
  },
  titleBlock: {
    flex: 1,
    gap: c(2, 1),
  },
  sheetTitle: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: MARKET_CHECKOUT_TEAL,
  },
  sheetSubtitle: {
    fontSize: c(12.5, 11.5),
    color: MARKET_CHECKOUT_MUTED,
  },
  doneText: {
    fontSize: NU.link,
    fontWeight: '700',
    color: MARKET_CHECKOUT_GREEN,
    marginTop: c(2, 1),
  },
  search: {
    marginHorizontal: c(18, 15),
    marginBottom: c(8, 6),
    borderWidth: 1,
    borderColor: MARKET_CHECKOUT_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(12, 10),
    paddingVertical: c(11, 9),
    fontSize: NU.link,
    color: MARKET_CHECKOUT_TEAL,
    backgroundColor: MARKET_CHECKOUT_TRACK,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: c(10, 8),
    paddingBottom: c(14, 12),
  },
  option: {
    paddingVertical: c(13, 11),
    paddingHorizontal: c(10, 8),
    borderRadius: NU.cardRadiusSm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
  },
  optionActive: {
    backgroundColor: '#f3faf4',
  },
  optionText: {
    flex: 1,
    fontSize: NU.link,
    color: MARKET_CHECKOUT_TEAL,
  },
  optionTextActive: {
    fontWeight: '700',
  },
  empty: {
    marginTop: c(20, 16),
    marginBottom: c(12, 10),
    textAlign: 'center',
    color: MARKET_CHECKOUT_MUTED,
    fontSize: NU.body,
  },
  check: {
    width: c(22, 20),
    height: c(22, 20),
    borderRadius: c(11, 10),
    backgroundColor: MARKET_CHECKOUT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
