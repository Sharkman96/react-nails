const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { patchPrerenderHtml, isHomeRelPath } = require('./patch-prerender-html');

const landing = `<!DOCTYPE html><html><head>
<link rel="canonical" href="https://stuttgartnails.de/" />
<link rel="canonical" href="https://stuttgartnails.de/gelnagel-stuttgart" data-rh="true">
<link rel="alternate" hreflang="de" href="https://stuttgartnails.de/" />
<link rel="alternate" hreflang="de" href="https://stuttgartnails.de/gelnagel-stuttgart" data-rh="true">
<meta name="description" content="Home description">
<meta name="description" content="Gelnägel in Stuttgart-Nord" data-rh="true">
<meta name="robots" content="index, follow">
<meta name="robots" content="index, follow" data-rh="true">
<script type="application/ld+json">{ "@type": "FAQPage", "name": "home" }</script>
<script type="application/ld+json" data-rh="true">{"@type":"FAQPage","name":"landing"}</script>
</head><body>
<noscript><h1>Nagelstudio Stuttgart-Nord — SmartNails</h1></noscript>
<h1 class="landing-title">Gelnägel Stuttgart</h1>
</body></html>`;

describe('patchPrerenderHtml', () => {
  test('treats only / and /ru as home', () => {
    assert.equal(isHomeRelPath('index.html'), true);
    assert.equal(isHomeRelPath('ru/index.html'), true);
    assert.equal(isHomeRelPath('gelnagel-stuttgart/index.html'), false);
    assert.equal(isHomeRelPath('ru/preise/index.html'), false);
  });

  test('keeps Helmet canonical and drops homepage leftover on landings', () => {
    const out = patchPrerenderHtml(landing, 'gelnagel-stuttgart/index.html');
    assert.match(out, /canonical" href="https:\/\/stuttgartnails\.de\/gelnagel-stuttgart"/);
    assert.doesNotMatch(out, /rel="canonical" href="https:\/\/stuttgartnails\.de\/"/);
    assert.match(out, /Gelnägel in Stuttgart-Nord/);
    assert.doesNotMatch(out, /Home description/);
    assert.doesNotMatch(out, /<noscript>/);
    assert.doesNotMatch(out, /"name": "home"/);
    assert.match(out, /"name":"landing"/);
    assert.match(out, /hreflang="de" href="https:\/\/stuttgartnails\.de\/gelnagel-stuttgart"/);
    assert.doesNotMatch(out, /hreflang="de" href="https:\/\/stuttgartnails\.de\/"/);
  });

  test('keeps homepage noscript and static JSON-LD', () => {
    const home = landing.replace('gelnagel-stuttgart', 'stuttgartnails.de/');
    const out = patchPrerenderHtml(home, 'index.html');
    assert.match(out, /<noscript>/);
    assert.match(out, /"name": "home"/);
    assert.match(out, /data-rh="true"/);
  });
});
