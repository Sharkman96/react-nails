const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeSpaPath,
  resolveSpaRequest,
  isNoindexSpaPath,
  robotsTagForPath,
  httpsCanonicalUrl,
  isPublicHttpHost,
} = require('./spaRoutes');

describe('normalizeSpaPath', () => {
  test('strips query and hash', () => {
    assert.equal(normalizeSpaPath('/ru?x=1#y'), '/ru');
  });

  test('collapses duplicate slashes', () => {
    assert.equal(normalizeSpaPath('//ru//datenschutz'), '/ru/datenschutz');
  });
});

describe('resolveSpaRequest', () => {
  test('serves German home', () => {
    assert.deepEqual(resolveSpaRequest('/'), { type: 'spa', path: '/', locale: 'de' });
  });

  test('serves Russian home without trailing slash', () => {
    assert.deepEqual(resolveSpaRequest('/ru'), { type: 'spa', path: '/ru', locale: 'ru' });
  });

  test('redirects trailing slash on /ru/', () => {
    assert.deepEqual(resolveSpaRequest('/ru/'), {
      type: 'redirect',
      location: '/ru',
      status: 301,
    });
  });

  test('redirects /de to /', () => {
    assert.deepEqual(resolveSpaRequest('/de'), {
      type: 'redirect',
      location: '/',
      status: 301,
    });
  });

  test('serves legal pages', () => {
    assert.equal(resolveSpaRequest('/datenschutz').type, 'spa');
    assert.equal(resolveSpaRequest('/ru/impressum').type, 'spa');
    assert.equal(resolveSpaRequest('/ru/datenschutz').locale, 'ru');
  });

  test('serves landing pages in both locales', () => {
    assert.deepEqual(resolveSpaRequest('/gelnagel-stuttgart'), {
      type: 'spa',
      path: '/gelnagel-stuttgart',
      locale: 'de',
    });
    assert.deepEqual(resolveSpaRequest('/ru/preise'), {
      type: 'spa',
      path: '/ru/preise',
      locale: 'ru',
    });
    assert.equal(resolveSpaRequest('/stuttgart-nord/').type, 'redirect');
  });

  test('unknown spam path is notfound', () => {
    assert.deepEqual(
      resolveSpaRequest('/am/bokop-asia-free-download-video-mp4-porn-video-perawat-ngentot-krgzmfirz3gzb'),
      { type: 'notfound' }
    );
  });

  test('wp-admin is notfound', () => {
    assert.deepEqual(resolveSpaRequest('/wp-admin'), { type: 'notfound' });
  });
});

describe('noindex legal pages', () => {
  test('marks datenschutz and impressum as noindex', () => {
    assert.equal(isNoindexSpaPath('/datenschutz'), true);
    assert.equal(isNoindexSpaPath('/impressum'), true);
    assert.equal(isNoindexSpaPath('/ru/datenschutz'), true);
    assert.equal(isNoindexSpaPath('/ru/impressum'), true);
    assert.equal(isNoindexSpaPath('/datenschutz/'), true);
  });

  test('does not noindex promotional pages', () => {
    assert.equal(isNoindexSpaPath('/'), false);
    assert.equal(isNoindexSpaPath('/ru'), false);
    assert.equal(isNoindexSpaPath('/gelnagel-stuttgart'), false);
    assert.equal(isNoindexSpaPath('/ru/stuttgart-nord'), false);
  });

  test('sets X-Robots-Tag only for legal pages', () => {
    assert.equal(robotsTagForPath('/datenschutz'), 'noindex, follow');
    assert.equal(robotsTagForPath('/ru/impressum'), 'noindex, follow');
    assert.equal(robotsTagForPath('/'), null);
    assert.equal(robotsTagForPath('/ru'), null);
  });
});

describe('https canonical', () => {
  test('builds https apex URL', () => {
    assert.equal(httpsCanonicalUrl('/'), 'https://stuttgartnails.de/');
    assert.equal(httpsCanonicalUrl('/ru'), 'https://stuttgartnails.de/ru');
    assert.equal(httpsCanonicalUrl('/datenschutz'), 'https://stuttgartnails.de/datenschutz');
  });

  test('recognizes public http hosts that must redirect', () => {
    assert.equal(isPublicHttpHost('stuttgartnails.de'), true);
    assert.equal(isPublicHttpHost('www.stuttgartnails.de'), true);
    assert.equal(isPublicHttpHost('localhost'), false);
    assert.equal(isPublicHttpHost('127.0.0.1'), false);
  });
});
