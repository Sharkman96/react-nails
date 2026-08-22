'use strict';

const { landingSpaPaths } = require('./landingPages');

const CANONICAL_ORIGIN = 'https://stuttgartnails.de';

const ALLOWED_SPA_PATHS = new Set([
  '/',
  '/ru',
  '/impressum',
  '/datenschutz',
  '/ru/impressum',
  '/ru/datenschutz',
  ...landingSpaPaths(),
]);

const NOINDEX_SPA_PATHS = new Set([
  '/impressum',
  '/datenschutz',
  '/ru/impressum',
  '/ru/datenschutz',
]);

function normalizeSpaPath(pathname) {
  if (!pathname || typeof pathname !== 'string') return '/';
  let path = pathname.split('?')[0].split('#')[0];
  if (!path.startsWith('/')) path = `/${path}`;
  path = path.replace(/\/+/g, '/');
  return path || '/';
}

function trimTrailingSlash(path) {
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}

function localeForPath(path) {
  return path === '/ru' || path.startsWith('/ru/') ? 'ru' : 'de';
}

function resolveSpaRequest(pathname) {
  const raw = normalizeSpaPath(pathname);
  const path = trimTrailingSlash(raw);

  if (path === '/de') {
    return { type: 'redirect', location: '/', status: 301 };
  }

  if (raw !== path) {
    return { type: 'redirect', location: path, status: 301 };
  }

  if (ALLOWED_SPA_PATHS.has(path)) {
    return { type: 'spa', path, locale: localeForPath(path) };
  }

  return { type: 'notfound' };
}

function isNoindexSpaPath(pathname) {
  const path = trimTrailingSlash(normalizeSpaPath(pathname));
  return NOINDEX_SPA_PATHS.has(path);
}

function robotsTagForPath(pathname) {
  return isNoindexSpaPath(pathname) ? 'noindex, follow' : null;
}

function isPublicHttpHost(host) {
  const h = String(host || '').split(':')[0].toLowerCase();
  return h === 'stuttgartnails.de' || h === 'www.stuttgartnails.de';
}

function httpsCanonicalUrl(pathnameAndSearch) {
  const raw = String(pathnameAndSearch || '/');
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${CANONICAL_ORIGIN}${path}`;
}

module.exports = {
  ALLOWED_SPA_PATHS,
  NOINDEX_SPA_PATHS,
  CANONICAL_ORIGIN,
  normalizeSpaPath,
  resolveSpaRequest,
  isNoindexSpaPath,
  robotsTagForPath,
  isPublicHttpHost,
  httpsCanonicalUrl,
};
