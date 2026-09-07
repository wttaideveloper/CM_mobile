export type ProductApiResponse = {
  id: string;
  enterprise_id: string;
  tenant_id?: string | null;
  location_id?: string | null;
  product_name?: string;
  product_description?: string | null;
  description?: string | null;
  product_category?: string | null;
  category?: string | null;
  product_price?: number | null;
  price?: number | null;
  product_images?: string | null;
  image_urls?: string | null;
  images?: string[] | null;
  product_status?: boolean | null;
  status?: string | null;
  sku?: string | null;
  barcode_upc?: string | null;
  weight?: string | number | null;
  dimensions?: string | Record<string, string | number | null> | null;
  length?: string | number | null;
  width?: string | number | null;
  thick?: string | number | null;
  sale_price?: number | null;
  cost_price?: number | null;
  tax_class?: string | null;
  currency?: string | null;
  stock_quantity?: number | null;
  stock_count?: number | null;
  low_stock_alert_threshold?: number | null;
  stock_management?: string | null;
  publish_status?: string | null;
  created_at?: string | null;
  enterprise_name?: string | null;
  rating?: number | null;
};

export type ProductPagination = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type ProductsPaginatedApiResponse = {
  items: ProductApiResponse[];
  pagination: ProductPagination;
};

export type ProductListQuery = {
  search?: string;
  tenant_id?: string;
  enterprise_id?: string;
  category?: string;
  location_id?: string;
  status?: string;
  page?: number;
  page_size?: number;
};

export type ProductsPaginatedResult = {
  items: ProductListItem[];
  pagination: ProductPagination;
};

export type ProductListItem = {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  isActive: boolean;
  rating: string;
  stockCount: number;
  length: string;
  width: string;
  thick: string;
  /** ISO currency code from API (USD, INR, EUR, …). */
  currency: string;
};

export type ProductDetailItem = ProductListItem & {
  salePrice: number | null;
  costPrice: number | null;
  sku: string;
  barcodeUpc: string;
  weight: string;
  taxClass: string;
  publishStatus: string;
  lowStockThreshold: number | null;
  stockManagement: string;
  images: string[];
};
