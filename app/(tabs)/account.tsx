import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useMemo } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/ProductCard';
import { useCatalog, useWishlist } from '@/context/StoreContext';
import { COLORS, RADIUS, SPACING, STORE_INFO } from '@/theme/tokens';

export default function AccountScreen() {
  const router = useRouter();
  const {
    products,
    isLiveData,
    lastSyncedAt,
    isLoadingCatalog,
    refreshCatalog,
  } = useCatalog();
  const { wishlistIds } = useWishlist();

  const savedProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p.id)),
    [products, wishlistIds]
  );

  const openUrl = (url: string) => {
    WebBrowser.openBrowserAsync(url).catch(() => {
      Linking.openURL(url).catch(() => {});
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>More</Text>

        {/* Saved Items Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Saved Items ({savedProducts.length})
          </Text>
        </View>

        {savedProducts.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.savedScroll}
          >
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptySavedCard}>
            <Ionicons name="heart-outline" size={22} color={COLORS.textMuted} />
            <Text style={styles.emptySavedText}>
              Tap the heart on any product to save your favourites here.
            </Text>
          </View>
        )}

        {/* Site Pages matching poconaturals.in */}
        <Text style={styles.sectionTitleStandalone}>POCO Naturals</Text>
        <View style={styles.card}>
          <Pressable
            onPress={() => router.push('/about')}
            style={styles.actionRow}
          >
            <View style={styles.iconBox}>
              <Ionicons name="leaf-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>About Us</Text>
              <Text style={styles.actionSub}>Our story & Tamil Nadu roots</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            onPress={() => router.push('/(tabs)/blog')}
            style={styles.actionRow}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="newspaper-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Blog</Text>
              <Text style={styles.actionSub}>Traditional food articles</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            onPress={() => router.push('/privacy')}
            style={styles.actionRow}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Privacy Policy</Text>
              <Text style={styles.actionSub}>How we protect your data</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>
        </View>

        {/* Contact & Support */}
        <Text style={styles.sectionTitleStandalone}>Contact Us</Text>
        <View style={styles.card}>
          <Pressable
            onPress={() =>
              Linking.openURL(`https://wa.me/${STORE_INFO.whatsappNumber}`)
            }
            style={styles.actionRow}
          >
            <View style={styles.iconBox}>
              <Ionicons name="logo-whatsapp" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>WhatsApp Support</Text>
              <Text style={styles.actionSub}>{STORE_INFO.phonePrimary}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            onPress={() =>
              Linking.openURL(
                `tel:${STORE_INFO.phonePrimary.replace(/\s+/g, '')}`
              )
            }
            style={styles.actionRow}
          >
            <View style={styles.iconBox}>
              <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Call Us</Text>
              <Text style={styles.actionSub}>
                {STORE_INFO.phonePrimary} / {STORE_INFO.phoneSecondary}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            onPress={() => Linking.openURL(`mailto:${STORE_INFO.email}`)}
            style={styles.actionRow}
          >
            <View style={styles.iconBox}>
              <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Email</Text>
              <Text style={styles.actionSub}>{STORE_INFO.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            onPress={() => openUrl(STORE_INFO.baseUrl)}
            style={styles.actionRow}
          >
            <View style={styles.iconBox}>
              <Ionicons name="globe-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Visit Website</Text>
              <Text style={styles.actionSub}>poconaturals.in</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={COLORS.textMuted} />
          </Pressable>
        </View>

        {/* Store Connection Status */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.statusLeft}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isLiveData ? COLORS.success : COLORS.gold,
                  },
                ]}
              />
              <View>
                <Text style={styles.cardTitle}>
                  {isLiveData
                    ? 'Connected to poconaturals.in'
                    : 'Offline Catalog Mode'}
                </Text>
                <Text style={styles.cardSub}>
                  {lastSyncedAt
                    ? `Last synced at ${lastSyncedAt.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : 'Using bundled catalog'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={refreshCatalog}
              disabled={isLoadingCatalog}
              style={styles.syncBtn}
            >
              <Ionicons name="refresh" size={16} color={COLORS.primary} />
              <Text style={styles.syncBtnText}>
                {isLoadingCatalog ? 'Syncing' : 'Sync'}
              </Text>
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
    gap: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionTitleStandalone: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
  },
  savedScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  emptySavedCard: {
    marginHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  emptySavedText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  card: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: 8,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
});
