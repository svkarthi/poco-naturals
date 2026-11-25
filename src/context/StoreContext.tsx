import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { fetchStoreCatalog } from '@/api/woocommerce';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '@/data/fallbackCatalog';
import {
  makeCartKey,
  type CartItem,
  type StoreCategory,
  type StoreProduct,
} from '@/types/store';

const CART_STORAGE_KEY = 'poco_naturals_cart_v2';
const LEGACY_CART_STORAGE_KEY = 'poco_naturals_cart_v1';
const WISHLIST_STORAGE_KEY = 'poco_naturals_wishlist_v1';

interface PersistedCartEntry {
  cartKey?: string;
  productId: number;
  variationId?: number;
  variationLabel?: string;
  unitPrice?: number;
  unitRegularPrice?: number;
  quantity: number;
  product?: StoreProduct;
}

export interface AddToCartOptions {
  quantity?: number;
  variationId?: number;
  variationLabel?: string;
  unitPrice?: number;
  unitRegularPrice?: number;
}

export interface CatalogContextValue {
  products: StoreProduct[];
  categories: StoreCategory[];
  isLoadingCatalog: boolean;
  isLiveData: boolean;
  lastSyncedAt: Date | null;
  refreshCatalog: () => Promise<void>;
  getProductById: (id: number) => StoreProduct | undefined;
}

export interface CartContextValue {
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  mrpTotal: number;
  totalSavings: number;
  addToCart: (product: StoreProduct, options?: number | AddToCartOptions) => void;
  updateQuantity: (cartKeyOrProductId: string | number, quantity: number) => void;
  removeFromCart: (cartKeyOrProductId: string | number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number, variationId?: number) => number;
}

export interface WishlistContextValue {
  wishlistIds: number[];
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (productId: number) => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);
const CartContext = createContext<CartContextValue | null>(null);
const WishlistContext = createContext<WishlistContextValue | null>(null);

function triggerLightHaptic() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

function resolveKey(cartKeyOrProductId: string | number): string {
  return typeof cartKeyOrProductId === 'number'
    ? makeCartKey(cartKeyOrProductId)
    : cartKeyOrProductId;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // 1. Catalog State
  const [products, setProducts] = useState<StoreProduct[]>(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState<StoreCategory[]>(FALLBACK_CATEGORIES);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isLiveData, setIsLiveData] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // 2. Cart & Wishlist State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const hasHydratedRef = useRef(false);

  // Hydrate persisted Cart & Wishlist once on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [rawCartV2, rawCartV1, rawWishlist] = await Promise.all([
          AsyncStorage.getItem(CART_STORAGE_KEY),
          AsyncStorage.getItem(LEGACY_CART_STORAGE_KEY),
          AsyncStorage.getItem(WISHLIST_STORAGE_KEY),
        ]);
        if (!mounted) return;

        const rawCart = rawCartV2 ?? rawCartV1;
        if (rawCart) {
          const parsed = JSON.parse(rawCart) as PersistedCartEntry[];
          const hydrated: CartItem[] = [];
          for (const entry of parsed) {
            const matched =
              FALLBACK_PRODUCTS.find((p) => p.id === entry.productId) ??
              entry.product;
            if (matched && entry.quantity > 0) {
              const unitPrice = entry.unitPrice ?? matched.price;
              const unitRegularPrice =
                entry.unitRegularPrice ?? matched.regularPrice;
              hydrated.push({
                cartKey:
                  entry.cartKey ??
                  makeCartKey(matched.id, entry.variationId),
                product: matched,
                quantity: entry.quantity,
                variationId: entry.variationId,
                variationLabel: entry.variationLabel,
                unitPrice,
                unitRegularPrice,
              });
            }
          }
          setCartItems(hydrated);
        }

        if (rawWishlist) {
          const parsedIds = JSON.parse(rawWishlist) as number[];
          if (Array.isArray(parsedIds)) {
            setWishlistIds(parsedIds);
          }
        }
      } catch {
        // Ignore corrupt storage and start cleanly
      } finally {
        if (mounted) {
          hasHydratedRef.current = true;
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Persist cart on change
  useEffect(() => {
    if (!hasHydratedRef.current) return;
    const payload: PersistedCartEntry[] = cartItems.map((item) => ({
      cartKey: item.cartKey,
      productId: item.product.id,
      variationId: item.variationId,
      variationLabel: item.variationLabel,
      unitPrice: item.unitPrice,
      unitRegularPrice: item.unitRegularPrice,
      quantity: item.quantity,
      product: item.product,
    }));
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload)).catch(
      () => {}
    );
  }, [cartItems]);

  // Persist wishlist on change
  useEffect(() => {
    if (!hasHydratedRef.current) return;
    AsyncStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify(wishlistIds)
    ).catch(() => {});
  }, [wishlistIds]);

  const applyCatalogResult = useCallback(
    (result: Awaited<ReturnType<typeof fetchStoreCatalog>>) => {
      setProducts(result.products);
      setCategories(result.categories);
      setIsLiveData(result.isLive);
      setLastSyncedAt(new Date());
      setIsLoadingCatalog(false);

      // Sync simple-product prices in cart when live catalog updates
      setCartItems((prev) =>
        prev.map((item) => {
          const updated = result.products.find((p) => p.id === item.product.id);
          if (!updated) return item;
          return {
            ...item,
            product: updated,
            unitPrice: item.variationId ? item.unitPrice : updated.price,
            unitRegularPrice: item.variationId
              ? item.unitRegularPrice
              : updated.regularPrice,
          };
        })
      );
    },
    []
  );

  const refreshCatalog = useCallback(async () => {
    setIsLoadingCatalog(true);
    const result = await fetchStoreCatalog();
    applyCatalogResult(result);
  }, [applyCatalogResult]);

  useEffect(() => {
    let active = true;
    fetchStoreCatalog().then((result) => {
      if (active) {
        applyCatalogResult(result);
      }
    });
    return () => {
      active = false;
    };
  }, [applyCatalogResult]);

  const getProductById = useCallback(
    (id: number) => products.find((p) => p.id === id),
    [products]
  );

  // Cart Actions
  const addToCart = useCallback(
    (product: StoreProduct, options?: number | AddToCartOptions) => {
      const opts: AddToCartOptions =
        typeof options === 'number' ? { quantity: options } : options ?? {};
      const quantity = opts.quantity ?? 1;
      if (quantity <= 0) return;

      const variationId = opts.variationId;
      const cartKey = makeCartKey(product.id, variationId);
      const unitPrice = opts.unitPrice ?? product.price;
      const unitRegularPrice = opts.unitRegularPrice ?? product.regularPrice;

      triggerLightHaptic();
      setCartItems((prev) => {
        const existing = prev.find((item) => item.cartKey === cartKey);
        if (existing) {
          return prev.map((item) =>
            item.cartKey === cartKey
              ? {
                  ...item,
                  product,
                  unitPrice,
                  unitRegularPrice,
                  variationLabel: opts.variationLabel ?? item.variationLabel,
                  quantity: item.quantity + quantity,
                }
              : item
          );
        }
        return [
          ...prev,
          {
            cartKey,
            product,
            quantity,
            variationId,
            variationLabel: opts.variationLabel,
            unitPrice,
            unitRegularPrice,
          },
        ];
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (cartKeyOrProductId: string | number, quantity: number) => {
      const key = resolveKey(cartKeyOrProductId);
      triggerLightHaptic();
      setCartItems((prev) => {
        if (quantity <= 0) {
          return prev.filter((item) => item.cartKey !== key);
        }
        return prev.map((item) =>
          item.cartKey === key ? { ...item, quantity } : item
        );
      });
    },
    []
  );

  const removeFromCart = useCallback((cartKeyOrProductId: string | number) => {
    const key = resolveKey(cartKeyOrProductId);
    triggerLightHaptic();
    setCartItems((prev) => prev.filter((item) => item.cartKey !== key));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getItemQuantity = useCallback(
    (productId: number, variationId?: number) => {
      if (variationId !== undefined) {
        const key = makeCartKey(productId, variationId);
        return cartItems.find((i) => i.cartKey === key)?.quantity ?? 0;
      }
      return cartItems
        .filter((i) => i.product.id === productId)
        .reduce((sum, i) => sum + i.quantity, 0);
    },
    [cartItems]
  );

  const cartTotals = useMemo(() => {
    let cartCount = 0;
    let subtotal = 0;
    let mrpTotal = 0;

    for (const item of cartItems) {
      cartCount += item.quantity;
      subtotal += item.unitPrice * item.quantity;
      mrpTotal +=
        Math.max(item.unitRegularPrice, item.unitPrice) * item.quantity;
    }

    return {
      cartCount,
      subtotal,
      mrpTotal,
      totalSavings: Math.max(0, mrpTotal - subtotal),
    };
  }, [cartItems]);

  // Wishlist Actions
  const isWishlisted = useCallback(
    (productId: number) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback((productId: number) => {
    triggerLightHaptic();
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const catalogValue = useMemo<CatalogContextValue>(
    () => ({
      products,
      categories,
      isLoadingCatalog,
      isLiveData,
      lastSyncedAt,
      refreshCatalog,
      getProductById,
    }),
    [
      products,
      categories,
      isLoadingCatalog,
      isLiveData,
      lastSyncedAt,
      refreshCatalog,
      getProductById,
    ]
  );

  const cartValue = useMemo<CartContextValue>(
    () => ({
      cartItems,
      ...cartTotals,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getItemQuantity,
    }),
    [
      cartItems,
      cartTotals,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getItemQuantity,
    ]
  );

  const wishlistValue = useMemo<WishlistContextValue>(
    () => ({
      wishlistIds,
      isWishlisted,
      toggleWishlist,
    }),
    [wishlistIds, isWishlisted, toggleWishlist]
  );

  return (
    <CatalogContext.Provider value={catalogValue}>
      <CartContext.Provider value={cartValue}>
        <WishlistContext.Provider value={wishlistValue}>
          {children}
        </WishlistContext.Provider>
      </CartContext.Provider>
    </CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within StoreProvider');
  return ctx;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within StoreProvider');
  return ctx;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within StoreProvider');
  return ctx;
}

export function useStore() {
  const catalog = useCatalog();
  const cart = useCart();
  const wishlist = useWishlist();
  return { ...catalog, ...cart, ...wishlist };
}
