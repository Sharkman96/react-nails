# ailog

## 2026-07-19 — SEO / индексация / spam URL

### Действие
Анализ Google Search Console Coverage Drilldown + live-проверка stuttgartnails.de.

### Источники
- `Диаграмма.csv`, `Метаданные.csv`, `Таблица.csv` (Coverage Drilldown 2026-07-19)
- Live HTTP probes: spam URL, /ru, http/https, www, sitemap, robots

### Результат
- GSC проблема: «Страница с переадресацией» — 4 URL (рост с 30.05 → 4 к 01.07).
- Spam URL `/am/bokop-asia-...` отдаёт **200** + немецкий homepage HTML (soft-404 SPA catch-all), не отдельный porn-файл.
- Корневая причина soft-404: `server.js` catch-all → `index.html` + React `Navigate to="/"`.
- Дополнительно: `/ru` → 301 `/ru/` (express.static directory redirect), `www` и apex оба 200, http→https 301.

## 2026-07-19 — Design + plan

### Действие
Пользователь выбрал полный фикс (app + nginx). Написаны design spec и implementation plan.

### Результат
- Spec: `docs/superpowers/specs/2026-07-19-seo-indexing-soft404-design.md`
- Plan: `docs/superpowers/plans/2026-07-19-seo-indexing-soft404.md`

## 2026-07-19 — Implementation (inline)

### Действие
Ветка `fix/seo-soft404-indexing`. Tasks 1–5 из плана.

### Результат кода
- `lib/spaRoutes.js` + тесты (9 PASS)
- Express: allowlist до static, prerender HTML, unknown → 404.html
- React: `NotFound` + noindex вместо redirect на `/`
- `DEPLOY_VPS.md`: nginx www→apex, без forced trailing slash, GSC checklist

### Локальная верификация (PORT 5055)
| URL | Status |
|-----|--------|
| `/am/spam-test` | 404 |
| `/ru` | 200 |
| `/ru/` | 301 → `/ru` |
| `/de` | 301 → `/` |
| `/ru/datenschutz` | 200 |
| `/` | 200 |

### Client tests
- 2 suites / 7 tests PASS

### Pending (VPS + GSC)
- Задеплоить код + обновить nginx по `DEPLOY_VPS.md`
- Live curl на production (сейчас на проде ещё soft-404)
- GSC Removals для spam URL + Request indexing `/` и `/ru`

## 2026-07-19 — Fix react-snap build noise

### Причины
- `public/404.html` + react-snap `crawl:true` → автокраул `/404.html`
- `hydrateRoot` + перезаписанный index → React #418/#423
- `i18next-http-backend` при bundled resources → ERR_FAILED

### Исправления
- `notfound.html` вместо `404.html` для Express
- `reactSnap.crawl: false`
- `createRoot` вместо hydrate
- убран http Backend; loading-gate/theme для snap

### Локальная проверка
- crawl 6/6, без #418/#423; остались ERR_FAILED (fonts + skipThirdPartyRequests) и lazy img warning

## 2026-07-19 — nginx port 5010

### Действие
В `DEPLOY_VPS.md` все `3847` → `5010` (`proxy_pass` и health-check).
Отдельно: вопрос про Google-отзывы — варианты предложены, реализация ждёт выбора.
