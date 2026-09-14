export type AddressApiItem = {
  id: string;
  label?: string | null;
  full_name?: string | null;
  phone?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  is_default?: boolean | null;
};

export type AddressListApiResponse = {
  items: AddressApiItem[];
};

export type CreateAddressPayload = {
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
};

export type SavedAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};
