import type { SavedAddress } from '@/types/address.types';

export type MarketSavedAddress = SavedAddress;

export type MarketAddressForm = {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export const EMPTY_MARKET_ADDRESS_FORM: MarketAddressForm = {
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States',
};

export function formatMarketAddressLine(address: MarketSavedAddress): string {
  const street = [address.line1, address.line2].filter(Boolean).join(', ');
  const cityLine = [address.city, address.state, address.zip]
    .filter(Boolean)
    .join(' ');
  return [street, cityLine].filter(Boolean).join(', ');
}

export function savedAddressToForm(address: MarketSavedAddress): MarketAddressForm {
  return {
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    zip: address.zip,
    country: address.country,
  };
}
