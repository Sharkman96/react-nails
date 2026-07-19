const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeSpaPath, resolveSpaRequest } = require('./spaRoutes');

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
