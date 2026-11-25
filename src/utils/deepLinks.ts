const EXTERNAL_SCHEMES = new Set([
  'upi:',
  'tez:',
  'phonepe:',
  'paytmmp:',
  'bhim:',
  'credpay:',
  'whatsapp:',
  'tel:',
  'mailto:',
]);

export interface ExternalUrlResolution {
  shouldIntercept: boolean;
  targetUrl?: string;
  fallbackUrl?: string;
}

/**
 * Determines whether a WebView navigation URL should stay inside the WebView
 * (standard http/https/about/blob/data) or be intercepted and launched via
 * Linking.openURL() — including Indian UPI payment intents (`upi://`, `tez://`,
 * `phonepe://`, `paytmmp://`, and Android `intent://...#Intent;scheme=...;end`).
 */
export function resolveExternalCheckoutUrl(url: string): ExternalUrlResolution {
  if (!url) {
    return { shouldIntercept: false };
  }

  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.startsWith('https://') ||
    lower.startsWith('http://') ||
    lower.startsWith('about:') ||
    lower.startsWith('data:') ||
    lower.startsWith('blob:')
  ) {
    // Intercept WhatsApp web links so they open natively when installed
    if (
      lower.startsWith('https://wa.me/') ||
      lower.startsWith('https://api.whatsapp.com/')
    ) {
      return { shouldIntercept: true, targetUrl: trimmed };
    }
    return { shouldIntercept: false };
  }

  // Parse Android Chrome intent:// URLs emitted by Razorpay / Cashfree / PayU
  // Format: intent://pay?pa=...#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;S.browser_fallback_url=...;end
  if (lower.startsWith('intent://')) {
    const hashIdx = trimmed.indexOf('#Intent;');
    if (hashIdx !== -1) {
      const pathAndQuery = trimmed.slice('intent://'.length, hashIdx);
      const fragment = trimmed.slice(hashIdx + '#Intent;'.length);
      const parts = fragment.split(';');
      let scheme = 'upi';
      let fallbackUrl: string | undefined;

      for (const part of parts) {
        if (part.startsWith('scheme=')) {
          scheme = part.slice('scheme='.length) || 'upi';
        } else if (part.startsWith('S.browser_fallback_url=')) {
          try {
            fallbackUrl = decodeURIComponent(
              part.slice('S.browser_fallback_url='.length)
            );
          } catch {
            fallbackUrl = undefined;
          }
        }
      }

      return {
        shouldIntercept: true,
        targetUrl: `${scheme}://${pathAndQuery}`,
        fallbackUrl,
      };
    }

    return {
      shouldIntercept: true,
      targetUrl: trimmed.replace(/^intent:\/\//i, 'upi://'),
    };
  }

  const colonIdx = lower.indexOf(':');
  if (colonIdx > 0) {
    const schemeWithColon = lower.slice(0, colonIdx + 1);
    if (EXTERNAL_SCHEMES.has(schemeWithColon)) {
      return { shouldIntercept: true, targetUrl: trimmed };
    }
  }

  return { shouldIntercept: false };
}
