const express = require('express');
const router = express.Router();

const BASE_URL = 'https://stuttgartnails.de';

/** Одностраничный сайт: только реальные URL без «мёртвых» /services/:id */
const buildSitemapXml = () => {
  const lastmod = new Date().toISOString().split('T')[0];
  const pages = [
    {
      loc: `${BASE_URL}/`,
      changefreq: 'weekly',
      priority: '1.0',
      alternates: [
        { hreflang: 'x-default', href: `${BASE_URL}/` },
        { hreflang: 'de', href: `${BASE_URL}/` },
        { hreflang: 'de-DE', href: `${BASE_URL}/` },
        { hreflang: 'ru', href: `${BASE_URL}/ru` },
        { hreflang: 'ru-RU', href: `${BASE_URL}/ru` },
      ],
    },
    {
      loc: `${BASE_URL}/ru`,
      changefreq: 'weekly',
      priority: '0.9',
      alternates: [
        { hreflang: 'x-default', href: `${BASE_URL}/` },
        { hreflang: 'de', href: `${BASE_URL}/` },
        { hreflang: 'de-DE', href: `${BASE_URL}/` },
        { hreflang: 'ru', href: `${BASE_URL}/ru` },
        { hreflang: 'ru-RU', href: `${BASE_URL}/ru` },
      ],
    },
    { loc: `${BASE_URL}/impressum`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${BASE_URL}/datenschutz`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${BASE_URL}/ru/impressum`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${BASE_URL}/ru/datenschutz`, changefreq: 'monthly', priority: '0.5' },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  pages.forEach((page) => {
    xml += '  <url>\n';
    xml += `    <loc>${page.loc}</loc>\n`;
    page.alternates?.forEach((alternate) => {
      xml += `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />\n`;
    });
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
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
