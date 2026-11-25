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

export interface StoreProduct {
  id: number;
  name: string;
  slug: string;
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
  isInStock: boolean;
  averageRating: number;
  reviewCount: number;
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
}

export type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'discount';
