# POCO Naturals Mobile App

Production React Native (Expo SDK 58 + TypeScript + Expo Router) mobile commerce app for **POCO Naturals** (`https://poconaturals.in`), aligned 1:1 with the website's branding, color palette, catalog, and navigation.

## Design & Brand Alignment (`poconaturals.in`)

- **Palette (Blocksy Theme)**:
  - Primary: `#5A8139` / Primary Dark: `#48682B`
  - Headings: `#192C27` / Body: `#434F58`
  - Borders & Tints: `#E6F0EE` / Soft Surface: `#F2F7F6` / Canvas: `#FBFCFC`
- **Brand Assets**: Uses POCO Naturals' official 1024×1024 logo across `assets/logo.png`, `assets/icon.png`, `assets/adaptive-icon.png`, and `assets/splash-icon.png`.
- **Storefront & Navigation**:
  - **Home**: Official logo header, site headline, **Shop by Category**, **Featured Products** (*Cold-Pressed Coconut Oil*, *PALMORA Palm Sugar Candy*, *Pearl Millet Chikkies*, *Premium Foxtail Millet Sevai*), **All Products**, and **Stay Connected with Better Food Choices**.
  - **Products**: Live WooCommerce Store API (`https://poconaturals.in/wp-json/wc/store/v1`) with search, category filter chips, sorting, pull-to-refresh, and a bundled offline fallback catalog (13 products, 6 categories).
  - **Blog**: Connected live to WordPress REST API (`https://poconaturals.in/wp-json/wp/v2/posts?_embed`).
  - **Cart & Checkout**: Persistent local cart (`AsyncStorage`), inline quantity steppers, MRP savings breakdown, ₹499 free-delivery progress bar, in-app `WebView` checkout handoff to `https://poconaturals.in/checkout/` (UPI, Cards, COD), and quick WhatsApp ordering (`+91 99943 69555`).
  - **More**: Saved wishlist items, **About Us** (matching `poconaturals.in/about-us/`), **Privacy Policy** (linked to `poconaturals.in/privacy-policy-2/`), direct Call / WhatsApp / Email support, and live API sync status.
  - **Production Resilience**: Wrapped in a root `ErrorBoundary` for graceful crash recovery.

## Tech Stack

- **Expo SDK 58** (`expo ^58.0.26`) & **Expo Router** (`~58.0.32`)
- **React 19.3** & **React Native 0.88**
- **TypeScript 6.0** (`strict: true`)
- `react-native-webview`, `@react-native-async-storage/async-storage`, `expo-image`, `expo-haptics`, `expo-web-browser`

## Local Development

```bash
cd /Users/karthivelu/dev/mobile-apps/poco-naturals
npm install
npm run typecheck
npx expo start --port 8082
```

Then press:
- `i` to open in the iOS Simulator
- `a` to open in the Android Emulator
- `w` to open in the Web browser
- Or scan the QR code with **Expo Go** on your phone.

## CI/CD — Android APK Builds (GitHub Actions)

`.github/workflows/android-apk.yml` automatically builds an Android release APK using **Node 22** and **Java 21**:

- **Triggers**: Every push to `main`, `v*` tags, or manual `workflow_dispatch`.
- **Steps**: `npm ci` → `npm run typecheck` → `npx expo prebuild --platform android --clean --no-install` → `./gradlew assembleRelease --no-daemon`.
- **Artifacts**: Uploads `poco-naturals-<ref>-<sha>.apk` on every run, and automatically publishes a **GitHub Release** with the APK attached when pushing a `v*` tag (e.g. `git tag v1.0.0 && git push origin v1.0.0`).

## Releasing to Google Play Store

Google Play Console requires a **signed `.aab` (Android App Bundle)** rather than a sideloadable `.apk`.

- **Android Package**: `in.poconaturals.app` (`versionCode: 1` in `app.json`)
- **Privacy Policy URL**: `https://poconaturals.in/privacy-policy-2/`

To build a signed Play Store `.aab` using the included `eas.json`:

```bash
npx eas login
npx eas build --platform android --profile production
```

For subsequent Play Store releases, increment `android.versionCode` in `app.json` (or rely on EAS `autoIncrement: true` in the `production` profile).
