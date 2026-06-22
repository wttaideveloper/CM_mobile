import type { ProductApiResponse, ProductListItem } from '@/types/product.types';

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
    .split(/x|×/i)
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

  if (/x|×/i.test(raw)) {
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

  return {
    id: item.id,
    enterpriseId: item.enterprise_id,
    enterpriseName: textOrNa(item.enterprise_name),
    name: textOrNa(item.product_name),
    description: textOrNa(item.product_description),
    category: textOrNa(item.product_category),
    price: item.product_price ?? 0,
    image: pickProductImage(item.product_images),
    isActive: item.product_status,
    rating: formatProductRating(item.rating),
    stockCount: pickStockCount(item),
    length: dimensions.length,
    width: dimensions.width,
    thick: dimensions.thick,
  };
}

export function mapProductsApiResponse(items: ProductApiResponse[]): ProductListItem[] {
  return items.map(mapProductApiToListItem);
}

export function formatProductPrice(price: number): string {
  if (!price) {
    return '$0';
  }

  return `$${price.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatProductStockLabel(stockCount: number): string {
  return `In Stock · ${stockCount} units`;
}
