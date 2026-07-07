# Универсальный промпт: SEO для локального бизнес-сайта (SPA)

Собран на основе SEO-настройки **stuttgartnails.de** (React SPA, локальный бизнес, de/ru, JSON-LD, FAQ, sitemap, llms.txt).

Скопируйте блок ниже в Cursor / ChatGPT и замените значения в `[квадратных скобках]`.

---

## Промпт

```
Ты — SEO-инженер и фронтенд-разработчик. Настрой максимальную видимость сайта [НАЗВАНИЕ] в Google и локальном поиске.

### Контекст проекта
- Тип: [одностраничный React SPA / лендинг салона / студии]
- Домен (canonical): https://[домен].de/
- Языки UI: [de, ru, …] — отдельные URL или ?lng= при необходимости
- Локация: [улица и номер], [PLZ] [город], [регион], [страна]
- Координаты: [lat], [lng]
- Google Maps: [URL goo.gl/maps]
- Телефон: [+49 …]
- WhatsApp: [wa.me/…]
- Instagram / соцсети: [URL]
- Ниша: [маникюр / салон / услуги …]
- Запись: [WhatsApp / Instagram]

### Обязательные задачи

#### 1. Статический JSON-LD в index.html (<head>, без JavaScript)
Один блок `<script type="application/ld+json">` с `@graph`:
- **BeautySalon** (или LocalBusiness): name, description, url, telephone, logo, image[], priceRange, address (PostalAddress), geo (GeoCoordinates), areaServed, openingHoursSpecification, **hasMap**, **sameAs** [Instagram, WhatsApp, Google Maps], knowsLanguage
- **WebSite**: @id, url, inLanguage[], publisher → BeautySalon
- **FAQPage**: mainEntity[] — все вопросы/ответы (текст из переводов, язык по умолчанию — de)
- **НЕ добавлять** AggregateRating без реальных отзывов в Google Business

Дублировать динамически через React Helmet только то, что меняется по языку; не дублировать FAQPage дважды.

#### 2. Meta и Open Graph
В index.html + React Helmet:
- title, description, keywords (локальные: «[услуга] [город]»)
- canonical, hreflang (x-default, de, de-DE, ru, ru-RU → /ru)
- robots: index, follow, max-image-preview:large
- og:* и twitter:card summary_large_image, og-image 1200×630
- geo.region, geo.placename, geo.position, ICBM
- theme-color, author
- **Удалить/не использовать:** revisit-after, keywords-spam, фейковый рейтинг

#### 3. robots.txt и sitemap.xml
В `public/` (копируются в build):
- robots.txt: User-agent *, Allow /, Disallow /admin/, /api/, строка `Sitemap: https://[домен]/sitemap.xml`
- sitemap.xml: **только существующие URL** (для SPA: /, /de, /ru — без фиктивных /services/:id)
- На сервере Express: маршруты GET /robots.txt и GET /sitemap.xml (если не чистый static hosting)
- На Vercel: **не** проксировать robots/sitemap на Node, отдавать из build
- В `<head>`: `<link rel="sitemap" href="https://[домен]/sitemap.xml" />`

#### 4. AI / LLM (опционально, но рекомендуется)
- public/llms.txt и llms-full.txt: бренд, адрес, услуги, ключевые слова RU/DE/UK, контакты, Google Maps
- В robots.txt: LLMs-Txt (если нужно)
- `<link rel="alternate" type="text/plain" href="/llms.txt" />`

#### 5. FAQ для индексации
- Секция #faq на главной, 4–6 вопросов (без лишних)
- **Ответы всегда в DOM** — сворачивание только CSS (grid 0fr/1fr), не conditional render / AnimatePresence
- itemScope FAQPage / Question / Answer (микроразметка — дополнение к JSON-LD)
- Статический `<dl>` FAQ в index.html: в `<noscript>` и fallback в `#root` до гидратации
- FAQPage в статическом JSON-LD
- Без дублирующего блока «Свяжитесь с нами» в FAQ, если контакты ниже

#### 6. Контент для краулеров без JS
- `<noscript>`: h1, услуги, адрес (ссылка на Maps), FAQ
- В `#root` до React: article с h1, секции услуг, контакт, FAQ
- **react-snap** (postbuild): include ["/", "/de", "/ru"], skipThirdPartyRequests, prerenderInitial() для framer-motion (без opacity:0 при snap)

#### 7. i18n и SEO
- meta.title, meta.description, meta.keywords в translation.json (de, ru)
- canonical: / для de, /ru для ru
- При загрузке /ru и /de — i18n.changeLanguage по pathname
- Централизовать BUSINESS в utils/schema.js: адрес, geo, sameAs, GOOGLE_MAPS_URL

#### 8. UI / локальное SEO
- Адрес кликабелен → Google Maps (контакты, футер)
- Единый формат адреса везде: «[улица номер], [PLZ] [город]»
- BreadcrumbList в JSON-LD (якоря #services, #gallery, #faq, #contact)

#### 9. Производительность и PWA (не ломать SEO)
- preconnect fonts, favicon.svg + favicon.ico, manifest.json
- sw.js с корректным кешем (не блокировать индексацию)

#### 10. Чего избегать
- Мёртвые URL в sitemap
- JSON-LD только через JS без статики в index.html
- Скрытые от DOM ответы FAQ
- revisit-after, фейковые звёзды, дубли FAQPage
- Разные адреса в schema, meta и UI

### Структура файлов (ориентир)
- client/public/index.html — статический SEO + JSON-LD
- client/public/robots.txt, sitemap.xml
- client/public/llms.txt, og-image.jpg
- client/src/components/SEO.js — Helmet
- client/src/utils/schema.js — BUSINESS, createBeautySalonSchema, createFAQSchema, …
- client/src/App.js — schema + canonical по языку
- routes/sitemap.js — robots + sitemap для Node
- package.json → react-snap postbuild

### Проверка после сборки
1. npm run build → client/build/
2. В build/index.html есть application/ld+json с BeautySalon + FAQPage
3. build/robots.txt и build/sitemap.xml на месте
4. «Просмотр кода» / validator.schema.org — валидная разметка
5. В HTML видны тексты FAQ (не только заголовки вопросов)
6. https://[домен]/robots.txt и /sitemap.xml открываются

### Деплой
Залить client/build/ целиком; при Node — routes/sitemap.js, server.js. Search Console → отправить sitemap. Google Business Profile — тот же адрес и ссылка Maps.

Сделай минимальный diff, следуй стилю проекта, не добавляй лишних зависимостей.
```

---

## Как пользоваться

1. Замените блоки в `[квадратных скобках]` под новый проект.
2. Вставьте промпт в начало задачи в Cursor.
3. Для аудита добавьте: «Проверь живой сайт [URL] и сравни с чеклистом из SEO_PROMPT.md».

---

## Чеклист (кратко)

| Область | Решение |
|--------|---------|
| Локальный бизнес | BeautySalon + hasMap + sameAs |
| Мультиязычность | hreflang + /ru + Helmet |
| FAQ в выдаче | FAQPage + DOM + статика |
| Краулеры без JS | noscript + fallback + react-snap |
| Индексация | robots + sitemap (реальные URL) |
| ИИ-поиск | llms.txt |
| Карты | Ссылка в UI + schema |
| Антипаттерны | Без revisit-after и фейковых рейтингов |

---

## Референс в этом репозитории

- `client/public/index.html` — статический JSON-LD и fallback-контент
- `client/src/utils/schema.js` — константы бизнеса и генераторы schema
- `client/src/components/SEO.js` — React Helmet
- `client/public/robots.txt`, `client/public/sitemap.xml`
- `routes/sitemap.js` — отдача robots/sitemap на Node
