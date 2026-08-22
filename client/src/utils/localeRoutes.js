export const SITE_URL = 'https://stuttgartnails.de';

export const LANDING_SLUGS = [
  'gelnagel-stuttgart',
  'manikure-stuttgart',
  'preise',
  'stuttgart-nord',
];

const LEGAL_PAGES = ['impressum', 'datenschutz'];

const normalizePath = (pathname = '/') => pathname.replace(/\/$/, '') || '/';

export const getLangFromPath = (pathname = '/') => {
  const path = normalizePath(pathname);
  if (path === '/ru' || path.startsWith('/ru/')) return 'ru';
  return 'de';
};

export const getLanguagePath = (lang) => (lang === 'ru' ? '/ru' : '/');

export const isHomePath = (pathname = '/') => {
  const path = normalizePath(pathname);
  return path === '/' || path === '/ru';
};

export const getLegalPath = (page, lang) => {
  const prefix = lang === 'ru' ? '/ru' : '';
  return `${prefix}/${page}`;
};

export const getLandingPath = (slug, lang) => {
  const prefix = lang === 'ru' ? '/ru' : '';
  return `${prefix}/${slug}`;
};

export const getPathSlug = (pathname = '/') => {
  const path = normalizePath(pathname);
  const bare = path.startsWith('/ru/') ? path.slice(4) : path.replace(/^\//, '');
  if (LANDING_SLUGS.includes(bare) || LEGAL_PAGES.includes(bare)) return bare;
  return '';
};

export const getSiblingLanguagePath = (pathname, nextLang) => {
  const slug = getPathSlug(pathname);
  if (LANDING_SLUGS.includes(slug)) return getLandingPath(slug, nextLang);
  if (LEGAL_PAGES.includes(slug)) return getLegalPath(slug, nextLang);
  return getLanguagePath(nextLang);
};

export const getHreflangAlternates = (subPath = '') => ({
  de: getCanonicalUrl('de', subPath),
  ru: getCanonicalUrl('ru', subPath),
});

export const getCanonicalUrl = (lang, subPath = '') => {
  const normalized = subPath ? (subPath.startsWith('/') ? subPath : `/${subPath}`) : '';
  if (lang === 'ru') {
    return normalized ? `${SITE_URL}/ru${normalized}` : `${SITE_URL}/ru`;
  }
  return normalized ? `${SITE_URL}${normalized}` : `${SITE_URL}/`;
};
