# SEO indexing & soft-404 fix — Design

**Date:** 2026-07-19  
**Site:** https://stuttgartnails.de  
**Status:** Approved (full fix: app + nginx)

## Problem

Google Search Console Coverage (2026-07-19) reports **«Страница с переадресацией»** for 4 URLs. Separately, spam URLs like `/am/bokop-asia-...` return **HTTP 200** with the German homepage HTML (soft-404), which lets SEO spam enter Google’s index/reports.

Root causes:

1. Express catch-all `app.get('*')` always sends `index.html` with status 200.
2. React `path="*"` client-redirects unknown paths to `/`.
3. Nginx adds trailing slash (`/ru` → `/ru/`) while sitemap/canonical use `/ru`.
4. `www` and apex both serve 200 (duplicate host).

## Goals

- Unknown paths return **HTTP 404** (not 200 + homepage).
- Single canonical host: `https://stuttgartnails.de` (no www).
- No trailing slash on public HTML URLs; slash variants 301 to non-slash.
- Spam URL disappears from Google after re-crawl / Removals.
- GSC redirect noise for `/ru` resolved.

## Non-goals

- Full security audit of auth/upload.
- Ranking content/copy changes.
- Changing language strategy (de at `/`, ru at `/ru`).

## URL policy

| Rule | Value |
|------|--------|
| Canonical host | `https://stuttgartnails.de` |
| Trailing slash | Forbidden on HTML routes (except `/` itself) |
| Allowed HTML routes | `/`, `/ru`, `/impressum`, `/datenschutz`, `/ru/impressum`, `/ru/datenschutz` |
| `/de`, `/de/` | 301 → `/` |
| `https://www.*` | 301 → apex same path |
| `http://*` | 301 → `https://stuttgartnails.de` + path |

## Architecture

```
Browser/Crawler
    → nginx (HTTPS, www→apex, no forced trailing slash)
    → Express
         → API / static / sitemap / robots (unchanged)
         → normalize trailing slash (301)
         → allowlist SPA routes → locale index.html (200)
         → else → 404.html with status 404 + noindex
```

React unknown routes render a NotFound page (`noindex`) instead of `<Navigate to="/" />`.

## Components

1. **`lib/spaRoutes.js`** — pure helpers: allowlist, normalize path, decide 301/200/404.
2. **`server.js`** — use helpers; stop open catch-all 200.
3. **`client/public/404.html`** — minimal static 404 for crawlers (noindex).
4. **`client/src/components/NotFound.js`** + **`App.js`** — client 404 UX.
5. **`DEPLOY_VPS.md`** — nginx snippet for host canonicalization.

## Security note

Spam URL is not a stored porn page; it is SEO abuse of soft-404. Fix is correct status codes + host canonicalization. No evidence of WordPress/malware file from live probes.

## GSC follow-up (manual)

1. Removals → temporary removal for spam URL(s).
2. URL Inspection → request indexing for `/` and `/ru`.
3. Re-check Coverage after re-crawl.

## Success criteria

- `curl -sI https://stuttgartnails.de/am/anything` → `404`
- `curl -sI https://stuttgartnails.de/ru` → `200` (not 301 to `/ru/`)
- `curl -sI https://www.stuttgartnails.de/` → `301` Location `https://stuttgartnails.de/`
- `curl -sI http://stuttgartnails.de/` → `301` to HTTPS apex
- Sitemap locs still match live 200 URLs without redirect chain
