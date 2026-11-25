import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { fetchStoreCatalog } from '@/api/woocommerce';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '@/data/fallbackCatalog';
import type { CartItem, StoreCategory, StoreProduct } from '@/types/store';

const CART_STORAGE_KEY = 'poco_naturals_cart_v1';
const WISHLIST_STORAGE_KEY = 'poco_naturals_wishlist_v1';

interface PersistedCartEntry {
  productId: number;
  quantity: number;
  product?: StoreProduct;
}

interface StoreContextValue {
  // Catalog
  products: StoreProduct[];
  categories: StoreCategory[];
  isLoadingCatalog: boolean;
  isLiveData: boolean;
  lastSyncedAt: Date | null;
  refreshCatalog: () => Promise<void>;
  getProductById: (id: number) => StoreProduct | undefined;

  // Cart
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  mrpTotal: number;
  totalSavings: number;
  addToCart: (product: StoreProduct, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number) => number;

  // Wishlist
  wishlistIds: number[];
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (productId: number) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function triggerLightHaptic() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<StoreProduct[]>(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState<StoreCategory[]>(FALLBACK_CATEGORIES);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isLiveData, setIsLiveData] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [hasHydratedStorage, setHasHydratedStorage] = useState(false);

  // Load persisted cart & wishlist
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [rawCart, rawWishlist] = await Promise.all([
          AsyncStorage.getItem(CART_STORAGE_KEY),
          AsyncStorage.getItem(WISHLIST_STORAGE_KEY),
        ]);
        if (!mounted) return;

        if (rawCart) {
          const parsed = JSON.parse(rawCart) as PersistedCartEntry[];
          const hydrated: CartItem[] = [];
          for (const entry of parsed) {
            const matched =
              FALLBACK_PRODUCTS.find((p) => p.id === entry.productId) ??
              entry.product;
            if (matched && entry.quantity > 0) {
              hydrated.push({ product: matched, quantity: entry.quantity });
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
        // Ignore storage read errors and start fresh
      } finally {
        if (mounted) setHasHydratedStorage(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Persist cart on change
  useEffect(() => {
    if (!hasHydratedStorage) return;
    const payload: PersistedCartEntry[] = cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      product: item.product,
    }));
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [cartItems, hasHydratedStorage]);

  // Persist wishlist on change
  useEffect(() => {
    if (!hasHydratedStorage) return;
    AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds)).catch(() => {});
  }, [wishlistIds, hasHydratedStorage]);

  const refreshCatalog = useCallback(async () => {
    setIsLoadingCatalog(true);
    const result = await fetchStoreCatalog();
    setProducts(result.products);
    setCategories(result.categories);
    setIsLiveData(result.isLive);
    setLastSyncedAt(new Date());
    setIsLoadingCatalog(false);

    // Refresh cart item prices/details with latest catalog data
    setCartItems((prev) =>
      prev.map((item) => {
        const updated = result.products.find((p) => p.id === item.product.id);
        return updated ? { ...item, product: updated } : item;
      })
    );
  }, []);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  const getProductById = useCallback(
    (id: number) => products.find((p) => p.id === id),
    [products]
  );

  const addToCart = useCallback((product: StoreProduct, quantity = 1) => {
    if (quantity <= 0) return;
    triggerLightHaptic();
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, product, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    triggerLightHaptic();
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    triggerLightHaptic();
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getItemQuantity = useCallback(
    (productId: number) =>
      cartItems.find((item) => item.product.id === productId)?.quantity ?? 0,
    [cartItems]
  );

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

  const cartTotals = useMemo(() => {
    let cartCount = 0;
    let subtotal = 0;
    let mrpTotal = 0;

    for (const item of cartItems) {
      cartCount += item.quantity;
      subtotal += item.product.price * item.quantity;
      mrpTotal +=
        Math.max(item.product.regularPrice, item.product.price) * item.quantity;
    }

    return {
      cartCount,
      subtotal,
      mrpTotal,
      totalSavings: Math.max(0, mrpTotal - subtotal),
    };
  }, [cartItems]);

  const value = useMemo<StoreContextValue>(
    () => ({
      products,
      categories,
      isLoadingCatalog,
      isLiveData,
      lastSyncedAt,
      refreshCatalog,
      getProductById,
      cartItems,
      ...cartTotals,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getItemQuantity,
      wishlistIds,
      isWishlisted,
      toggleWishlist,
    }),
    [
      products,
      categories,
      isLoadingCatalog,
      isLiveData,
      lastSyncedAt,
      refreshCatalog,
      getProductById,
      cartItems,
      cartTotals,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getItemQuantity,
      wishlistIds,
      isWishlisted,
      toggleWishlist,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
