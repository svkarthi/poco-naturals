import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StoreProvider } from '@/context/StoreContext';
import { COLORS } from '@/theme/tokens';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StoreProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: COLORS.background },
              headerTintColor: COLORS.primary,
              headerTitleStyle: { fontWeight: '700', color: COLORS.text },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: COLORS.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="product/[id]"
              options={{
                title: 'Product Details',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="blog/[id]"
              options={{
                title: 'Blog',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="about"
              options={{
                title: 'About Us',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="privacy"
              options={{
                title: 'Privacy Policy',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="checkout"
              options={{
                title: 'Secure Checkout',
                presentation: 'modal',
              }}
            />
          </Stack>
        </StoreProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
