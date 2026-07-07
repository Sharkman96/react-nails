import {
  PROMO_CODE,
  buildPromoWhatsAppMessage,
  buildPromoWhatsAppUrl,
  normalizePromoLanguage,
} from './promo';

describe('promo WhatsApp helpers', () => {
  test('builds Russian lead-tracking message with promo code', () => {
    const message = buildPromoWhatsAppMessage('ru');

    expect(message).toContain(PROMO_CODE);
    expect(message).toContain('Хочу записаться');
    expect(message).toContain('с сайта');
  });

  test('builds German lead-tracking message with promo code', () => {
    const message = buildPromoWhatsAppMessage('de');

    expect(message).toContain(PROMO_CODE);
    expect(message).toContain('Ich möchte');
    expect(message).toContain('Website');
  });

  test('normalizes unsupported languages to Russian fallback', () => {
    expect(normalizePromoLanguage('uk')).toBe('ru');
    expect(normalizePromoLanguage('de-DE')).toBe('de');
  });

  test('builds encoded WhatsApp URL for current language', () => {
    const url = buildPromoWhatsAppUrl('de');

    expect(url).toMatch(/^https:\/\/wa\.me\/491701264472\?text=/);
    expect(decodeURIComponent(url)).toContain(PROMO_CODE);
    expect(decodeURIComponent(url)).toContain('Website');
  });
});
