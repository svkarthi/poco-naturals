import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryTile } from '@/components/CategoryTile';
import { ProductCard } from '@/components/ProductCard';
import { useStore } from '@/context/StoreContext';
import { COLORS, RADIUS, SPACING, STORE_INFO } from '@/theme/tokens';
import { getDiscountPercent } from '@/utils/format';

export default function HomeScreen() {
  const router = useRouter();
  const {
    products,
    categories,
    isLoadingCatalog,
    isLiveData,
    refreshCatalog,
    cartCount,
  } = useStore();

  const bestDeals = useMemo(() => {
    return [...products]
      .sort(
        (a, b) =>
          getDiscountPercent(b.regularPrice, b.price) -
          getDiscountPercent(a.regularPrice, a.price)
      )
      .slice(0, 6);
  }, [products]);

  const pairedProducts = useMemo(() => {
    const rows: Array<[typeof products[number], typeof products[number] | undefined]> = [];
    for (let i = 0; i < products.length; i += 2) {
      rows.push([products[i], products[i + 1]]);
    }
    return rows;
  }, [products]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingCatalog}
            onRefresh={refreshCatalog}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Top Brand Bar */}
        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              <Text style={styles.brandMark}>POCO</Text>
              <Text style={styles.brandSub}>NATURALS</Text>
            </View>
            <Text style={styles.locationText}>
              Udumalaipettai, Tamil Nadu • {isLiveData ? 'Live Store' : 'Catalog'}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/cart')}
            style={styles.cartPill}
          >
            <Ionicons name="bag-handle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.cartPillText}>{cartCount}</Text>
          </Pressable>
        </View>

        {/* Search Entry Bar */}
        <Pressable
          onPress={() => router.push('/(tabs)/shop')}
          style={styles.searchBar}
        >
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder}>
            Search millets, karupatti, cold-pressed oil, honey...
          </Text>
        </Pressable>

        {/* Editorial Heritage Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroPill}>
            <Ionicons name="leaf" size={12} color={COLORS.gold} />
            <Text style={styles.heroPillText}>TAMIL NADU HERITAGE FOODS</Text>
          </View>
          <Text style={styles.heroTitle}>
            Pure, traditional ingredients for everyday nourishment.
          </Text>
          <Text style={styles.heroSubtitle}>
            Cold-pressed oils, heirloom millets, wild forest honey & palm jaggery
            crafted with care from Udumalaipettai.
          </Text>
          <View style={styles.heroActions}>
            <Pressable
              onPress={() => router.push('/(tabs)/shop')}
              style={({ pressed }) => [
                styles.heroCta,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.heroCtaText}>Explore Store</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={COLORS.primary}
              />
            </Pressable>
            <View style={styles.shippingNote}>
              <Ionicons name="cube-outline" size={14} color="#D8ECE0" />
              <Text style={styles.shippingNoteText}>
                Free delivery ₹{STORE_INFO.freeShippingThreshold}+
              </Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <Pressable onPress={() => router.push('/(tabs)/shop')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {categories.map((cat) => (
            <CategoryTile
              key={cat.id}
              slug={cat.slug}
              name={cat.name}
              count={cat.count}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/shop',
                  params: { category: cat.slug },
                })
              }
            />
          ))}
        </ScrollView>

        {/* Best Deals Horizontal Carousel */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Fresh Deals</Text>
            <Text style={styles.sectionSubtitle}>
              Direct farm-to-home savings
            </Text>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/shop')}>
            <Text style={styles.seeAll}>View all</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {bestDeals.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </ScrollView>

        {/* Heritage Promise Strip */}
        <View style={styles.promiseGrid}>
          <View style={styles.promiseItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
            <Text style={styles.promiseTitle}>100% Natural</Text>
            <Text style={styles.promiseDesc}>No preservatives</Text>
          </View>
          <View style={styles.promiseDivider} />
          <View style={styles.promiseItem}>
            <Ionicons name="sunny-outline" size={20} color={COLORS.accent} />
            <Text style={styles.promiseTitle}>Small Batch</Text>
            <Text style={styles.promiseDesc}>Traditional craft</Text>
          </View>
          <View style={styles.promiseDivider} />
          <View style={styles.promiseItem}>
            <Ionicons name="heart-outline" size={20} color={COLORS.gold} />
            <Text style={styles.promiseTitle}>Farm Direct</Text>
            <Text style={styles.promiseDesc}>Tamil Nadu roots</Text>
          </View>
        </View>

        {/* All Products 2-Column Grid */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Our Natural Pantry</Text>
            <Text style={styles.sectionSubtitle}>
              {products.length} wholesome essentials
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          {pairedProducts.map(([left, right]) => (
            <View key={left.id} style={styles.gridRow}>
              <ProductCard product={left} />
              {right ? (
                <ProductCard product={right} />
              ) : (
                <View style={{ flex: 1 }} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  brandMark: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.2,
  },
  brandSub: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 2,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
  },
  cartPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: COLORS.textMuted,
    flex: 1,
  },
  heroCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  heroPillText: {
    color: '#F5E7C4',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: COLORS.textOnPrimary,
    lineHeight: 30,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#D5E5DB',
    lineHeight: 20,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF6F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  heroCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  shippingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  shippingNoteText: {
    fontSize: 12,
    color: '#D8ECE0',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  horizontalList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  promiseGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  promiseItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  promiseTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  promiseDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  promiseDivider: {
    width: 1,
    height: 34,
    backgroundColor: COLORS.border,
  },
  grid: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
});
