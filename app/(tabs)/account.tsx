import { Ionicons } from '@expo/vector-icons';
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
import { useStore } from '@/context/StoreContext';
import { COLORS, RADIUS, SPACING, STORE_INFO } from '@/theme/tokens';

export default function AccountScreen() {
  const {
    products,
    wishlistIds,
    isLiveData,
    lastSyncedAt,
    isLoadingCatalog,
    refreshCatalog,
  } = useStore();

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
        <Text style={styles.title}>More & Heritage</Text>

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
              Tap the heart on any product to save your favorites here.
            </Text>
          </View>
        )}

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

        {/* Contact & Support */}
        <Text style={styles.sectionTitleStandalone}>Contact POCO Naturals</Text>
        <View style={styles.card}>
          <Pressable
            onPress={() =>
              Linking.openURL(`https://wa.me/${STORE_INFO.whatsappNumber}`)
            }
            style={styles.actionRow}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.primaryTint }]}>
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
              Linking.openURL(`tel:${STORE_INFO.phonePrimary.replace(/\s+/g, '')}`)
            }
            style={styles.actionRow}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.accentTint }]}>
              <Ionicons name="call-outline" size={20} color={COLORS.accent} />
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
            <View style={[styles.iconBox, { backgroundColor: COLORS.goldTint }]}>
              <Ionicons name="mail-outline" size={20} color={COLORS.gold} />
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
            <View style={[styles.iconBox, { backgroundColor: COLORS.surfaceMuted }]}>
              <Ionicons name="globe-outline" size={20} color={COLORS.text} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Visit Website</Text>
              <Text style={styles.actionSub}>poconaturals.in</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={COLORS.textMuted} />
          </Pressable>
        </View>

        {/* Heritage Card */}
        <View style={styles.heritageCard}>
          <Text style={styles.heritageEyebrow}>OUR ROOTS</Text>
          <Text style={styles.heritageTitle}>
            Born in Udumalaipettai, Tamil Nadu
          </Text>
          <Text style={styles.heritageBody}>
            POCO Naturals brings Tamil Nadu’s agricultural heritage and
            traditional food wisdom to modern kitchens — from cold-pressed
            coconut oil and heirloom millets to pure palm jaggery (Karupatti)
            and wild forest honey.
          </Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.primary} />
            <Text style={styles.addressText}>{STORE_INFO.address}</Text>
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
    marginTop: SPACING.sm,
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
    backgroundColor: COLORS.primaryTint,
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
  heritageCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
    backgroundColor: COLORS.primaryTint,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  heritageEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 1.2,
  },
  heritageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  heritageBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
  },
});
