# POCO Naturals Mobile App

React Native (Expo + TypeScript + Expo Router) mobile commerce app for **POCO Naturals** (`https://poconaturals.in`).

## Features

- **Live WooCommerce Store API Integration**: Fetches real-time products, categories, INR pricing, and stock status from `https://poconaturals.in/wp-json/wc/store/v1`, with an automatic offline fallback catalog bundled from the live store.
- **Native Storefront & Browsing**: Editorial home screen, category tiles, search, category filtering, sorting (Featured, Price, Best Deals), pull-to-refresh, and swipeable product galleries.
- **Persistent Cart & Wishlist**: Local persistence via `AsyncStorage`, inline quantity steppers, MRP savings breakdown, and a ₹499 free-delivery progress tracker.
- **Seamless Checkout Handoff**: Syncs your native cart directly into `poconaturals.in`'s WooCommerce session inside an in-app `WebView` and opens `/checkout/` for UPI, Card, and COD payments (plus a quick WhatsApp order fallback).

## Getting Started

```bash
cd /Users/karthivelu/dev/mobile-apps/poco-naturals
npm install
npx expo start
```

Then press:
- `i` to open in the iOS Simulator
- `a` to open in the Android Emulator
- `w` to open in the Web browser
- Or scan the QR code with **Expo Go** on your phone.
