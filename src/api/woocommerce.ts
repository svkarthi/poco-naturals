import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '@/data/fallbackCatalog';
import { STORE_INFO } from '@/theme/tokens';
import type { StoreCategory, StoreProduct } from '@/types/store';
import { decodeHtmlEntities, htmlToPlainText } from '@/utils/format';

interface RawWooCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  permalink?: string;
}

interface RawWooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  sku?: string;
  short_description?: string;
  description?: string;
  on_sale?: boolean;
  prices?: {
    price?: string;
    regular_price?: string;
    sale_price?: string;
    currency_symbol?: string;
    currency_minor_unit?: number;
  };
  images?: Array<{
    id: number;
    src: string;
    thumbnail?: string;
    alt?: string;
  }>;
  categories?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  is_in_stock?: boolean;
  average_rating?: string | number;
  review_count?: number;
}

const REQUEST_TIMEOUT_MS = 9000;

async function fetchJsonWithTimeout<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${url}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function mapCategory(raw: RawWooCategory): StoreCategory {
  return {
    id: raw.id,
    name: decodeHtmlEntities(raw.name),
    slug: raw.slug,
    description: htmlToPlainText(raw.description ?? ''),
    count: raw.count ?? 0,
    permalink: raw.permalink ?? `${STORE_INFO.baseUrl}/product-category/${raw.slug}/`,
  };
}

function mapProduct(raw: RawWooProduct): StoreProduct {
  const minorUnits = raw.prices?.currency_minor_unit ?? 2;
  const divisor = Math.pow(10, minorUnits);
  const price = Number(raw.prices?.price ?? 0) / divisor;
  const regularPrice = Number(raw.prices?.regular_price ?? raw.prices?.price ?? 0) / divisor;
  const salePrice = Number(raw.prices?.sale_price ?? raw.prices?.price ?? 0) / divisor;

  return {
    id: raw.id,
    name: decodeHtmlEntities(raw.name),
    slug: raw.slug,
    permalink: raw.permalink,
    sku: raw.sku ?? '',
    shortDescription: htmlToPlainText(raw.short_description ?? ''),
    description: htmlToPlainText(raw.description || raw.short_description || ''),
    onSale: Boolean(raw.on_sale && regularPrice > price),
    price,
    regularPrice,
    salePrice,
    currencySymbol: raw.prices?.currency_symbol || '₹',
    images: (raw.images ?? []).map((img) => ({
      id: img.id,
      src: img.src,
      thumbnail: img.thumbnail || img.src,
      alt: decodeHtmlEntities(img.alt || raw.name),
    })),
    categories: (raw.categories ?? []).map((cat) => ({
      id: cat.id,
      name: decodeHtmlEntities(cat.name),
      slug: cat.slug,
    })),
    isInStock: raw.is_in_stock !== false,
    averageRating: Number(raw.average_rating ?? 0),
    reviewCount: Number(raw.review_count ?? 0),
  };
}

export interface CatalogFetchResult {
  products: StoreProduct[];
  categories: StoreCategory[];
  isLive: boolean;
}

/**
 * Fetches live products and categories from poconaturals.in's public WooCommerce Store API.
 * Gracefully falls back to the bundled catalog if offline or unreachable.
 */
export async function fetchStoreCatalog(): Promise<CatalogFetchResult> {
  try {
    const [rawProducts, rawCategories] = await Promise.all([
      fetchJsonWithTimeout<RawWooProduct[]>(
        `${STORE_INFO.storeApiBase}/products?per_page=50`
      ),
      fetchJsonWithTimeout<RawWooCategory[]>(
        `${STORE_INFO.storeApiBase}/products/categories?per_page=30`
      ),
    ]);

    const products = rawProducts.map(mapProduct);
    const categories = rawCategories
      .map(mapCategory)
      .filter((c) => c.count > 0);

    if (products.length === 0) {
      return {
        products: FALLBACK_PRODUCTS,
        categories: FALLBACK_CATEGORIES,
        isLive: false,
      };
    }

    return {
      products,
      categories: categories.length > 0 ? categories : FALLBACK_CATEGORIES,
      isLive: true,
    };
  } catch {
    return {
      products: FALLBACK_PRODUCTS,
      categories: FALLBACK_CATEGORIES,
      isLive: false,
    };
  }
}
