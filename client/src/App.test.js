import fs from 'fs';
import path from 'path';
import { BUSINESS, createBeautySalonSchema } from './utils/schema';
import { getCanonicalUrl } from './utils/localeRoutes';

const publicPath = (...segments) => path.join(__dirname, '..', 'public', ...segments);

describe('SEO configuration', () => {
  test('uses one canonical German homepage and Russian alternate', () => {
    expect(getCanonicalUrl('de')).toBe('https://stuttgartnails.de/');
    expect(getCanonicalUrl('ru')).toBe('https://stuttgartnails.de/ru');
  });

  test('keeps /de out of the static sitemap and declares hreflang alternates', () => {
    const sitemap = fs.readFileSync(publicPath('sitemap.xml'), 'utf8');

    expect(sitemap).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(sitemap).toContain('<loc>https://stuttgartnails.de/</loc>');
    expect(sitemap).toContain('<xhtml:link rel="alternate" hreflang="de" href="https://stuttgartnails.de/" />');
    expect(sitemap).toContain('<xhtml:link rel="alternate" hreflang="ru" href="https://stuttgartnails.de/ru" />');
    expect(sitemap).not.toContain('<loc>https://stuttgartnails.de/de</loc>');
  });

  test('sitemap lists only https promotional URLs, not legal pages', () => {
    const sitemap = fs.readFileSync(publicPath('sitemap.xml'), 'utf8');

    expect(sitemap).toContain('<loc>https://stuttgartnails.de/</loc>');
    expect(sitemap).toContain('<loc>https://stuttgartnails.de/ru</loc>');
    expect(sitemap).not.toContain('http://stuttgartnails.de');
    expect(sitemap).not.toContain('stuttgartnails.de/datenschutz');
    expect(sitemap).not.toContain('stuttgartnails.de/impressum');
  });

  test('legal pages request noindex and robots sitemap is https', () => {
    const legal = fs.readFileSync(path.join(__dirname, 'components', 'LegalPage.js'), 'utf8');
    const robots = fs.readFileSync(publicPath('robots.txt'), 'utf8');

    expect(legal).toMatch(/noindex(?:\s*=\s*\{?\s*true)?/);
    expect(robots).toContain('Sitemap: https://stuttgartnails.de/sitemap.xml');
    expect(robots).not.toContain('Sitemap: http://');
  });

  test('references existing logo assets from schema and manifest', () => {
    expect(BUSINESS.logo).toBe('https://stuttgartnails.de/logo512.png');
    expect(fs.existsSync(publicPath('logo192.png'))).toBe(true);
    expect(fs.existsSync(publicPath('logo512.png'))).toBe(true);
    expect(fs.existsSync(publicPath('favicon.ico'))).toBe(true);

    const schema = createBeautySalonSchema();
    expect(schema.logo).toBe(BUSINESS.logo);
    expect(schema.description).toContain('Nagelstudio');
    expect(schema.description).toContain('Stuttgart');
  });
});
