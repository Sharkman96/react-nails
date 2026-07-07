export const SITE_URL = 'https://stuttgartnails.de';

export const getLangFromPath = (pathname = '/') => {
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === '/ru' || path.startsWith('/ru/')) return 'ru';
  return 'de';
};

export const getLanguagePath = (lang) => (lang === 'ru' ? '/ru' : '/');

export const getLegalPath = (page, lang) => {
  const prefix = lang === 'ru' ? '/ru' : '';
  return `${prefix}/${page}`;
};

export const getCanonicalUrl = (lang, subPath = '') => {
  const normalized = subPath ? (subPath.startsWith('/') ? subPath : `/${subPath}`) : '';
  if (lang === 'ru') {
    return normalized ? `${SITE_URL}/ru${normalized}` : `${SITE_URL}/ru`;
  }
  return normalized ? `${SITE_URL}${normalized}` : `${SITE_URL}/`;
};
