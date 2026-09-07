export type GlobalSearchQuery = {
  query?: string;
  tenant_id?: string;
  enterprise_id?: string;
  category?: string;
  city?: string;
  status?: string;
  page?: number;
  page_size?: number;
};

export const ACTIVE_SEARCH_STATUS = 'active';
