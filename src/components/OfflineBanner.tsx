import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCatalog } from '@/context/StoreContext';
import { COLORS, RADIUS, SPACING } from '@/theme/tokens';

export function OfflineBanner() {
  const { isLiveData, isLoadingCatalog, refreshCatalog } = useCatalog();

  if (isLiveData || isLoadingCatalog) {
    return null;
  }

  return (
    <Pressable onPress={refreshCatalog} style={styles.banner}>
      <View style={styles.left}>
        <Ionicons name="cloud-offline-outline" size={16} color={COLORS.gold} />
        <Text style={styles.text}>
          Offline mode • Showing cached catalog
        </Text>
      </View>
      <Text style={styles.retry}>Retry</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.goldTint,
    borderWidth: 1,
    borderColor: '#F0DFB4',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  retry: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});
