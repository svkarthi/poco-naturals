import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCart, useWishlist } from '@/context/StoreContext';
import { COLORS, RADIUS, SPACING } from '@/theme/tokens';
import { makeCartKey, type StoreProduct } from '@/types/store';
import { formatInr, getDiscountPercent } from '@/utils/format';

interface ProductCardProps {
  product: StoreProduct;
  compact?: boolean;
}

function ProductCardInner({ product, compact = false }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const hasVariations =
    Array.isArray(product.variations) && product.variations.length > 0;
  const quantity = getItemQuantity(product.id);
  const wishlisted = isWishlisted(product.id);
  const discount = getDiscountPercent(product.regularPrice, product.price);
  const primaryImage = product.images[0]?.src;
  const primaryCategory = product.categories[0]?.name ?? 'Natural Foods';

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.imageWrap, compact && styles.imageWrapCompact]}>
        {primaryImage ? (
          <Image
            source={{ uri: primaryImage }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="leaf-outline" size={32} color={COLORS.primary} />
          </View>
        )}

        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}

        <Pressable
          onPress={() => toggleWishlist(product.id)}
          hitSlop={8}
          style={styles.wishlistBtn}
          accessibilityLabel={
            wishlisted ? 'Remove from saved items' : 'Save item'
          }
        >
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={18}
            color={wishlisted ? COLORS.danger : COLORS.textSecondary}
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.category} numberOfLines={1}>
          {primaryCategory.toUpperCase()}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {hasVariations ? 'From ' : ''}
            {formatInr(product.price, product.currencySymbol)}
          </Text>
          {product.onSale && product.regularPrice > product.price && (
            <Text style={styles.mrp}>
              {formatInr(product.regularPrice, product.currencySymbol)}
            </Text>
          )}
        </View>

        {!product.isInStock ? (
          <View style={styles.outOfStockBtn}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        ) : hasVariations ? (
          <Pressable
            onPress={() => router.push(`/product/${product.id}`)}
            style={({ pressed }) => [
              styles.addBtn,
              pressed && styles.addBtnPressed,
            ]}
          >
            <Text style={styles.addBtnText}>
              {quantity > 0 ? `Options (${quantity})` : 'Choose Size'}
            </Text>
          </Pressable>
        ) : quantity > 0 ? (
          <View style={styles.stepper}>
            <Pressable
              onPress={() =>
                updateQuantity(makeCartKey(product.id), quantity - 1)
              }
              style={styles.stepperBtn}
              hitSlop={6}
            >
              <Ionicons name="remove" size={16} color={COLORS.textOnPrimary} />
            </Pressable>
            <Text style={styles.stepperQty}>{quantity}</Text>
            <Pressable
              onPress={() =>
                updateQuantity(makeCartKey(product.id), quantity + 1)
              }
              style={styles.stepperBtn}
              hitSlop={6}
            >
              <Ionicons name="add" size={16} color={COLORS.textOnPrimary} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => addToCart(product, 1)}
            style={({ pressed }) => [
              styles.addBtn,
              pressed && styles.addBtnPressed,
            ]}
          >
            <Ionicons name="add" size={16} color={COLORS.primary} />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardInner);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardCompact: {
    width: 176,
    flex: 0,
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: COLORS.surfaceMuted,
    position: 'relative',
  },
  imageWrapCompact: {
    height: 148,
    aspectRatio: undefined,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  discountText: {
    color: COLORS.textOnPrimary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  wishlistBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 30,
    height: 30,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: SPACING.md,
    gap: 5,
    flex: 1,
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryLight,
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 19,
    minHeight: 38,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  mrp: {
    fontSize: 12,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryTint,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  addBtnPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stepper: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    color: COLORS.textOnPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  outOfStockBtn: {
    marginTop: 6,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
  },
  outOfStockText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});
