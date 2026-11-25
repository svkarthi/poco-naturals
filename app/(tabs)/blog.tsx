import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchBlogPosts } from '@/api/wordpress';
import { COLORS, RADIUS, SPACING, STORE_INFO } from '@/theme/tokens';
import type { BlogPost } from '@/types/store';

export default function BlogScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const data = await fetchBlogPosts();
    setPosts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Latest From Our Blog</Text>
        <Text style={styles.subtitle}>
          Traditional food stories & recipes from poconaturals.in
        </Text>
      </View>

      {loading && posts.length === 0 ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadPosts}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/blog/[id]',
                  params: {
                    id: String(item.id),
                    title: item.title,
                    content: item.content,
                    date: item.date,
                    image: item.featuredImage ?? '',
                    link: item.link,
                  },
                })
              }
              style={({ pressed }) => [
                styles.postCard,
                pressed && { opacity: 0.95 },
              ]}
            >
              {item.featuredImage ? (
                <Image
                  source={{ uri: item.featuredImage }}
                  style={styles.postImage}
                  contentFit="cover"
                />
              ) : null}
              <View style={styles.postBody}>
                <Text style={styles.postDate}>
                  {new Date(item.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.postTitle}>{item.title}</Text>
                {item.excerpt ? (
                  <Text style={styles.postExcerpt} numberOfLines={3}>
                    {item.excerpt}
                  </Text>
                ) : null}
                <View style={styles.readMoreRow}>
                  <Text style={styles.readMoreText}>Read article</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={COLORS.primary}
                  />
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="newspaper-outline"
                  size={34}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>Stories Coming Soon</Text>
              <Text style={styles.emptySub}>
                New articles published on poconaturals.in/blog will appear here
                automatically. Pull down to refresh or explore our products.
              </Text>
              <View style={styles.emptyActions}>
                <Pressable
                  onPress={() => router.push('/(tabs)/shop')}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>Explore Products</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    WebBrowser.openBrowserAsync(STORE_INFO.blogUrl).catch(() =>
                      Linking.openURL(STORE_INFO.blogUrl)
                    )
                  }
                  style={styles.outlineBtn}
                >
                  <Text style={styles.outlineBtnText}>Open Web Blog</Text>
                </Pressable>
              </View>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  postCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.surfaceMuted,
  },
  postBody: {
    padding: SPACING.lg,
    gap: 6,
  },
  postDate: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 23,
  },
  postExcerpt: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyCard: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: RADIUS.pill,
  },
  primaryBtnText: {
    color: COLORS.textOnPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: RADIUS.pill,
  },
  outlineBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
