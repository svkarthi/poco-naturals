# POCO Naturals Mobile App

Production React Native (Expo SDK 58 + TypeScript + Expo Router) mobile commerce app for **POCO Naturals** (`https://poconaturals.in`), aligned 1:1 with the website's branding, color palette, catalog, and navigation.

## Highlights

- **Exact `poconaturals.in` Palette & Assets**:
  - Blocksy theme palette (`#5A8139` primary, `#48682B` dark green, `#192C27` headings, `#434F58` body, `#E6F0EE` borders, `#F2F7F6` soft mint surfaces, `#FBFCFC` canvas).
  - Official 1024×1024 brand logo (`assets/logo.png`, `assets/icon.png`, `assets/splash-icon.png`) plus safe-zone padded Android adaptive icon (`assets/adaptive-icon.png`).
- **Live WooCommerce Store API + Offline Cache**:
  - Multi-page product & category fetching from `https://poconaturals.in/wp-json/wc/store/v1`, supporting both simple and variable products (`variations` size/option selector).
  - Persists the latest synced live catalog in `AsyncStorage` and falls back gracefully to a bundled catalog when offline.
- **Isolated State Architecture**:
  - Split `CatalogContext`, `CartContext`, and `WishlistContext` (`useCatalog`, `useCart`, `useWishlist`) to prevent unnecessary screen re-renders.
- **India-Ready Checkout Handoff**:
  - Syncs the native cart into `poconaturals.in`'s WooCommerce session via the `/wc/store/v1/batch` API (with sequential fallback) and opens `/checkout/` inside an in-app `WebView`.
  - Intercepts UPI payment deep links (`upi://`, `tez://`, `phonepe://`, `paytmmp://`, `bhim://`, and Android `intent://` URLs) via `Linking.openURL()`, backed by Android 11+ `<queries>` manifest declarations (`plugins/withUpiQueries.js`).
- **WordPress Blog, About Us & Privacy Policy**:
  - Live `/wp-json/wp/v2/posts?_embed` integration, verbatim About Us screen, Play Store-compliant Privacy Policy screen, Android App Links (`intentFilters` for `https://poconaturals.in/*`), and a root `ErrorBoundary`.

## Local Development & Verification

```bash
cd /Users/karthivelu/dev/mobile-apps/poco-naturals
npm install
npx expo-doctor
npm run lint
npm run typecheck
npm test
npx expo start --port 8082
```

## CI/CD — Android APK & Play Store AAB (GitHub Actions)

`.github/workflows/android-apk.yml` runs on every push to `main`, `v*` tags, and manual `workflow_dispatch` (with `concurrency` cancellation on superseded branch builds):

1. Runs `npm run lint`, `npm run typecheck`, and `npm test -- --ci`.
2. Runs `npx expo prebuild --platform android --clean --no-install` and `./gradlew assembleRelease --no-daemon` (Java 21 + Gradle cache).
3. Uploads `poco-naturals-<ref>-<sha>.apk` (and publishes a GitHub Release on `v*` tags).

### Google Play Store Release (`.aab`)

- **Android Package**: `com.poconaturals.app` (`versionCode: 1` in `app.json`)
- **Privacy Policy URL**: `https://poconaturals.in/privacy-policy-2/`

You can produce a signed Play Store `.aab` in either of two ways:

1. **Via EAS Build**:
   ```bash
   npx eas login
   npx eas build --platform android --profile production
   ```
2. **Via GitHub Actions Secrets** (`plugins/withReleaseSigning.js`):
   Add `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD` to repository secrets — the workflow will automatically sign the release and build both `.apk` and `.aab` (`app-release.aab`).
