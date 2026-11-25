import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/OfflineBanner';
import { ProductCard } from '@/components/ProductCard';
import { useCatalog } from '@/context/StoreContext';
import { COLORS, RADIUS, SPACING } from '@/theme/tokens';
import type { SortOption } from '@/types/store';
import { getDiscountPercent } from '@/utils/format';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'price_asc', label: 'Price: Low' },
  { id: 'price_desc', label: 'Price: High' },
  { id: 'discount', label: 'Best Deals' },
];

export default function ShopScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const { products, categories, isLoadingCatalog, refreshCatalog } = useCatalog();

  const paramCategory =
    typeof params.category === 'string' ? params.category : undefined;
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryOverride, setCategoryOverride] = useState<{
    baseParam?: string;
    value: string;
  } | null>(null);
  const selectedCategory =
    categoryOverride && categoryOverride.baseParam === paramCategory
      ? categoryOverride.value
      : paramCategory ?? 'all';
  const setSelectedCategory = (value: string) =>
    setCategoryOverride({ baseParam: paramCategory, value });
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = products.filter((p) => {
      const matchesCat =
        selectedCategory === 'all' ||
        p.categories.some((c) => c.slug === selectedCategory);
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.categories.some((c) => c.name.toLowerCase().includes(q))
      );
    });

    if (sortBy === 'price_asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      list = [...list].sort(
        (a, b) =>
          getDiscountPercent(b.regularPrice, b.price) -
          getDiscountPercent(a.regularPrice, a.price)
      );
    }

    return list;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <Text style={styles.countText}>
          {filteredProducts.length}{' '}
          {filteredProducts.length === 1 ? 'product' : 'products'}
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search millets, honey, oil, jaggery..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </Pressable>
        )}
      </View>

      <OfflineBanner />

      {/* Category Filter Chips */}
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          <Pressable
            onPress={() => setSelectedCategory('all')}
            style={[
              styles.chip,
              selectedCategory === 'all' && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategory === 'all' && styles.chipTextActive,
              ]}
            >
              All ({products.length})
            </Text>
          </Pressable>

          {categories.map((cat) => {
            const active = selectedCategory === cat.slug;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.slug)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Sort Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortBar}
        contentContainerStyle={styles.sortScroll}
      >
        <Ionicons
          name="swap-vertical-outline"
          size={15}
          color={COLORS.textSecondary}
          style={{ alignSelf: 'center' }}
        />
        {SORT_OPTIONS.map((opt) => {
          const active = sortBy === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => setSortBy(opt.id)}
              style={[styles.sortPill, active && styles.sortPillActive]}
            >
              <Text
                style={[
                  styles.sortPillText,
                  active && styles.sortPillTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Product Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingCatalog}
            onRefresh={refreshCatalog}
            tintColor={COLORS.primary}
          />
        }
        renderItem={({ item }) => <ProductCard product={item} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="leaf-outline" size={42} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No matching products</Text>
            <Text style={styles.emptySubtitle}>
              Try clearing your search or switching to another category.
            </Text>
            <Pressable
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              style={styles.resetBtn}
            >
              <Text style={styles.resetBtnText}>Reset Filters</Text>
            </Pressable>
          </View>
        }
      />
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
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    padding: 0,
  },
  chipsContainer: {
    marginBottom: SPACING.sm,
  },
  chipsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textOnPrimary,
  },
  sortBar: {
    flexGrow: 0,
    marginBottom: SPACING.md,
  },
  sortScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  sortPill: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceMuted,
  },
  sortPillActive: {
    backgroundColor: COLORS.accentTint,
  },
  sortPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sortPillTextActive: {
    color: COLORS.accent,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  columnWrapper: {
    gap: SPACING.md,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  resetBtn: {
    marginTop: SPACING.sm,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
  },
  resetBtnText: {
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
});
