import { useMemo, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketCartPlusIcon } from '@/components/market/MarketCartIcons';
import {
  MarketCheckoutCheckIcon,
  MarketCheckoutPinIcon,
} from '@/components/market/MarketCheckoutIcons';
import { MarketCountryPicker } from '@/components/market/MarketCountryPicker';
import { MarketBackIcon } from '@/components/market/MarketIcons';
import {
  EMPTY_MARKET_ADDRESS_FORM,
  formatMarketAddressLine,
  type MarketAddressForm,
  type MarketSavedAddress,
} from '@/components/market/marketAddressData';
import {
  MARKET_CHECKOUT_BG,
  MARKET_CHECKOUT_BORDER,
  MARKET_CHECKOUT_GREEN,
  MARKET_CHECKOUT_MUTED,
  MARKET_CHECKOUT_TEAL,
  MARKET_CHECKOUT_TRACK,
} from '@/components/market/marketCheckoutData';
import { useAddresses, useCreateAddress } from '@/hooks/useAddresses';
import { useMarketCheckoutAddressStore } from '@/stores/marketCheckoutAddress.store';
import { formToCreateAddressPayload } from '@/utils/address.mapper';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

type Mode = 'list' | 'form';

function Field({
  label,
  value,
  onChangeText,
  ...rest
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
} & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={MARKET_CHECKOUT_MUTED}
        {...rest}
      />
    </View>
  );
}

export function MarketAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scale = SCREEN_W / DESIGN_W;
  const selectedAddressId = useMarketCheckoutAddressStore(
    (s) => s.selectedAddressId,
  );
  const selectAddress = useMarketCheckoutAddressStore((s) => s.selectAddress);

  const {
    addresses,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAddresses();
  const createAddress = useCreateAddress();

  const [mode, setMode] = useState<Mode>('list');
  const [form, setForm] = useState<MarketAddressForm>(EMPTY_MARKET_ADDRESS_FORM);

  const selected = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId),
    [addresses, selectedAddressId],
  );

  const updateForm = <K extends keyof MarketAddressForm>(
    key: K,
    value: MarketAddressForm[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSelect = (address: MarketSavedAddress) => {
    selectAddress(address.id);
    router.back();
  };

  const handleSaveNew = async () => {
    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.line1.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.zip.trim() ||
      !form.country.trim()
    ) {
      Alert.alert(
        'Missing details',
        'Please enter full name, phone, address line 1, city, state, ZIP, and country.',
      );
      return;
    }

    try {
      await createAddress.mutateAsync(
        formToCreateAddressPayload(form, addresses.length === 0),
      );
      setForm(EMPTY_MARKET_ADDRESS_FORM);
      setMode('list');
      router.back();
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Could not save address. Please try again.';
      Alert.alert('Save failed', message);
    }
  };

  const footerPad = Math.max(insets.bottom, c(22, 18));
  const formBottomPad =
    mode === 'form' ? footerPad + c(72, 64) : insets.bottom + 100;

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={MARKET_CHECKOUT_GREEN} />
      <StatusBarFill
        lightColor={MARKET_CHECKOUT_GREEN}
        darkColor={MARKET_CHECKOUT_GREEN}
      />

      <View style={styles.header}>
        <Image
          source={headerDeco}
          style={{
            position: 'absolute',
            left: 0,
            top: -32.5 * scale,
            width: SCREEN_W,
            height: 360 * scale,
          }}
          contentFit="cover"
          pointerEvents="none"
          transition={0}
        />
        <View style={styles.topRow}>
          <Pressable
            style={styles.backBtn}
            onPress={() => {
              if (mode === 'form') {
                setMode('list');
                return;
              }
              router.back();
            }}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <MarketBackIcon />
          </Pressable>
          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>
              {mode === 'form' ? 'New delivery address' : 'Deliver to'}
            </Text>
            <Text style={styles.title}>
              {mode === 'form' ? 'Add address' : 'Saved addresses'}
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={mode === 'form' ? footerPad + c(56, 50) : 24}
        extraKeyboardSpace={c(24, 20)}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: formBottomPad },
        ]}
      >
        {mode === 'list' ? (
          <View style={styles.body}>
            <Text style={styles.sectionLabel}>Saved addresses</Text>

            {isLoading && addresses.length === 0 ? (
              <View style={styles.stateBox}>
                <ActivityIndicator color={MARKET_CHECKOUT_GREEN} />
              </View>
            ) : null}

            {isError && addresses.length === 0 ? (
              <View style={styles.stateBox}>
                <Text style={styles.stateText}>
                  {error?.message || 'Could not load addresses.'}
                </Text>
                <Pressable
                  style={styles.retryBtn}
                  onPress={() => refetch()}
                  accessibilityRole="button"
                >
                  <Text style={styles.retryText}>
                    {isFetching ? 'Retrying…' : 'Retry'}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {!isLoading && !isError && addresses.length === 0 ? (
              <Text style={styles.emptyText}>
                No saved addresses yet. Add one below.
              </Text>
            ) : null}

            {addresses.map((address) => {
              const active = address.id === selected?.id;
              return (
                <Pressable
                  key={address.id}
                  style={[styles.card, active && styles.cardActive]}
                  onPress={() => handleSelect(address)}
                  accessibilityRole="button"
                >
                  <MarketCheckoutPinIcon />
                  <View style={styles.cardCopy}>
                    <Text style={styles.cardTitle}>
                      {address.label}
                      {address.isDefault ? ' · Default' : ''}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {formatMarketAddressLine(address)}
                    </Text>
                    <Text style={styles.cardMeta}>{address.fullName}</Text>
                  </View>
                  {active ? (
                    <View style={styles.check}>
                      <MarketCheckoutCheckIcon />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}

            <Pressable
              style={styles.addCard}
              onPress={() => {
                setForm(EMPTY_MARKET_ADDRESS_FORM);
                setMode('form');
              }}
              accessibilityRole="button"
            >
              <View style={styles.addBadge}>
                <MarketCartPlusIcon color="#7c9585" size={16} />
              </View>
              <Text style={styles.addText}>Add new address</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.body}>
            <Text style={styles.sectionLabel}>Address details</Text>
            <View style={styles.formCard}>
              <Field
                label="Label"
                value={form.label}
                onChangeText={(text) => updateForm('label', text)}
                placeholder="Home, Work…"
              />
              <Field
                label="Full name"
                value={form.fullName}
                onChangeText={(text) => updateForm('fullName', text)}
                autoCapitalize="words"
                placeholder="Full name"
              />
              <Field
                label="Phone"
                value={form.phone}
                onChangeText={(text) => updateForm('phone', text)}
                keyboardType="phone-pad"
                placeholder="+1 …"
              />
              <Field
                label="Address line 1"
                value={form.line1}
                onChangeText={(text) => updateForm('line1', text)}
                placeholder="Street address"
              />
              <Field
                label="Address line 2"
                value={form.line2}
                onChangeText={(text) => updateForm('line2', text)}
                placeholder="Apt, suite (optional)"
              />
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Field
                    label="City"
                    value={form.city}
                    onChangeText={(text) => updateForm('city', text)}
                  />
                </View>
                <View style={styles.flex}>
                  <Field
                    label="State"
                    value={form.state}
                    onChangeText={(text) => updateForm('state', text)}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
              <Field
                label="ZIP"
                value={form.zip}
                onChangeText={(text) => updateForm('zip', text)}
                keyboardType="number-pad"
              />
              <MarketCountryPicker
                value={form.country}
                onChange={(country) => updateForm('country', country)}
              />
            </View>
          </View>
        )}
      </KeyboardAwareScrollView>

      {mode === 'form' ? (
        <View style={[styles.footer, { paddingBottom: footerPad }]}>
          <Pressable
            style={[
              styles.saveBtn,
              createAddress.isPending && styles.saveBtnDisabled,
            ]}
            onPress={handleSaveNew}
            disabled={createAddress.isPending}
            accessibilityRole="button"
          >
            {createAddress.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveText}>Save address</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: MARKET_CHECKOUT_BG,
  },
  header: {
    backgroundColor: MARKET_CHECKOUT_GREEN,
    paddingHorizontal: NU.hPad,
    paddingTop: NU.headerPadTop,
    paddingBottom: NU.headerPadBottomTall,
    borderBottomLeftRadius: c(30, 26),
    borderBottomRightRadius: c(30, 26),
    overflow: 'hidden',
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NU.rowGap,
    zIndex: 1,
  },
  backBtn: {
    width: NU.iconBtn,
    height: NU.iconBtn,
    borderRadius: NU.iconBtnRadius,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
  },
  eyebrow: {
    fontSize: NU.eyebrow,
    color: 'rgba(255,255,255,0.85)',
  },
  title: {
    fontSize: NU.title,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 12,
  },
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    gap: c(12, 10),
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: MARKET_CHECKOUT_MUTED,
  },
  stateBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MARKET_CHECKOUT_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: c(22, 18),
    paddingHorizontal: c(15, 12),
    alignItems: 'center',
    gap: c(10, 8),
  },
  stateText: {
    fontSize: NU.body,
    color: MARKET_CHECKOUT_MUTED,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: NU.body,
    color: MARKET_CHECKOUT_MUTED,
  },
  retryBtn: {
    paddingHorizontal: c(14, 12),
    paddingVertical: c(8, 7),
    borderRadius: 99,
    backgroundColor: MARKET_CHECKOUT_TEAL,
  },
  retryText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MARKET_CHECKOUT_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: NU.cardPadSm,
    paddingHorizontal: c(15, 12),
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  cardActive: {
    borderColor: MARKET_CHECKOUT_GREEN,
    borderWidth: 1.5,
  },
  cardCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  cardTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: MARKET_CHECKOUT_TEAL,
  },
  cardMeta: {
    fontSize: c(12.5, 11.5),
    color: MARKET_CHECKOUT_MUTED,
  },
  check: {
    width: c(22, 20),
    height: c(22, 20),
    borderRadius: c(11, 10),
    backgroundColor: MARKET_CHECKOUT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MARKET_CHECKOUT_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: NU.cardPadSm,
    paddingHorizontal: c(15, 12),
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  addBadge: {
    width: NU.iconBtn,
    height: c(28, 24),
    borderRadius: c(6, 5),
    backgroundColor: MARKET_CHECKOUT_TRACK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    flex: 1,
    fontSize: NU.link,
    fontWeight: '600',
    color: MARKET_CHECKOUT_TEAL,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MARKET_CHECKOUT_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: c(12, 10),
  },
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
  input: {
    borderWidth: 1,
    borderColor: MARKET_CHECKOUT_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(12, 10),
    paddingVertical: c(12, 10),
    fontSize: NU.link,
    color: MARKET_CHECKOUT_TEAL,
    backgroundColor: '#f8fcf9',
  },
  row: {
    flexDirection: 'row',
    gap: c(10, 8),
  },
  flex: {
    flex: 1,
  },
  footer: {
    paddingTop: NU.cardPadSm,
    paddingHorizontal: NU.hPad,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: MARKET_CHECKOUT_BORDER,
  },
  saveBtn: {
    height: c(46, 42),
    borderRadius: 99,
    backgroundColor: MARKET_CHECKOUT_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
