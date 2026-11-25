import AsyncStorage from '@react-native-async-storage/async-storage';

import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '@/data/fallbackCatalog';
import { STORE_INFO } from '@/theme/tokens';
import type {
  ProductVariation,
  StoreCategory,
  StoreProduct,
} from '@/types/store';
import { decodeHtmlEntities, htmlToPlainText } from '@/utils/format';

const CATALOG_CACHE_KEY = 'poco_naturals_catalog_cache_v1';
const REQUEST_TIMEOUT_MS = 9000;
const PER_PAGE = 50;
const MAX_PAGES = 5;

export interface RawWooCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  permalink?: string;
}

export interface RawWooVariation {
  id: number;
  attributes?: {
    name?: string;
    value?: string;
  }[];
}

export interface RawWooProduct {
  id: number;
  name: string;
  slug: string;
  type?: string;
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
  images?: {
    id: number;
    src: string;
    thumbnail?: string;
    alt?: string;
  }[];
  categories?: {
    id: number;
    name: string;
    slug: string;
  }[];
  variations?: RawWooVariation[];
  is_in_stock?: boolean;
  average_rating?: string | number;
  review_count?: number;
}

interface CachedCatalogPayload {
  products: StoreProduct[];
  categories: StoreCategory[];
  savedAt: string;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${url}`);
    }
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export function mapCategory(raw: RawWooCategory): StoreCategory {
  return {
    id: raw.id,
    name: decodeHtmlEntities(raw.name),
    slug: raw.slug,
    description: htmlToPlainText(raw.description ?? ''),
    count: raw.count ?? 0,
    permalink:
      raw.permalink ?? `${STORE_INFO.baseUrl}/product-category/${raw.slug}/`,
  };
}

function mapVariation(raw: RawWooVariation): ProductVariation {
  const attributes = (raw.attributes ?? []).map((attr) => ({
    name: decodeHtmlEntities(attr.name ?? ''),
    value: decodeHtmlEntities(attr.value ?? ''),
  }));
  const label =
    attributes
      .map((a) => a.value)
      .filter(Boolean)
      .join(' / ') || `Option #${raw.id}`;

  return {
    id: raw.id,
    label,
    attributes,
  };
}

export function mapProduct(raw: RawWooProduct): StoreProduct {
  const minorUnits = raw.prices?.currency_minor_unit ?? 2;
  const divisor = Math.pow(10, minorUnits);
  const price = Number(raw.prices?.price ?? 0) / divisor;
  const regularPrice =
    Number(raw.prices?.regular_price ?? raw.prices?.price ?? 0) / divisor;
  const salePrice =
    Number(raw.prices?.sale_price ?? raw.prices?.price ?? 0) / divisor;

  const variations =
    Array.isArray(raw.variations) && raw.variations.length > 0
      ? raw.variations.map(mapVariation)
      : undefined;

  return {
    id: raw.id,
    name: decodeHtmlEntities(raw.name),
    slug: raw.slug,
    type: raw.type ?? 'simple',
    permalink: raw.permalink,
    sku: raw.sku ?? '',
    shortDescription: htmlToPlainText(raw.short_description ?? ''),
    description: htmlToPlainText(
      raw.description || raw.short_description || ''
    ),
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
    variations,
    isInStock: raw.is_in_stock !== false,
    averageRating: Number(raw.average_rating ?? 0),
    reviewCount: Number(raw.review_count ?? 0),
  };
}

async function fetchAllProductPages(): Promise<RawWooProduct[]> {
  const firstRes = await fetchWithTimeout(
    `${STORE_INFO.storeApiBase}/products?per_page=${PER_PAGE}&page=1`
  );
  const firstPage = (await firstRes.json()) as RawWooProduct[];
  const totalPagesHeader = Number(firstRes.headers.get('X-WP-TotalPages') || 1);
  const totalPages = Math.min(
    MAX_PAGES,
    Number.isFinite(totalPagesHeader) && totalPagesHeader > 1
      ? totalPagesHeader
      : 1
  );

  if (totalPages <= 1) {
    return firstPage;
  }

  const pagePromises: Promise<RawWooProduct[]>[] = [];
  for (let page = 2; page <= totalPages; page++) {
    pagePromises.push(
      fetchWithTimeout(
        `${STORE_INFO.storeApiBase}/products?per_page=${PER_PAGE}&page=${page}`
      ).then((r) => r.json() as Promise<RawWooProduct[]>)
    );
  }

  const remainingPages = await Promise.all(pagePromises);
  return [firstPage, ...remainingPages].flat();
}

export async function fetchVariationDetails(
  variationId: number
): Promise<{ price: number; regularPrice: number; isInStock: boolean } | null> {
  try {
    const res = await fetchWithTimeout(
      `${STORE_INFO.storeApiBase}/products/${variationId}`
    );
    const raw = (await res.json()) as RawWooProduct;
    const mapped = mapProduct(raw);
    return {
      price: mapped.price,
      regularPrice: mapped.regularPrice,
      isInStock: mapped.isInStock,
    };
  } catch {
    return null;
  }
}

async function loadCachedCatalog(): Promise<CachedCatalogPayload | null> {
  try {
    const raw = await AsyncStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedCatalogPayload;
    if (Array.isArray(parsed.products) && parsed.products.length > 0) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

async function saveCachedCatalog(
  products: StoreProduct[],
  categories: StoreCategory[]
): Promise<void> {
  try {
    const payload: CachedCatalogPayload = {
      products,
      categories,
      savedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage write errors
  }
}

export interface CatalogFetchResult {
  products: StoreProduct[];
  categories: StoreCategory[];
  isLive: boolean;
}

/**
 * Fetches all live products & categories from poconaturals.in's WooCommerce Store API.
 * Persists live responses to AsyncStorage and falls back to the last-synced cache
 * (or bundled catalog) when offline.
 */
export async function fetchStoreCatalog(): Promise<CatalogFetchResult> {
  try {
    const [rawProducts, categoriesRes] = await Promise.all([
      fetchAllProductPages(),
      fetchWithTimeout(
        `${STORE_INFO.storeApiBase}/products/categories?per_page=50`
      ),
    ]);
    const rawCategories = (await categoriesRes.json()) as RawWooCategory[];

    const products = rawProducts.map(mapProduct);
    const categories = rawCategories
      .map(mapCategory)
      .filter((c) => c.count > 0);

    if (products.length > 0) {
      const resolvedCategories =
        categories.length > 0 ? categories : FALLBACK_CATEGORIES;
      await saveCachedCatalog(products, resolvedCategories);
      return {
        products,
        categories: resolvedCategories,
        isLive: true,
      };
    }
  } catch {
    // Fall through to cached or bundled catalog
  }

  const cached = await loadCachedCatalog();
  if (cached) {
    return {
      products: cached.products,
      categories:
        cached.categories.length > 0 ? cached.categories : FALLBACK_CATEGORIES,
      isLive: false,
    };
  }

  return {
    products: FALLBACK_PRODUCTS,
    categories: FALLBACK_CATEGORIES,
    isLive: false,
  };
}
