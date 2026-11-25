import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Linking,
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

const BRAND_LOGO = require('../../assets/logo.png');

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

  // Match the exact Featured Products highlighted on poconaturals.in
  const featuredProducts = useMemo(() => {
    const slugOrder: readonly string[] = STORE_INFO.featuredProductSlugs;
    const matched = slugOrder
      .map((slug) => products.find((p) => p.slug === slug))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    return matched.length > 0 ? matched : products.slice(0, 4);
  }, [products]);

  const pairedProducts = useMemo(() => {
    const rows: Array<
      [(typeof products)[number], (typeof products)[number] | undefined]
    > = [];
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
        {/* Top Brand Bar with Real POCO Naturals Logo */}
        <View style={styles.header}>
          <View style={styles.brandLeft}>
            <Image
              source={BRAND_LOGO}
              style={styles.logo}
              contentFit="contain"
            />
            <View>
              <Text style={styles.brandName}>{STORE_INFO.brandName}</Text>
              <Text style={styles.locationText}>
                Udumalaipettai, TN • {isLiveData ? 'Live Store' : 'Catalog'}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/cart')}
            style={styles.cartPill}
            accessibilityLabel="Open cart"
          >
            <Ionicons
              name="bag-handle-outline"
              size={18}
              color={COLORS.primary}
            />
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
            Search millets, karupatti, coconut oil, honey...
          </Text>
        </Pressable>

        {/* Hero Section matching poconaturals.in */}
        <View style={styles.heroCard}>
          <View style={styles.heroPill}>
            <Ionicons name="leaf" size={12} color="#DDF0D2" />
            <Text style={styles.heroPillText}>POCO NATURALS • TAMIL NADU</Text>
          </View>
          <Text style={styles.heroTitle}>{STORE_INFO.heroHeadline}</Text>
          <Text style={styles.heroSubtitle}>
            Traditional grains, cold-pressed coconut oils, palm jaggery & wild
            forest honey crafted for modern Indian households.
          </Text>
          <View style={styles.heroActions}>
            <Pressable
              onPress={() => router.push('/(tabs)/shop')}
              style={({ pressed }) => [
                styles.heroCta,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.heroCtaText}>Shop Products</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={COLORS.primaryDark}
              />
            </Pressable>
            <Pressable
              onPress={() => router.push('/about')}
              style={styles.heroSecondaryBtn}
            >
              <Text style={styles.heroSecondaryText}>About Us</Text>
            </Pressable>
          </View>
        </View>

        {/* Shop by Category */}
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

        {/* Featured Products matching poconaturals.in */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <Text style={styles.sectionSubtitle}>
              Handpicked favourites from poconaturals.in
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
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </ScrollView>

        {/* Quality & Care Promise Strip */}
        <View style={styles.promiseGrid}>
          <View style={styles.promiseItem}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.promiseTitle}>100% Natural</Text>
            <Text style={styles.promiseDesc}>Carefully sourced</Text>
          </View>
          <View style={styles.promiseDivider} />
          <View style={styles.promiseItem}>
            <Ionicons name="leaf-outline" size={20} color={COLORS.primary} />
            <Text style={styles.promiseTitle}>Traditional</Text>
            <Text style={styles.promiseDesc}>Tamil Nadu roots</Text>
          </View>
          <View style={styles.promiseDivider} />
          <View style={styles.promiseItem}>
            <Ionicons name="cube-outline" size={20} color={COLORS.primary} />
            <Text style={styles.promiseTitle}>Free Delivery</Text>
            <Text style={styles.promiseDesc}>
              Orders ₹{STORE_INFO.freeShippingThreshold}+
            </Text>
          </View>
        </View>

        {/* All Products 2-Column Grid */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>All Products</Text>
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

        {/* Stay Connected Card matching poconaturals.in */}
        <View style={styles.connectCard}>
          <Text style={styles.connectTitle}>
            Stay Connected with Better Food Choices
          </Text>
          <Text style={styles.connectSubtitle}>
            Read our latest traditional food stories or chat with our
            Udumalaipettai team on WhatsApp.
          </Text>
          <View style={styles.connectActions}>
            <Pressable
              onPress={() => router.push('/(tabs)/blog')}
              style={styles.connectOutlineBtn}
            >
              <Ionicons
                name="newspaper-outline"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.connectOutlineText}>Read Blog</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                Linking.openURL(`https://wa.me/${STORE_INFO.whatsappNumber}`)
              }
              style={styles.connectPrimaryBtn}
            >
              <Ionicons
                name="logo-whatsapp"
                size={16}
                color={COLORS.textOnPrimary}
              />
              <Text style={styles.connectPrimaryText}>WhatsApp Us</Text>
            </Pressable>
          </View>
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
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
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
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  heroPillText: {
    color: '#F1F8EC',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textOnPrimary,
    lineHeight: 27,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#E6F0E4',
    lineHeight: 20,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    flexWrap: 'wrap',
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  heroCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  heroSecondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  heroSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
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
  connectCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  connectTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  connectSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  connectActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  connectOutlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  connectOutlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  connectPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  connectPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
});
