import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCart } from '@/context/StoreContext';
import { COLORS, RADIUS, SPACING, STORE_INFO } from '@/theme/tokens';
import { formatInr } from '@/utils/format';

export default function CartScreen() {
  const router = useRouter();
  const {
    cartItems,
    cartCount,
    subtotal,
    mrpTotal,
    totalSavings,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const remainingForFreeShipping = Math.max(
    0,
    STORE_INFO.freeShippingThreshold - subtotal
  );
  const shippingProgress = Math.min(
    1,
    subtotal / STORE_INFO.freeShippingThreshold
  );

  const handleWhatsAppOrder = () => {
    const lines = cartItems.map((item) => {
      const variantSuffix = item.variationLabel
        ? ` (${item.variationLabel})`
        : '';
      return `• ${item.product.name}${variantSuffix} × ${item.quantity} (${formatInr(
        item.unitPrice * item.quantity
      )})`;
    });
    const message = [
      `Hello POCO Naturals! I'd like to place an order:`,
      '',
      ...lines,
      '',
      `Subtotal: ${formatInr(subtotal)}`,
    ].join('\n');
    const url = `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    Linking.openURL(url).catch(() => {});
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Cart</Text>
        </View>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bag-handle-outline" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your basket is empty</Text>
          <Text style={styles.emptySubtitle}>
            Explore cold-pressed coconut oil, heirloom millets, raw forest honey
            and karupatti from Udumalaipettai.
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/shop')}
            style={styles.shopNowBtn}
          >
            <Text style={styles.shopNowText}>Browse Natural Foods</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Cart</Text>
          <Text style={styles.subtitle}>
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <Pressable onPress={clearCart} hitSlop={8}>
          <Text style={styles.clearText}>Clear all</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Free Shipping Progress */}
        <View style={styles.shippingCard}>
          <View style={styles.shippingTop}>
            <Ionicons
              name={
                remainingForFreeShipping === 0
                  ? 'checkmark-circle'
                  : 'cube-outline'
              }
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.shippingText}>
              {remainingForFreeShipping === 0
                ? 'You unlocked Free Delivery on this order!'
                : `Add ${formatInr(remainingForFreeShipping)} more for Free Delivery`}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(shippingProgress * 100)}%` },
              ]}
            />
          </View>
        </View>

        {/* Cart Items */}
        <View style={styles.itemsList}>
          {cartItems.map((item) => {
            const {
              cartKey,
              product,
              quantity,
              variationLabel,
              unitPrice,
              unitRegularPrice,
            } = item;

            return (
              <View key={cartKey} style={styles.itemCard}>
                <Pressable
                  onPress={() => router.push(`/product/${product.id}`)}
                  style={styles.thumbWrap}
                >
                  {product.images[0]?.src ? (
                    <Image
                      source={{ uri: product.images[0].src }}
                      style={styles.thumb}
                      contentFit="cover"
                    />
                  ) : (
                    <Ionicons
                      name="leaf-outline"
                      size={24}
                      color={COLORS.primary}
                    />
                  )}
                </Pressable>

                <View style={styles.itemInfo}>
                  <View style={styles.itemTopRow}>
                    <Pressable
                      onPress={() => router.push(`/product/${product.id}`)}
                      style={{ flex: 1 }}
                    >
                      <Text style={styles.itemName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      {variationLabel ? (
                        <Text style={styles.variantTag}>{variationLabel}</Text>
                      ) : null}
                    </Pressable>
                    <Pressable
                      onPress={() => removeFromCart(cartKey)}
                      hitSlop={8}
                      accessibilityLabel="Remove item"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={COLORS.textMuted}
                      />
                    </Pressable>
                  </View>

                  <View style={styles.itemBottomRow}>
                    <View>
                      <Text style={styles.itemPrice}>
                        {formatInr(unitPrice * quantity)}
                      </Text>
                      {unitRegularPrice > unitPrice && (
                        <Text style={styles.itemMrp}>
                          {formatInr(unitRegularPrice * quantity)}
                        </Text>
                      )}
                    </View>

                    <View style={styles.stepper}>
                      <Pressable
                        onPress={() => updateQuantity(cartKey, quantity - 1)}
                        style={styles.stepBtn}
                      >
                        <Ionicons name="remove" size={16} color={COLORS.primary} />
                      </Pressable>
                      <Text style={styles.stepQty}>{quantity}</Text>
                      <Pressable
                        onPress={() => updateQuantity(cartKey, quantity + 1)}
                        style={styles.stepBtn}
                      >
                        <Ionicons name="add" size={16} color={COLORS.primary} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Bill Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total MRP</Text>
            <Text style={styles.summaryValue}>{formatInr(mrpTotal)}</Text>
          </View>
          {totalSavings > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Store Discount</Text>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                −{formatInr(totalSavings)}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>
              {remainingForFreeShipping === 0 ? 'FREE' : 'Calculated at checkout'}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Estimated Total</Text>
            <Text style={styles.totalValue}>{formatInr(subtotal)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Checkout Footer */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => router.push('/checkout')}
          style={({ pressed }) => [
            styles.checkoutBtn,
            pressed && { opacity: 0.92 },
          ]}
        >
          <View>
            <Text style={styles.checkoutBtnTitle}>Proceed to Checkout</Text>
            <Text style={styles.checkoutBtnSub}>
              UPI, Cards & COD via poconaturals.in
            </Text>
          </View>
          <View style={styles.checkoutPricePill}>
            <Text style={styles.checkoutPriceText}>{formatInr(subtotal)}</Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={COLORS.textOnPrimary}
            />
          </View>
        </Pressable>

        <Pressable onPress={handleWhatsAppOrder} style={styles.whatsappBtn}>
          <Ionicons name="logo-whatsapp" size={17} color={COLORS.primary} />
          <Text style={styles.whatsappBtnText}>
            Or order quickly via WhatsApp
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  shippingCard: {
    backgroundColor: COLORS.primaryTint,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  shippingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shippingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
    flex: 1,
  },
  progressTrack: {
    height: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.borderStrong,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
  },
  itemsList: {
    gap: SPACING.md,
  },
  itemCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  thumbWrap: {
    width: 78,
    height: 78,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 19,
  },
  variantTag: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  itemMrp: {
    fontSize: 12,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.primaryTint,
    borderRadius: RADIUS.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQty: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    minWidth: 16,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  footer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
  },
  checkoutBtnTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textOnPrimary,
  },
  checkoutBtnSub: {
    fontSize: 11,
    color: '#E6F0E4',
    marginTop: 2,
  },
  checkoutPricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
  },
  checkoutPriceText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textOnPrimary,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  whatsappBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  emptyIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  shopNowBtn: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: RADIUS.pill,
  },
  shopNowText: {
    color: COLORS.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
