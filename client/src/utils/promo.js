export const PROMO_CODE = 'ROSE5';
export const PROMO_DISCOUNT_EUR = 5;
export const WHATSAPP_PHONE = '491701264472';

const supportedLanguages = new Set(['ru', 'de']);

export const normalizePromoLanguage = (language) => {
  const normalized = String(language || '').toLowerCase().split('-')[0];
  return supportedLanguages.has(normalized) ? normalized : 'ru';
};

export const buildPromoWhatsAppMessage = (language) => {
  const lng = normalizePromoLanguage(language);

  if (lng === 'de') {
    return `Hallo! Ich möchte einen Termin buchen. Mein Promo-Code von der Website: ${PROMO_CODE} (-${PROMO_DISCOUNT_EUR} €).`;
  }

  return `Здравствуйте! Хочу записаться на маникюр. Мой промокод с сайта: ${PROMO_CODE} (-${PROMO_DISCOUNT_EUR} €).`;
};

export const buildPromoWhatsAppUrl = (language) => {
  const text = encodeURIComponent(buildPromoWhatsAppMessage(language));
  return `https://wa.me/${WHATSAPP_PHONE}?text=${text}`;
};
