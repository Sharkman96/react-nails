const express = require('express');
const router = express.Router();
const GalleryItem = require('../models/GalleryItem');
const Service = require('../models/Service');

// Генерация sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://stuttgartnails.de';
    const currentDate = new Date().toISOString();
    
    // Получаем данные для sitemap
    const galleryItems = await GalleryItem.find({ isActive: true }).select('_id updatedAt');
    const services = await Service.find({ isActive: true }).select('_id updatedAt');
    
    // Статические страницы
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/services', priority: '0.9', changefreq: 'weekly' },
      { url: '/gallery', priority: '0.8', changefreq: 'weekly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/about', priority: '0.6', changefreq: 'monthly' }
    ];
    
    // Динамические страницы галереи
    const galleryPages = galleryItems.map(item => ({
      url: `/gallery/${item._id}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: item.updatedAt.toISOString()
    }));
    
    // Динамические страницы услуг
    const servicePages = services.map(service => ({
      url: `/services/${service._id}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: service.updatedAt.toISOString()
    }));
    
    // Объединяем все страницы
    const allPages = [...staticPages, ...galleryPages, ...servicePages];
    
    // Генерируем XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    allPages.forEach(page => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
      sitemap += `    <lastmod>${page.lastmod || currentDate}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });
    
    sitemap += '</urlset>';
    
    // Устанавливаем заголовки
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600'); // Кэшируем на 1 час
    res.send(sitemap);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Генерация robots.txt
router.get('/robots.txt', (req, res) => {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://stuttgartnails.de/sitemap.xml

# Disallow admin panel
Disallow: /admin/
Disallow: /api/

# Crawl-delay
Crawl-delay: 1`;

  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 'public, max-age=86400'); // Кэшируем на 24 часа
  res.send(robotsTxt);
});

module.exports = router; 