/**
 * Decode common HTML entities returned by WordPress / WooCommerce APIs.
 */
export function decodeHtmlEntities(input: string): string {
  if (!input) return '';
  return input
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
}

/**
 * Strip HTML tags into clean, readable plain text with paragraph breaks.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';
  const withBreaks = html
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n');
  const stripped = withBreaks.replace(/<[^>]+>/g, '');
  return decodeHtmlEntities(stripped)
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Format INR currency nicely (e.g., ₹79 or ₹1,299).
 */
export function formatInr(amount: number, symbol = '₹'): string {
  const rounded = Math.round(amount * 100) / 100;
  const isWhole = Number.isInteger(rounded);
  return `${symbol}${rounded.toLocaleString('en-IN', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Calculate discount percentage between regular MRP and sale price.
 */
export function getDiscountPercent(regularPrice: number, price: number): number {
  if (!regularPrice || regularPrice <= price) return 0;
  return Math.round(((regularPrice - price) / regularPrice) * 100);
}
