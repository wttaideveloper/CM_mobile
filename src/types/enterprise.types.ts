export type EnterpriseApiResponse = {
  id: string;
  tenant_id?: string | null;
  business_short_name: string;
  business_legal_name: string;
  business_description: string | null;
  business_email: string | null;
  business_phone: string | null;
  registered_address: string | null;
  business_address: string | null;
  communication_address: string | null;
  website?: string | null;
  logo_url: string | null;
  banner_url?: string | null;
  status: string;
  suite_unit?: string | null;
  business_images: string | null;
  registration_number?: string | null;
  business_category?: string | null;
  website_url?: string | null;
  year_founded?: number | null;
  primary_contact_name?: string | null;
  primary_contact_title?: string | null;
  secondary_email?: string | null;
  secondary_phone?: string | null;
  brand_color?: string | null;
  tagline?: string | null;
  created_at?: string | null;
  category: string | null;
  status_label: string | null;
  members_count: number | null;
  revenue: number | null;
  joined_date?: string | null;
  rating: number | null;
};

export type EnterpriseListItem = {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  category: string;
  location: string;
  members: number;
  revenue: number;
  joined: string;
  status: string;
  isVerified: boolean;
  products: number;
  rating: string;
  heroImage: string;
  logoUrl: string | null;
  website: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  yearFounded: number | null;
};

export type EnterprisePagination = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type EnterprisesPaginatedApiResponse = {
  items: EnterpriseApiResponse[];
  pagination: EnterprisePagination;
};

export type EnterpriseListQuery = {
  search?: string;
  category?: string;
  status?: string;
  tenant_id?: string;
  page?: number;
  page_size?: number;
};

export type EnterprisesPaginatedResult = {
  items: EnterpriseListItem[];
  pagination: EnterprisePagination;
};
