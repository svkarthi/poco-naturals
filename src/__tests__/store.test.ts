import { describe, expect, it } from '@jest/globals';

import { mapCategory, mapProduct } from '@/api/woocommerce';
import { makeCartKey } from '@/types/store';
import { resolveExternalCheckoutUrl } from '@/utils/deepLinks';
import {
  decodeHtmlEntities,
  formatInr,
  getDiscountPercent,
  htmlToPlainText,
} from '@/utils/format';

describe('format utilities', () => {
  it('decodes WordPress HTML entities cleanly', () => {
    expect(
      decodeHtmlEntities('Premium Mixed Fruit &#038; Nut Muesli &#8211; 250g')
    ).toBe('Premium Mixed Fruit & Nut Muesli – 250g');
  });

  it('converts HTML descriptions into readable plain text with bullets', () => {
    const html =
      '<p>Cold-pressed oil.</p><ul><li>100% Pure</li><li>No additives</li></ul>';
    expect(htmlToPlainText(html)).toBe(
      'Cold-pressed oil.\n\n• 100% Pure\n• No additives'
    );
  });

  it('formats INR prices in Indian numbering format', () => {
    expect(formatInr(79)).toBe('₹79');
    expect(formatInr(1499)).toBe('₹1,499');
    expect(formatInr(79.5)).toBe('₹79.50');
  });

  it('calculates discount percentage accurately', () => {
    expect(getDiscountPercent(110, 79)).toBe(28);
    expect(getDiscountPercent(100, 100)).toBe(0);
    expect(getDiscountPercent(0, 79)).toBe(0);
  });
});

describe('WooCommerce Store API mappers', () => {
  it('maps minor-unit INR prices and variable product variations', () => {
    const mapped = mapProduct({
      id: 501,
      name: 'Cold-Pressed Coconut Oil &#038; Virgin',
      slug: 'cold-pressed-coconut-oil',
      type: 'variable',
      permalink: 'https://poconaturals.in/product/cold-pressed-coconut-oil/',
      on_sale: true,
      prices: {
        price: '19900',
        regular_price: '24900',
        sale_price: '19900',
        currency_symbol: '₹',
        currency_minor_unit: 2,
      },
      variations: [
        { id: 502, attributes: [{ name: 'Size', value: '500 ml' }] },
        { id: 503, attributes: [{ name: 'Size', value: '1 Litre' }] },
      ],
      is_in_stock: true,
    });

    expect(mapped.name).toBe('Cold-Pressed Coconut Oil & Virgin');
    expect(mapped.price).toBe(199);
    expect(mapped.regularPrice).toBe(249);
    expect(mapped.onSale).toBe(true);
    expect(mapped.variations).toHaveLength(2);
    expect(mapped.variations?.[0]).toEqual({
      id: 502,
      label: '500 ml',
      attributes: [{ name: 'Size', value: '500 ml' }],
    });
  });

  it('maps categories with fallback permalinks', () => {
    const cat = mapCategory({
      id: 24,
      name: 'Palm &#038; Jaggery',
      slug: 'palm-products',
      count: 2,
    });
    expect(cat.name).toBe('Palm & Jaggery');
    expect(cat.permalink).toBe(
      'https://poconaturals.in/product-category/palm-products/'
    );
  });

  it('builds distinct cart keys for simple and variable products', () => {
    expect(makeCartKey(483)).toBe('483:0');
    expect(makeCartKey(501, 502)).toBe('501:502');
  });
});

describe('resolveExternalCheckoutUrl (UPI & WebView intents)', () => {
  it('allows normal HTTPS store URLs to stay in WebView', () => {
    expect(
      resolveExternalCheckoutUrl('https://poconaturals.in/checkout/')
    ).toEqual({ shouldIntercept: false });
  });

  it('intercepts direct Indian UPI payment schemes', () => {
    expect(
      resolveExternalCheckoutUrl('upi://pay?pa=poco@okaxis&pn=POCONaturals&am=299')
    ).toEqual({
      shouldIntercept: true,
      targetUrl: 'upi://pay?pa=poco@okaxis&pn=POCONaturals&am=299',
    });

    expect(resolveExternalCheckoutUrl('phonepe://pay?pa=poco@ybl')).toEqual({
      shouldIntercept: true,
      targetUrl: 'phonepe://pay?pa=poco@ybl',
    });
  });

  it('parses Android Chrome intent:// UPI URLs with fallback URLs', () => {
    const intentUrl =
      'intent://pay?pa=poco@okaxis&am=199#Intent;scheme=tez;package=com.google.android.apps.nbu.paisa.user;S.browser_fallback_url=https%3A%2F%2Fpoconaturals.in%2Fcheckout%2F;end';

    expect(resolveExternalCheckoutUrl(intentUrl)).toEqual({
      shouldIntercept: true,
      targetUrl: 'tez://pay?pa=poco@okaxis&am=199',
      fallbackUrl: 'https://poconaturals.in/checkout/',
    });
  });

  it('intercepts WhatsApp and phone support links', () => {
    expect(
      resolveExternalCheckoutUrl('https://wa.me/919994369555')
    ).toEqual({
      shouldIntercept: true,
      targetUrl: 'https://wa.me/919994369555',
    });
    expect(resolveExternalCheckoutUrl('tel:+919994369555')).toEqual({
      shouldIntercept: true,
      targetUrl: 'tel:+919994369555',
    });
  });
});
