import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';

import { useStore } from '@/context/StoreContext';
import { COLORS, RADIUS, SPACING, STORE_INFO } from '@/theme/tokens';
import { formatInr } from '@/utils/format';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, subtotal, clearCart } = useStore();
  const hasSyncedRef = useRef(false);

  const [syncState, setSyncState] = useState<'syncing' | 'ready' | 'completed' | 'error'>(
    'syncing'
  );
  const [statusMessage, setStatusMessage] = useState(
    'Syncing your basket with poconaturals.in...'
  );

  // Build an injected JS script that runs inside the poconaturals.in WebView session
  // to sync the native cart items via WooCommerce's Store API before redirecting to /checkout/.
  const syncScript = useMemo(() => {
    const payload = JSON.stringify(
      cartItems.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
      }))
    );

    return `
      (async function syncPocoCart() {
        try {
          if (window.__POCO_SYNCED__) return;
          window.__POCO_SYNCED__ = true;
          const items = ${payload};
          if (!items.length) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
            return;
          }

          const cartRes = await fetch('/wp-json/wc/store/v1/cart', { credentials: 'include' });
          const nonce = cartRes.headers.get('Nonce') || cartRes.headers.get('X-WC-Store-API-Nonce') || '';
          const existing = await cartRes.json();

          // Clear stale web cart items so checkout matches the native cart exactly
          if (existing && Array.isArray(existing.items) && existing.items.length > 0) {
            for (const oldItem of existing.items) {
              await fetch('/wp-json/wc/store/v1/cart/remove-item', {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                  'Nonce': nonce,
                },
                body: JSON.stringify({ key: oldItem.key }),
              });
            }
          }

          // Add every native cart item
          for (const entry of items) {
            await fetch('/wp-json/wc/store/v1/cart/add-item', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Nonce': nonce,
              },
              body: JSON.stringify({ id: entry.id, quantity: entry.quantity }),
            });
          }

          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SYNCED' }));
          window.location.href = '${STORE_INFO.baseUrl}/checkout/';
        } catch (err) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'SYNC_ERROR', message: String(err) })
          );
          window.location.href = '${STORE_INFO.baseUrl}/checkout/';
        }
      })();
      true;
    `;
  }, [cartItems]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type: string;
        message?: string;
      };
      if (data.type === 'SYNCED') {
        hasSyncedRef.current = true;
        setStatusMessage('Loading secure checkout...');
      } else if (data.type === 'READY') {
        hasSyncedRef.current = true;
        setSyncState('ready');
      } else if (data.type === 'SYNC_ERROR') {
        hasSyncedRef.current = true;
        setSyncState('ready');
      }
    } catch {
      // Ignore non-JSON messages from payment gateways
    }
  };

  const handleNavigationChange = (navState: WebViewNavigation) => {
    const url = navState.url || '';
    if (url.includes('/checkout/order-received/')) {
      setSyncState('completed');
      clearCart();
      return;
    }
    if (url.includes('/checkout') && !navState.loading) {
      setSyncState('ready');
    }
  };

  // Web preview fallback (react-native-webview is native iOS/Android only)
  if (Platform.OS === 'web') {
    const firstItem = cartItems[0];
    const checkoutUrl = firstItem
      ? `${STORE_INFO.baseUrl}/checkout/?add-to-cart=${firstItem.product.id}&quantity=${firstItem.quantity}`
      : `${STORE_INFO.baseUrl}/checkout/`;

    return (
      <SafeAreaView style={styles.webFallback}>
        <Stack.Screen options={{ title: 'Checkout Handoff' }} />
        <View style={styles.webCard}>
          <Ionicons name="shield-checkmark" size={40} color={COLORS.primary} />
          <Text style={styles.webTitle}>Complete Payment on poconaturals.in</Text>
          <Text style={styles.webSub}>
            On iOS and Android, checkout opens directly inside the app with your
            full cart synced automatically. On web preview, continue in a new
            browser tab.
          </Text>
          <Text style={styles.webTotal}>
            Cart Total: {formatInr(subtotal)} ({cartItems.length} products)
          </Text>
          <Pressable
            onPress={() =>
              WebBrowser.openBrowserAsync(checkoutUrl).catch(() =>
                Linking.openURL(checkoutUrl)
              )
            }
            style={styles.webBtn}
          >
            <Text style={styles.webBtnText}>Open poconaturals.in Checkout</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.webSecondary}>
            <Text style={styles.webSecondaryText}>Back to Cart</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Secure Checkout',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="close" size={24} color={COLORS.primary} />
            </Pressable>
          ),
        }}
      />

      {syncState === 'completed' && (
        <View style={styles.completedBanner}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.textOnPrimary} />
          <Text style={styles.completedText}>
            Order placed! Your cart has been cleared.
          </Text>
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            style={styles.donePill}
          >
            <Text style={styles.donePillText}>Done</Text>
          </Pressable>
        </View>
      )}

      <WebView
        source={{ uri: `${STORE_INFO.baseUrl}/cart/` }}
        onLoadEnd={() => {
          if (hasSyncedRef.current && syncState === 'syncing') {
            setSyncState('ready');
          }
        }}
        injectedJavaScript={!hasSyncedRef.current ? syncScript : undefined}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationChange}
        onError={() => setSyncState('error')}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        style={styles.webview}
      />

      {syncState === 'syncing' && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.overlayTitle}>{statusMessage}</Text>
            <Text style={styles.overlaySub}>
              Preparing your UPI, Card & COD options
            </Text>
          </View>
        </View>
      )}

      {syncState === 'error' && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <Ionicons name="cloud-offline-outline" size={38} color={COLORS.accent} />
            <Text style={styles.overlayTitle}>Could not reach checkout</Text>
            <Text style={styles.overlaySub}>
              Please check your internet connection or complete your order via
              WhatsApp.
            </Text>
            <Pressable
              onPress={() => router.back()}
              style={styles.webBtn}
            >
              <Text style={styles.webBtnText}>Return to Cart</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webview: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250, 246, 240, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  overlayCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  overlayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 6,
  },
  overlaySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
  },
  completedText: {
    flex: 1,
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  donePill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  donePillText: {
    color: COLORS.textOnPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  webFallback: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  webCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  webTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  webSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  webTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  webBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: RADIUS.pill,
    marginTop: 4,
  },
  webBtnText: {
    color: COLORS.textOnPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  webSecondary: {
    paddingVertical: 6,
  },
  webSecondaryText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
