import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/ProductCard';
import { useStore } from '@/context/StoreContext';
import { COLORS, RADIUS, SPACING } from '@/theme/tokens';
import { formatInr, getDiscountPercent } from '@/utils/format';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    products,
    getProductById,
    addToCart,
    updateQuantity,
    getItemQuantity,
    isWishlisted,
    toggleWishlist,
  } = useStore();

  const productId = Number(id);
  const product = getProductById(productId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [localQty, setLocalQty] = useState(1);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const primaryCatSlug = product.categories[0]?.slug;
    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          (!primaryCatSlug || p.categories.some((c) => c.slug === primaryCatSlug))
      )
      .slice(0, 4);
  }, [product, products]);

  if (!product) {
    return (
      <SafeAreaView style={styles.notFoundWrap}>
        <Ionicons name="leaf-outline" size={44} color={COLORS.textMuted} />
        <Text style={styles.notFoundTitle}>Product not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const inCartQty = getItemQuantity(product.id);
  const wishlisted = isWishlisted(product.id);
  const discount = getDiscountPercent(product.regularPrice, product.price);
  const savings = Math.max(0, product.regularPrice - product.price);
  const images = product.images.length > 0 ? product.images : [];

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(idx);
  };

  const handleShare = () => {
    Share.share({
      title: product.name,
      message: `Check out ${product.name} (${formatInr(product.price)}) on POCO Naturals: ${product.permalink}`,
      url: product.permalink,
    }).catch(() => {});
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: product.categories[0]?.name ?? 'Product',
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable onPress={handleShare} hitSlop={8}>
                <Ionicons name="share-outline" size={22} color={COLORS.primary} />
              </Pressable>
              <Pressable
                onPress={() => toggleWishlist(product.id)}
                hitSlop={8}
              >
                <Ionicons
                  name={wishlisted ? 'heart' : 'heart-outline'}
                  size={22}
                  color={wishlisted ? COLORS.danger : COLORS.primary}
                />
              </Pressable>
            </View>
          ),
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <View style={styles.galleryWrap}>
          {images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
            >
              {images.map((img) => (
                <Image
                  key={img.id}
                  source={{ uri: img.src }}
                  style={styles.heroImage}
                  contentFit="cover"
                  transition={200}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="leaf-outline" size={56} color={COLORS.primary} />
            </View>
          )}

          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>SAVE {discount}%</Text>
            </View>
          )}

          {images.length > 1 && (
            <View style={styles.dotsRow}>
              {images.map((img, i) => (
                <View
                  key={img.id}
                  style={[
                    styles.dot,
                    i === activeImageIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <View style={styles.eyebrowRow}>
            <Text style={styles.categoryLabel}>
              {(product.categories[0]?.name ?? 'Natural Foods').toUpperCase()}
            </Text>
            <View
              style={[
                styles.stockPill,
                !product.isInStock && styles.stockPillOut,
              ]}
            >
              <View
                style={[
                  styles.stockDot,
                  {
                    backgroundColor: product.isInStock
                      ? COLORS.success
                      : COLORS.danger,
                  },
                ]}
              />
              <Text
                style={[
                  styles.stockText,
                  !product.isInStock && { color: COLORS.danger },
                ]}
              >
                {product.isInStock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>

          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.priceBlock}>
            <Text style={styles.price}>
              {formatInr(product.price, product.currencySymbol)}
            </Text>
            {product.onSale && product.regularPrice > product.price && (
              <>
                <Text style={styles.mrp}>
                  {formatInr(product.regularPrice, product.currencySymbol)}
                </Text>
                <View style={styles.savingsPill}>
                  <Text style={styles.savingsText}>
                    Save {formatInr(savings)}
                  </Text>
                </View>
              </>
            )}
          </View>

          <Text style={styles.taxNote}>Inclusive of all taxes</Text>

          {/* Trust Highlights */}
          <View style={styles.trustRow}>
            <View style={styles.trustChip}>
              <Ionicons name="leaf-outline" size={15} color={COLORS.primary} />
              <Text style={styles.trustText}>100% Natural</Text>
            </View>
            <View style={styles.trustChip}>
              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color={COLORS.primary}
              />
              <Text style={styles.trustText}>No Preservatives</Text>
            </View>
            <View style={styles.trustChip}>
              <Ionicons name="cube-outline" size={15} color={COLORS.primary} />
              <Text style={styles.trustText}>Freshly Packed</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descCard}>
            <Text style={styles.descHeading}>About this product</Text>
            <Text style={styles.descBody}>
              {product.description || product.shortDescription}
            </Text>
          </View>
        </View>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>You might also like</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScroll}
            >
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} compact />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        {inCartQty > 0 ? (
          <View style={styles.inCartRow}>
            <View style={styles.qtyStepper}>
              <Pressable
                onPress={() => updateQuantity(product.id, inCartQty - 1)}
                style={styles.qtyBtn}
              >
                <Ionicons name="remove" size={18} color={COLORS.primary} />
              </Pressable>
              <Text style={styles.qtyValue}>{inCartQty}</Text>
              <Pressable
                onPress={() => updateQuantity(product.id, inCartQty + 1)}
                style={styles.qtyBtn}
              >
                <Ionicons name="add" size={18} color={COLORS.primary} />
              </Pressable>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/cart')}
              style={styles.primaryCta}
            >
              <Ionicons
                name="bag-handle"
                size={18}
                color={COLORS.textOnPrimary}
              />
              <Text style={styles.primaryCtaText}>
                View Cart • {formatInr(product.price * inCartQty)}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.inCartRow}>
            <View style={styles.qtyStepper}>
              <Pressable
                onPress={() => setLocalQty((q) => Math.max(1, q - 1))}
                style={styles.qtyBtn}
              >
                <Ionicons name="remove" size={18} color={COLORS.primary} />
              </Pressable>
              <Text style={styles.qtyValue}>{localQty}</Text>
              <Pressable
                onPress={() => setLocalQty((q) => q + 1)}
                style={styles.qtyBtn}
              >
                <Ionicons name="add" size={18} color={COLORS.primary} />
              </Pressable>
            </View>
            <Pressable
              disabled={!product.isInStock}
              onPress={() => addToCart(product, localQty)}
              style={[
                styles.primaryCta,
                !product.isInStock && styles.primaryCtaDisabled,
              ]}
            >
              <Ionicons
                name="bag-add-outline"
                size={18}
                color={COLORS.textOnPrimary}
              />
              <Text style={styles.primaryCtaText}>
                {product.isInStock
                  ? `Add to Cart • ${formatInr(product.price * localQty)}`
                  : 'Out of Stock'}
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  galleryWrap: {
    width: SCREEN_WIDTH,
    height: Math.min(SCREEN_WIDTH, 380),
    backgroundColor: COLORS.surfaceMuted,
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: Math.min(SCREEN_WIDTH, 380),
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  discountBadgeText: {
    color: COLORS.textOnPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dotsRow: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
  infoSection: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.8,
  },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  stockPillOut: {
    backgroundColor: COLORS.dangerTint,
  },
  stockDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 28,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
  },
  mrp: {
    fontSize: 16,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  savingsPill: {
    backgroundColor: COLORS.accentTint,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accent,
  },
  taxNote: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  trustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  descCard: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  descHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  descBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  relatedSection: {
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
  },
  relatedScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  bottomBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  inCartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.primaryTint,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    minWidth: 18,
    textAlign: 'center',
  },
  primaryCta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
  },
  primaryCtaDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  primaryCtaText: {
    color: COLORS.textOnPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    gap: SPACING.md,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  backBtnText: {
    color: COLORS.textOnPrimary,
    fontWeight: '700',
  },
});
