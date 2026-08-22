const express = require('express');
const { LANDING_SLUGS } = require('../lib/landingPages');
const router = express.Router();

const BASE_URL = 'https://stuttgartnails.de';

const homeAlternates = [
  { hreflang: 'x-default', href: `${BASE_URL}/` },
  { hreflang: 'de', href: `${BASE_URL}/` },
  { hreflang: 'de-DE', href: `${BASE_URL}/` },
  { hreflang: 'ru', href: `${BASE_URL}/ru` },
  { hreflang: 'ru-RU', href: `${BASE_URL}/ru` },
];

const landingAlternates = (slug) => [
  { hreflang: 'x-default', href: `${BASE_URL}/${slug}` },
  { hreflang: 'de', href: `${BASE_URL}/${slug}` },
  { hreflang: 'de-DE', href: `${BASE_URL}/${slug}` },
  { hreflang: 'ru', href: `${BASE_URL}/ru/${slug}` },
  { hreflang: 'ru-RU', href: `${BASE_URL}/ru/${slug}` },
];

/** Главная + посадочные. Legal-страницы в sitemap не попадают. */
const buildSitemapXml = () => {
  const lastmod = new Date().toISOString().split('T')[0];
  const pages = [
    {
      loc: `${BASE_URL}/`,
      changefreq: 'weekly',
      priority: '1.0',
      alternates: homeAlternates,
    },
    {
      loc: `${BASE_URL}/ru`,
      changefreq: 'weekly',
      priority: '0.9',
      alternates: homeAlternates,
    },
    ...LANDING_SLUGS.flatMap((slug) => [
      {
        loc: `${BASE_URL}/${slug}`,
        changefreq: 'weekly',
        priority: '0.8',
        alternates: landingAlternates(slug),
      },
      {
        loc: `${BASE_URL}/ru/${slug}`,
        changefreq: 'weekly',
        priority: '0.7',
        alternates: landingAlternates(slug),
      },
    ]),
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  pages.forEach((page) => {
    xml += '  <url>\n';
    xml += `    <loc>${page.loc}</loc>\n`;
    page.alternates?.forEach((alternate) => {
      xml += `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />\n`;
    });
    xml += `    <lastmod>${page.lastmod || lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
};

router.get('/sitemap.xml', (req, res) => {
  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(buildSitemapXml());
});

const ROBOTS_TXT = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://stuttgartnails.de/sitemap.xml

LLMs-Txt: https://stuttgartnails.de/llms.txt
LLMs-Txt-Full: https://stuttgartnails.de/llms-full.txt

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Anthropic-AI
Allow: /

User-agent: ClaudeBot
Allow: /
`;

router.get('/robots.txt', (req, res) => {
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(ROBOTS_TXT);
});

module.exports = router;
module.exports.buildSitemapXml = buildSitemapXml;
