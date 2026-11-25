import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/theme/tokens';

export default function BlogDetailScreen() {
  const params = useLocalSearchParams<{
    title?: string;
    content?: string;
    date?: string;
    image?: string;
    link?: string;
  }>();

  const formattedDate = params.date
    ? new Date(params.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: 'Article' }} />

      {params.image ? (
        <Image
          source={{ uri: params.image }}
          style={styles.heroImage}
          contentFit="cover"
        />
      ) : null}

      <View style={styles.body}>
        {formattedDate ? (
          <Text style={styles.date}>{formattedDate}</Text>
        ) : null}
        <Text style={styles.title}>{params.title ?? 'POCO Naturals Blog'}</Text>
        <Text style={styles.articleBody}>
          {params.content ?? 'No article content available.'}
        </Text>

        {params.link ? (
          <Pressable
            onPress={() =>
              WebBrowser.openBrowserAsync(params.link!).catch(() =>
                Linking.openURL(params.link!)
              )
            }
            style={styles.openWebBtn}
          >
            <Ionicons name="open-outline" size={16} color={COLORS.primary} />
            <Text style={styles.openWebText}>Read on poconaturals.in</Text>
          </Pressable>
        ) : null}
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
    paddingBottom: SPACING.xxl,
  },
  heroImage: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.surfaceMuted,
  },
  body: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  date: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 29,
  },
  articleBody: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  openWebBtn: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
  },
  openWebText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
