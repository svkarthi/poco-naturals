const { withAndroidManifest } = require('expo/config-plugins');

const UPI_AND_SUPPORT_SCHEMES = [
  'upi',
  'tez',
  'phonepe',
  'paytmmp',
  'bhim',
  'credpay',
  'whatsapp',
  'tel',
  'mailto',
];

/**
 * Adds Android 11+ <queries> intent declarations so Linking.openURL() and WebView
 * payment gateways (Razorpay / Cashfree / PayU) can launch installed UPI apps
 * (GPay, PhonePe, Paytm, BHIM, CRED) and WhatsApp.
 */
function withUpiQueries(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    if (!manifest.queries) {
      manifest.queries = [{}];
    }
    const queriesObj = manifest.queries[0];
    if (!queriesObj.intent) {
      queriesObj.intent = [];
    }

    const existingSchemes = new Set(
      queriesObj.intent.flatMap((intent) =>
        (intent.data || []).map((d) => d.$?.['android:scheme']).filter(Boolean)
      )
    );

    for (const scheme of UPI_AND_SUPPORT_SCHEMES) {
      if (!existingSchemes.has(scheme)) {
        queriesObj.intent.push({
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': scheme } }],
        });
      }
    }

    return mod;
  });
}

module.exports = withUpiQueries;
