import type { ProductApiResponse, ProductDetailItem, ProductListItem } from '@/types/product.types';
import { formatMoney, normalizeCurrencyCode } from '@/utils/currency';

const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=160&h=160&fit=crop';

function textOrNa(value?: string | null): string {
  if (value == null || value.trim() === '') {
    return 'NA';
  }
  return value.trim();
}

function numberOrZero(value?: number | null): number {
  return value ?? 0;
}

function specOrZero(value?: string | number | null): string {
  if (value == null || value === '') {
    return '0';
  }

  const normalized = String(value).trim();
  if (!normalized || normalized === 'NA') {
    return '0';
  }

  return normalized;
}

export function formatProductRating(value?: number | null): string {
  if (value == null) {
    return '0.0';
  }

  return value.toFixed(1);
}

function pickProductImages(
  productImages?: string | null,
  imageUrls?: string | null,
  imagesArray?: string[] | null,
): string[] {
  if (Array.isArray(imagesArray) && imagesArray.length > 0) {
    const urls = imagesArray
      .map((url) => pickProductImage(url))
      .filter((url) => Boolean(url.trim()));

    if (urls.length > 0) {
      return urls;
    }
  }

  const raw = productImages?.trim() || imageUrls?.trim() || '';
  if (!raw) {
    return [DEFAULT_PRODUCT_IMAGE];
  }

  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const urls = parsed
          .map((entry) => pickProductImage(typeof entry === 'string' ? entry : null))
          .filter((url) => Boolean(url.trim()));

        if (urls.length > 0) {
          return urls;
        }
      }
    } catch {
      // fall through to delimiter parsing
    }
  }

  const urls = raw
    .split(/[,;|]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(pickProductImage);

  return urls.length > 0 ? urls : [DEFAULT_PRODUCT_IMAGE];
}

function pickProductImage(url?: string | null): string {
  if (!url?.trim()) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  const trimmed = url.trim();

  if (trimmed.includes('unsplash.com/photos/')) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  return trimmed;
}

function pickStockCount(item: ProductApiResponse): number {
  return numberOrZero(item.stock_count ?? item.stock_quantity);
}

function parseDimensionString(raw: string): {
  length: string;
  width: string;
  thick: string;
} {
  const parts = raw
    .split(/x|×|\*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    length: specOrZero(parts[0]),
    width: specOrZero(parts[1]),
    thick: specOrZero(parts[2]),
  };
}

function pickDimensions(item: ProductApiResponse): {
  length: string;
  width: string;
  thick: string;
} {
  if (item.length != null || item.width != null || item.thick != null) {
    return {
      length: specOrZero(item.length),
      width: specOrZero(item.width),
      thick: specOrZero(item.thick),
    };
  }

  if (item.dimensions == null) {
    return { length: '0', width: '0', thick: '0' };
  }

  if (typeof item.dimensions === 'object') {
    return {
      length: specOrZero(item.dimensions.length),
      width: specOrZero(item.dimensions.width),
      thick: specOrZero(item.dimensions.thick ?? item.dimensions.thickness),
    };
  }

  const raw = item.dimensions.trim();
  if (!raw) {
    return { length: '0', width: '0', thick: '0' };
  }

  if (/x|×|\*/i.test(raw)) {
    return parseDimensionString(raw);
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, string | number | null>;
    return {
      length: specOrZero(parsed.length),
      width: specOrZero(parsed.width),
      thick: specOrZero(parsed.thick ?? parsed.thickness),
    };
  } catch {
    return { length: '0', width: '0', thick: '0' };
  }
}

export function mapProductApiToListItem(item: ProductApiResponse): ProductListItem {
  const dimensions = pickDimensions(item);
  const price = item.product_price ?? item.price ?? 0;
  const isActive =
    item.product_status ??
    (typeof item.status === 'string' ? item.status.toLowerCase() === 'active' : false);
  const images = pickProductImages(
    item.product_images,
    item.image_urls,
    item.images,
  );

  return {
    id: item.id,
    enterpriseId: item.enterprise_id,
    enterpriseName: textOrNa(item.enterprise_name),
    name: textOrNa(item.product_name),
    description: textOrNa(item.product_description ?? item.description),
    category: textOrNa(item.product_category ?? item.category),
    price,
    image: images[0],
    isActive: Boolean(isActive),
    rating: formatProductRating(item.rating),
    stockCount: pickStockCount(item),
    length: dimensions.length,
    width: dimensions.width,
    thick: dimensions.thick,
    currency: normalizeCurrencyCode(item.currency),
  };
}

export function mapProductApiToDetailItem(item: ProductApiResponse): ProductDetailItem {
  const base = mapProductApiToListItem(item);

  return {
    ...base,
    salePrice: item.sale_price ?? null,
    costPrice: item.cost_price ?? null,
    sku: textOrNa(item.sku),
    barcodeUpc: textOrNa(item.barcode_upc),
    weight: specOrZero(item.weight),
    taxClass: textOrNa(item.tax_class),
    publishStatus: textOrNa(item.publish_status),
    lowStockThreshold: item.low_stock_alert_threshold ?? null,
    stockManagement: textOrNa(item.stock_management),
    images: pickProductImages(item.product_images, item.image_urls, item.images),
  };
}

export function mapProductsApiResponse(items: ProductApiResponse[]): ProductListItem[] {
  return items
    .filter((item) => {
      if (item.product_status === false) return false;
      const status = (item.status ?? '').trim().toLowerCase();
      return status !== 'inactive';
    })
    .map(mapProductApiToListItem);
}

export function formatProductPrice(price: number, currency?: string | null): string {
  return formatMoney(price, currency);
}

export function formatProductStockLabel(stockCount: number): string {
  if (stockCount <= 0) {
    return 'Out of Stock';
  }

  return `In Stock · ${stockCount} units remaining`;
}
