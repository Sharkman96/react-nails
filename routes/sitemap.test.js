const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { buildSitemapXml } = require('./sitemap');

describe('buildSitemapXml', () => {
  test('includes only https promotional URLs', () => {
    const xml = buildSitemapXml();
    assert.match(xml, /<loc>https:\/\/stuttgartnails\.de\/<\/loc>/);
    assert.match(xml, /<loc>https:\/\/stuttgartnails\.de\/ru<\/loc>/);
    assert.match(xml, /<loc>https:\/\/stuttgartnails\.de\/gelnagel-stuttgart<\/loc>/);
    assert.match(xml, /<loc>https:\/\/stuttgartnails\.de\/ru\/preise<\/loc>/);
    assert.doesNotMatch(xml, /http:\/\/stuttgartnails\.de/);
    assert.doesNotMatch(xml, /datenschutz/);
    assert.doesNotMatch(xml, /impressum/);
  });
});
