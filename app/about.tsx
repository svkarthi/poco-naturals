import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING, STORE_INFO } from '@/theme/tokens';

const BRAND_LOGO = require('../assets/logo.png');

export default function AboutScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Image source={BRAND_LOGO} style={styles.logo} contentFit="contain" />
        <Text style={styles.eyebrow}>OUR STORY</Text>
        <Text style={styles.title}>About POCO Naturals</Text>
        <Text style={styles.lead}>
          At POCO Naturals, we believe that good food begins with thoughtful
          choices. Inspired by the rich agricultural heritage and traditional
          food culture of Tamil Nadu, we aim to make traditional food
          ingredients accessible to modern households.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What We Bring to Your Kitchen</Text>

        <View style={styles.pillar}>
          <View style={styles.iconBox}>
            <Ionicons name="nutrition-outline" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.pillarText}>
            <Text style={styles.pillarTitle}>A Wide Range of Millets</Text>
            <Text style={styles.pillarDesc}>
              Explore millet-based varieties including daily-use millets,
              traditional flakes (Aval), Foxtail Millet Sevai, and convenient
              multi-millet noodles, pasta, rusks, and cookies.
            </Text>
          </View>
        </View>

        <View style={styles.pillar}>
          <View style={styles.iconBox}>
            <Ionicons name="water-outline" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.pillarText}>
            <Text style={styles.pillarTitle}>Quality Coconut Oils</Text>
            <Text style={styles.pillarDesc}>
              Cold-pressed coconut oils selected with attention to processing
              methods, natural aroma, purity, and freshness.
            </Text>
          </View>
        </View>

        <View style={styles.pillar}>
          <View style={styles.iconBox}>
            <Ionicons name="leaf-outline" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.pillarText}>
            <Text style={styles.pillarTitle}>
              Traditional Sweeteners & Essentials
            </Text>
            <Text style={styles.pillarDesc}>
              From traditional palm jaggery (Karupatti) and PALMORA palm sugar
              candy to raw forest honey — familiar ingredients that have been
              part of Indian kitchens for generations.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Visit or Contact Us</Text>
        <Text style={styles.address}>{STORE_INFO.address}</Text>
        <View style={styles.contactRow}>
          <Pressable
            onPress={() =>
              Linking.openURL(`https://wa.me/${STORE_INFO.whatsappNumber}`)
            }
            style={styles.contactBtn}
          >
            <Ionicons name="logo-whatsapp" size={16} color={COLORS.textOnPrimary} />
            <Text style={styles.contactBtnText}>WhatsApp</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              Linking.openURL(
                `tel:${STORE_INFO.phonePrimary.replace(/\s+/g, '')}`
              )
            }
            style={styles.contactOutlineBtn}
          >
            <Ionicons name="call-outline" size={16} color={COLORS.primary} />
            <Text style={styles.contactOutlineText}>Call Store</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  hero: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 4,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  lead: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  pillar: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarText: {
    flex: 1,
    gap: 3,
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  pillarDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  address: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: RADIUS.pill,
  },
  contactBtnText: {
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  contactOutlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: RADIUS.pill,
  },
  contactOutlineText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
