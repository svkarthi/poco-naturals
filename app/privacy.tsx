import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, RADIUS, SPACING, STORE_INFO } from '@/theme/tokens';

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const openFullPolicy = () => {
    WebBrowser.openBrowserAsync(STORE_INFO.privacyPolicyUrl).catch(() =>
      Linking.openURL(STORE_INFO.privacyPolicyUrl)
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: SPACING.xxl + insets.bottom },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.body}>
          POCO Naturals respects your privacy. This app stores your shopping
          cart and saved items locally on your device so you can browse and
          order seamlessly.
        </Text>
        <Text style={styles.heading}>Order & Checkout Data</Text>
        <Text style={styles.body}>
          When you proceed to checkout, your basket is handed off securely over
          HTTPS to poconaturals.in. Shipping address, contact details, and
          payment processing are handled directly by poconaturals.in and its
          authorized payment gateway partners. The app does not store card or
          UPI credentials on your device.
        </Text>
        <Text style={styles.heading}>Contact & Data Requests</Text>
        <Text style={styles.body}>
          For any privacy questions or data deletion requests, contact us at{' '}
          {STORE_INFO.email} or call {STORE_INFO.phonePrimary}.
        </Text>

        <Pressable onPress={openFullPolicy} style={styles.btn}>
          <Ionicons name="open-outline" size={16} color={COLORS.textOnPrimary} />
          <Text style={styles.btnText}>Read Full Policy on poconaturals.in</Text>
        </Pressable>
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
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  body: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  btn: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: RADIUS.pill,
  },
  btnText: {
    color: COLORS.textOnPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
