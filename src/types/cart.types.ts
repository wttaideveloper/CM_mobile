export type CartItemApiResponse = {
  id: string;
  product_id: string;
  product_name?: string | null;
  product_images?: string | null;
  sku?: string | null;
  quantity: number;
  unit_price: number;
  currency?: string | null;
  line_total?: number | null;
  stock_quantity?: number | null;
};

export type CartApiResponse = {
  id: string;
  user_id?: string | null;
  tenant_id?: string | null;
  status?: string | null;
  items: CartItemApiResponse[];
  subtotal?: number | null;
  currency?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AddToCartPayload = {
  product_id: string;
  quantity: number;
};

export type UpdateCartItemPayload = {
  itemId: string;
  quantity: number;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  image: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  lineTotal: number;
  stockQuantity: number;
};

export type Cart = {
  id: string;
  status: string;
  items: CartItem[];
  subtotal: number;
  currency: string;
};
