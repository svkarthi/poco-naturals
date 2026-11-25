import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/theme/tokens';

const CATEGORY_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  'coconut-products': 'water-outline',
  honey: 'sunny-outline',
  milletproducts: 'nutrition-outline',
  'palm-products': 'leaf-outline',
  'premium-millets': 'sparkles-outline',
  'traditional-breakfast-mixes': 'cafe-outline',
};

const CATEGORY_TINT_MAP: Record<string, string> = {
  'coconut-products': '#E9F2EC',
  honey: '#FDF5E6',
  milletproducts: '#F9EDE5',
  'palm-products': '#F3ECE4',
  'premium-millets': '#EEF4EA',
  'traditional-breakfast-mixes': '#FBF0E4',
};

interface CategoryTileProps {
  slug: string;
  name: string;
  count?: number;
  onPress: () => void;
}

export function CategoryTile({ slug, name, count, onPress }: CategoryTileProps) {
  const icon = CATEGORY_ICON_MAP[slug] ?? 'leaf-outline';
  const tint = CATEGORY_TINT_MAP[slug] ?? COLORS.primaryTint;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
    >
      <View style={[styles.iconCircle, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
      {typeof count === 'number' && (
        <Text style={styles.count}>
          {count} {count === 1 ? 'item' : 'items'}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 112,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 6,
  },
  tilePressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 16,
    minHeight: 32,
  },
  count: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
