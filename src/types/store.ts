export interface ProductImage {
  id: number;
  src: string;
  thumbnail?: string;
  alt: string;
}

export interface ProductCategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface StoreCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  permalink: string;
}

export interface ProductVariationAttribute {
  name: string;
  value: string;
}

export interface ProductVariation {
  id: number;
  label: string;
  attributes: ProductVariationAttribute[];
  price?: number;
  regularPrice?: number;
  isInStock?: boolean;
}

export interface StoreProduct {
  id: number;
  name: string;
  slug: string;
  type?: string;
  permalink: string;
  sku: string;
  shortDescription: string;
  description: string;
  onSale: boolean;
  price: number;         // INR major units (e.g., 79)
  regularPrice: number;  // INR major units (e.g., 110)
  salePrice: number;     // INR major units (e.g., 79)
  currencySymbol: string;
  images: ProductImage[];
  categories: ProductCategoryRef[];
  variations?: ProductVariation[];
  isInStock: boolean;
  averageRating: number;
  reviewCount: number;
}

export interface CartItem {
  cartKey: string;       // `${productId}:${variationId ?? 0}`
  product: StoreProduct;
  quantity: number;
  variationId?: number;
  variationLabel?: string;
  unitPrice: number;
  unitRegularPrice: number;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  link: string;
  featuredImage?: string;
}

export type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'discount';

export function makeCartKey(productId: number, variationId?: number): string {
  return `${productId}:${variationId ?? 0}`;
}
