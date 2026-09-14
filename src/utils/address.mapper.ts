import type {
  AddressApiItem,
  AddressListApiResponse,
  CreateAddressPayload,
  SavedAddress,
} from '@/types/address.types';
import type { CartCheckoutShippingAddress } from '@/types/cart.types';
import type { MarketAddressForm } from '@/components/market/marketAddressData';

function text(value: string | null | undefined, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

export function mapAddressApiItem(item: AddressApiItem): SavedAddress {
  return {
    id: String(item.id),
    label: text(item.label, 'Address'),
    fullName: text(item.full_name),
    phone: text(item.phone),
    line1: text(item.line1),
    line2: text(item.line2),
    city: text(item.city),
    state: text(item.state),
    zip: text(item.zip),
    country: text(item.country, 'United States'),
    isDefault: Boolean(item.is_default),
  };
}

export function mapAddressListApi(
  response: AddressListApiResponse | AddressApiItem[] | null | undefined,
): SavedAddress[] {
  const items = Array.isArray(response)
    ? response
    : Array.isArray(response?.items)
      ? response.items
      : [];

  return items
    .filter((item): item is AddressApiItem => Boolean(item?.id))
    .map(mapAddressApiItem);
}

export function formToCreateAddressPayload(
  form: MarketAddressForm,
  isDefault = false,
): CreateAddressPayload {
  return {
    label: form.label.trim() || 'Address',
    full_name: form.fullName.trim(),
    phone: form.phone.trim(),
    line1: form.line1.trim(),
    line2: form.line2.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    zip: form.zip.trim(),
    country: form.country.trim() || 'United States',
    is_default: isDefault,
  };
}

export function savedAddressToCheckoutShipping(
  address: SavedAddress,
): CartCheckoutShippingAddress {
  return {
    full_name: address.fullName.trim(),
    phone: address.phone.trim(),
    line1: address.line1.trim(),
    line2: address.line2.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    zip: address.zip.trim(),
    country: address.country.trim() || 'United States',
  };
}
