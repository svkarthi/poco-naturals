import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreProvider } from '@/context/StoreContext';
import { COLORS } from '@/theme/tokens';

export default function RootLayout() {
  return (
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
            name="checkout"
            options={{
              title: 'Secure Checkout',
              presentation: 'modal',
            }}
          />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
