import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewNavigation,
  type WebViewProps,
} from 'react-native-webview';

import { useCart } from '@/context/StoreContext';
import { COLORS, RADIUS, SPACING, STORE_INFO } from '@/theme/tokens';
import { resolveExternalCheckoutUrl } from '@/utils/deepLinks';
import { formatInr } from '@/utils/format';

type ShouldStartRequest = Parameters<
  NonNullable<WebViewProps['onShouldStartLoadWithRequest']>
>[0];

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, subtotal, clearCart } = useCart();
  const [hasSynced, setHasSynced] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [syncState, setSyncState] = useState<
    'syncing' | 'ready' | 'completed' | 'error'
  >('syncing');
  const [statusMessage, setStatusMessage] = useState(
    'Syncing your basket with poconaturals.in...'
  );

  // Build an injected JS script that runs ONLY on /cart/ inside the WebView session,
  // syncs the native cart via WooCommerce's Store API (batch endpoint with sequential
  // fallback), and navigates to /checkout/.
  const syncScript = useMemo(() => {
    const payload = JSON.stringify(
      cartItems.map((item) => ({
        id: item.variationId ?? item.product.id,
        quantity: item.quantity,
      }))
    );

    return `
      (async function syncPocoCart() {
        try {
          var cleanPath = (window.location.pathname || '').replace(/\\/+$/, '');
          if (cleanPath !== '/cart') {
            return;
          }
          if (window.__POCO_SYNCED__) return;
          window.__POCO_SYNCED__ = true;

          var items = ${payload};
          if (!items.length) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
            return;
          }

          var cartRes = await fetch('/wp-json/wc/store/v1/cart', { credentials: 'include' });
          var nonce = cartRes.headers.get('Nonce') || cartRes.headers.get('X-WC-Store-API-Nonce') || '';
          var existing = await cartRes.json();
          var oldItems = (existing && Array.isArray(existing.items)) ? existing.items : [];

          var batchRequests = [];
          for (var i = 0; i < oldItems.length; i++) {
            batchRequests.push({
              path: '/wc/store/v1/cart/remove-item',
              method: 'POST',
              headers: { 'Nonce': nonce },
              body: { key: oldItems[i].key }
            });
          }
          for (var j = 0; j < items.length; j++) {
            batchRequests.push({
              path: '/wc/store/v1/cart/add-item',
              method: 'POST',
              headers: { 'Nonce': nonce },
              body: { id: items[j].id, quantity: items[j].quantity }
            });
          }

          var batchOk = false;
          if (batchRequests.length > 0 && batchRequests.length <= 25) {
            try {
              var batchRes = await fetch('/wp-json/wc/store/v1/batch', {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                  'Nonce': nonce
                },
                body: JSON.stringify({ requests: batchRequests })
              });
              batchOk = batchRes.ok;
            } catch (_) {
              batchOk = false;
            }
          }

          if (!batchOk) {
            for (var k = 0; k < oldItems.length; k++) {
              await fetch('/wp-json/wc/store/v1/cart/remove-item', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'Nonce': nonce },
                body: JSON.stringify({ key: oldItems[k].key })
              });
            }
            for (var m = 0; m < items.length; m++) {
              await fetch('/wp-json/wc/store/v1/cart/add-item', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'Nonce': nonce },
                body: JSON.stringify({ id: items[m].id, quantity: items[m].quantity })
              });
            }
          }

          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SYNCED' }));
          window.location.replace('${STORE_INFO.baseUrl}/checkout/');
        } catch (err) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'SYNC_ERROR', message: String(err) })
          );
          window.location.replace('${STORE_INFO.baseUrl}/checkout/');
        }
      })();
      true;
    `;
  }, [cartItems]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type: string;
        message?: string;
      };
      if (data.type === 'SYNCED') {
        setHasSynced(true);
        setStatusMessage('Loading secure checkout...');
      } else if (data.type === 'READY' || data.type === 'SYNC_ERROR') {
        setHasSynced(true);
        setSyncState('ready');
      }
    } catch {
      // Ignore non-JSON messages emitted by third-party payment SDKs
    }
  }, []);

  const handleNavigationChange = useCallback(
    (navState: WebViewNavigation) => {
      const url = navState.url || '';
      if (url.includes('/checkout/order-received/')) {
        setSyncState('completed');
        clearCart();
        return;
      }
      if (url.includes('/checkout') && !navState.loading) {
        setHasSynced(true);
        setSyncState('ready');
      }
    },
    [clearCart]
  );

  // Intercept UPI / GPay / PhonePe / Paytm / WhatsApp / tel / mailto deep links
  const handleShouldStartLoad = useCallback(
    (request: ShouldStartRequest): boolean => {
      const resolution = resolveExternalCheckoutUrl(request.url);
      if (!resolution.shouldIntercept || !resolution.targetUrl) {
        return true;
      }

      const target = resolution.targetUrl;
      const fallback = resolution.fallbackUrl;

      Linking.openURL(target).catch(() => {
        if (fallback && (fallback.startsWith('https://') || fallback.startsWith('http://'))) {
          Linking.openURL(fallback).catch(() => {});
        } else {
          Alert.alert(
            'Payment App Not Found',
            'Could not open the selected UPI or payment app on this device. Please choose another payment method on the checkout page.'
          );
        }
      });

      return false;
    },
    []
  );

  // Web preview fallback (react-native-webview is native iOS/Android only)
  if (Platform.OS === 'web') {
    const firstItem = cartItems[0];
    const targetProductId = firstItem
      ? firstItem.variationId ?? firstItem.product.id
      : undefined;
    const checkoutUrl =
      firstItem && targetProductId
        ? `${STORE_INFO.baseUrl}/checkout/?add-to-cart=${targetProductId}&quantity=${firstItem.quantity}`
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
        key={reloadKey}
        source={{ uri: `${STORE_INFO.baseUrl}/cart/` }}
        originWhitelist={['*']}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onLoadEnd={() => {
          if (hasSynced && syncState === 'syncing') {
            setSyncState('ready');
          }
        }}
        injectedJavaScript={!hasSynced ? syncScript : undefined}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationChange}
        onError={() => setSyncState('error')}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
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
              onPress={() => {
                setHasSynced(false);
                setSyncState('syncing');
                setReloadKey((k) => k + 1);
              }}
              style={styles.webBtn}
            >
              <Text style={styles.webBtnText}>Try Again</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={styles.webSecondary}>
              <Text style={styles.webSecondaryText}>Return to Cart</Text>
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
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(251, 252, 252, 0.94)',
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
