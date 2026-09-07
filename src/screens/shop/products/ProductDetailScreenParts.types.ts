import type { ProductDetailItem } from '@/types/product.types';
import { formatProductPrice, formatProductStockLabel } from '@/utils/product.mapper';

export type ProductSpec = {
  value: string;
  label: string;
};

export type ProductViewModel = {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: string;
  unitPrice: number;
  currency: string;
  originalPrice: string | null;
  rating: string;
  reviewLabel: string;
  description: string;
  specs: ProductSpec[];
  stockLabel: string;
  stockCount: number;
  inStock: boolean;
  images: string[];
  image: string;
};

export function mapApiProductToViewModel(product: ProductDetailItem): ProductViewModel {
  const specs: ProductSpec[] = [
    { value: product.length, label: 'Length' },
    { value: product.width, label: 'Width' },
    { value: product.thick, label: 'Thickness' },
    { value: product.weight, label: 'Weight' },
    { value: product.sku, label: 'SKU' },
    { value: product.barcodeUpc, label: 'Barcode' },
  ].filter((spec) => spec.value !== '0' && spec.value !== 'NA');

  const hasSale =
    product.salePrice != null &&
    product.salePrice > 0 &&
    product.salePrice < product.price;

  const unitPrice = hasSale ? product.salePrice! : product.price;
  const ratingValue = Number.parseFloat(product.rating) || 0;

  const images = product.images.length > 0 ? product.images : [product.image];

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.enterpriseName,
    price: formatProductPrice(unitPrice, product.currency),
    unitPrice,
    currency: product.currency,
    originalPrice: hasSale
      ? formatProductPrice(product.price, product.currency)
      : null,
    rating: product.rating,
    reviewLabel: ratingValue > 0 ? `${product.rating} rating` : 'No ratings yet',
    description: product.description,
    specs,
    stockLabel: formatProductStockLabel(product.stockCount),
    stockCount: product.stockCount,
    inStock: product.stockCount > 0 && product.isActive,
    images,
    image: images[0] ?? product.image,
  };
}
