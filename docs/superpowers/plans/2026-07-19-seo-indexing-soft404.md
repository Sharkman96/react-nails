# SEO indexing & soft-404 fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop soft-404 spam indexing and fix GSC redirect noise by allowing only real HTML routes (404 otherwise) and canonicalizing host/trailing-slash via Express + nginx.

**Architecture:** Pure route policy in `lib/spaRoutes.js`; Express serves locale HTML only for allowlisted paths and returns `404.html` with status 404 for everything else; React shows NotFound instead of redirecting to `/`; nginx forces HTTPS apex without www and without forcing trailing slashes.

**Tech Stack:** Node 18+, Express 4, React 18, react-router-dom 7, nginx, `node:test` for route-policy unit tests, CRA Jest for client SEO tests.

## Global Constraints

- Canonical host: `https://stuttgartnails.de` (never www in Location/canonical/sitemap).
- HTML routes: no trailing slash except `/`.
- Allowed HTML routes only: `/`, `/ru`, `/impressum`, `/datenschutz`, `/ru/impressum`, `/ru/datenschutz`.
- `/de` and `/de/` always 301 → `/`.
- Unknown paths: HTTP 404 + `noindex` (never 200 homepage).
- No new npm dependencies.
- Do not weaken CSRF/rate-limit/upload security middleware.
- Match existing code style; no drive-by refactors.

## File map

| File | Responsibility |
|------|----------------|
| `lib/spaRoutes.js` | Allowlist + path normalize + status decision |
| `lib/spaRoutes.test.js` | Unit tests for route policy |
| `server.js` | Wire policy into Express after static; send 404.html |
| `client/public/404.html` | Crawler-facing 404 document |
| `client/src/components/NotFound.js` | Client 404 page with SEO noindex |
| `client/src/App.js` | Use NotFound on `*` |
| `client/src/App.test.js` | Assert allowlist/404 policy helpers stay aligned (optional import via shared constants duplicated carefully — see Task 3) |
| `DEPLOY_VPS.md` | Nginx canonical host config |
| `package.json` | Add `test:spa-routes` script |
| `ailog.md` | Session log |

---

### Task 1: SPA route policy module + failing tests

**Files:**
- Create: `lib/spaRoutes.js`
- Create: `lib/spaRoutes.test.js`
- Modify: `package.json` (add test script)

**Interfaces:**
- Consumes: none
- Produces:
  - `ALLOWED_SPA_PATHS: ReadonlySet<string> | string[]`
  - `normalizeSpaPath(pathname: string): string` — strip query/hash; collapse duplicate slashes; ensure leading `/`; treat empty as `/`
  - `resolveSpaRequest(pathname: string): { type: 'redirect', location: string, status: 301 } | { type: 'spa', path: string, locale: 'de' | 'ru' } | { type: 'notfound' }`

- [ ] **Step 1: Write the failing tests**

Create `lib/spaRoutes.test.js`:

```js
const { test, describe } = require('node:test');
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test lib/spaRoutes.test.js`  
Expected: FAIL (module missing or exports missing)

- [ ] **Step 3: Implement `lib/spaRoutes.js`**

```js
'use strict';

const ALLOWED_SPA_PATHS = new Set([
  '/',
  '/ru',
  '/impressum',
  '/datenschutz',
  '/ru/impressum',
  '/ru/datenschutz',
]);

function normalizeSpaPath(pathname) {
  if (!pathname || typeof pathname !== 'string') return '/';
  let path = pathname.split('?')[0].split('#')[0];
  if (!path.startsWith('/')) path = `/${path}`;
  path = path.replace(/\/+/g, '/');
  if (path.length > 1 && path.endsWith('/')) {
    // keep trailing slash for redirect detection by caller via raw vs trimmed
  }
  return path || '/';
}

function trimTrailingSlash(path) {
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}

function localeForPath(path) {
  return path === '/ru' || path.startsWith('/ru/') ? 'ru' : 'de';
}

function resolveSpaRequest(pathname) {
  const raw = normalizeSpaPath(pathname);
  const path = trimTrailingSlash(raw);

  if (path === '/de') {
    return { type: 'redirect', location: '/', status: 301 };
  }

  if (raw !== path) {
    return { type: 'redirect', location: path, status: 301 };
  }

  if (ALLOWED_SPA_PATHS.has(path)) {
    return { type: 'spa', path, locale: localeForPath(path) };
  }

  return { type: 'notfound' };
}

module.exports = {
  ALLOWED_SPA_PATHS,
  normalizeSpaPath,
  resolveSpaRequest,
};
```

Note: `normalizeSpaPath` must **preserve** a single trailing slash so `resolveSpaRequest` can detect `/ru/` vs `/ru`. Do not strip slash inside `normalizeSpaPath`; only collapse `//` and strip query/hash.

Corrected `normalizeSpaPath`:

```js
function normalizeSpaPath(pathname) {
  if (!pathname || typeof pathname !== 'string') return '/';
  let path = pathname.split('?')[0].split('#')[0];
  if (!path.startsWith('/')) path = `/${path}`;
  path = path.replace(/\/+/g, '/');
  return path || '/';
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test lib/spaRoutes.test.js`  
Expected: all tests PASS

- [ ] **Step 5: Add npm script**

In root `package.json` scripts:

```json
"test:spa-routes": "node --test lib/spaRoutes.test.js"
```

- [ ] **Step 6: Commit**

```bash
git add lib/spaRoutes.js lib/spaRoutes.test.js package.json
git commit -m "$(cat <<'EOF'
feat: add SPA allowlist route policy for SEO soft-404 prevention

EOF
)"
```

---

### Task 2: Express wiring — 404 for unknown routes

**Files:**
- Create: `client/public/404.html`
- Modify: `server.js` (replace `/ru`, `/de`, and `app.get('*')` block ~266–275)

**Interfaces:**
- Consumes: `resolveSpaRequest` from `./lib/spaRoutes`
- Produces: HTTP behavior per success criteria in design spec

- [ ] **Step 1: Create `client/public/404.html`**

```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>404 — Seite nicht gefunden | SmartNails Stuttgart</title>
    <style>
      body { font-family: Georgia, 'Times New Roman', serif; margin: 0; min-height: 100vh; display: grid; place-items: center; background: linear-gradient(160deg, #f7eef1 0%, #f3f6f8 55%, #efe6e9 100%); color: #2a2226; }
      main { text-align: center; padding: 2rem; }
      a { color: #8b4558; }
    </style>
  </head>
  <body>
    <main>
      <h1>404</h1>
      <p>Seite nicht gefunden.</p>
      <p><a href="/">Zur Startseite</a> · <a href="/ru">На главную (RU)</a></p>
    </main>
  </body>
</html>
```

- [ ] **Step 2: Replace locale + catch-all in `server.js`**

Require near other requires:

```js
const { resolveSpaRequest } = require('./lib/spaRoutes');
```

Remove:

```js
app.get('/ru', (req, res) => sendLocaleIndex('ru', res));
app.get('/de', (req, res) => res.redirect(301, '/'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});
```

Add (keep `sendLocaleIndex` helper):

```js
const notFoundHtml = path.join(__dirname, 'client/build/404.html');
const notFoundFallback = path.join(__dirname, 'client/public/404.html');

app.get('*', (req, res) => {
  // Skip if this looks like a static asset request that static failed to find
  if (path.extname(req.path)) {
    return res.status(404).send('Not found');
  }

  const decision = resolveSpaRequest(req.path);

  if (decision.type === 'redirect') {
    return res.redirect(decision.status, decision.location);
  }

  if (decision.type === 'spa') {
    return sendLocaleIndex(decision.locale, res);
  }

  const file = fs.existsSync(notFoundHtml) ? notFoundHtml : notFoundFallback;
  res.status(404).type('html').sendFile(file);
});
```

Important: `express.static` for `client/build` must remain **above** this handler so real JS/CSS/images still work. After `npm run build`, CRA copies `public/404.html` → `build/404.html`.

Also send German index for `/` explicitly: `sendLocaleIndex('de')` uses `build/index.html` via fallback when `build/de/index.html` is absent — current helper already falls back. For `locale === 'de'` that is correct.

- [ ] **Step 3: Smoke-test locally (if build exists)**

```bash
# from repo root, with server running against a build:
curl -sI http://127.0.0.1:PORT/am/spam-test | findstr /I "HTTP"
curl -sI http://127.0.0.1:PORT/ru | findstr /I "HTTP Location"
curl -sI http://127.0.0.1:PORT/ru/ | findstr /I "HTTP Location"
curl -sI http://127.0.0.1:PORT/de | findstr /I "HTTP Location"
```

Expected:
- spam → `404`
- `/ru` → `200`
- `/ru/` → `301` Location `/ru`
- `/de` → `301` Location `/`

- [ ] **Step 4: Commit**

```bash
git add client/public/404.html server.js
git commit -m "$(cat <<'EOF'
fix: return 404 for unknown SPA paths instead of soft-404 homepage

EOF
)"
```

---

### Task 3: React NotFound instead of redirect-to-home

**Files:**
- Create: `client/src/components/NotFound.js`
- Modify: `client/src/App.js`
- Modify: `client/src/App.test.js` (add one assertion that unknown policy stays notfound — import from a tiny shared JSON or re-test localeRoutes only; do **not** import CommonJS `lib/` into CRA. Instead add a client-side test that NotFound sets noindex via a shallow contract comment + keep server tests authoritative.)

**Interfaces:**
- Consumes: `SEO` component (`noindex` prop already exists)
- Produces: route `*` → `<NotFound />`

- [ ] **Step 1: Create `NotFound.js`**

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from './SEO';
import { getLangFromPath } from '../utils/localeRoutes';
import { useLocation } from 'react-router-dom';

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);

  return (
    <div className="main-site" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <SEO
        lang={lang}
        title="404"
        description="Seite nicht gefunden"
        noindex
        canonical={`https://stuttgartnails.de${location.pathname}`}
      />
      <h1>404</h1>
      <p>Seite nicht gefunden.</p>
      <p>
        <Link to="/">Home (DE)</Link>
        {' · '}
        <Link to="/ru">Home (RU)</Link>
      </p>
    </div>
  );
};

export default NotFound;
```

Remove unused `t` if unused — either use `t` for copy or drop import. Prefer static DE/RU links as above without unused imports:

```jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from './SEO';
import { getLangFromPath } from '../utils/localeRoutes';

const NotFound = () => {
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);

  return (
    <div className="main-site" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <SEO
        lang={lang}
        title="404 — SmartNails Stuttgart"
        description="Seite nicht gefunden / Страница не найдена"
        noindex
      />
      <h1>404</h1>
      <p>Seite nicht gefunden.</p>
      <p>
        <Link to="/">Home (DE)</Link>
        {' · '}
        <Link to="/ru">Home (RU)</Link>
      </p>
    </div>
  );
};

export default NotFound;
```

Do **not** pass a spam path as canonical; omit `canonical` so SEO defaults to site URL, or omit link by relying on `noindex` only. Prefer: no canonical prop (default site) + `noindex`.

- [ ] **Step 2: Wire `App.js`**

Replace:

```jsx
<Route path="*" element={<Navigate to="/" replace />} />
```

With:

```jsx
import NotFound from './components/NotFound';
// ...
<Route path="*" element={<NotFound />} />
```

Keep `Navigate` import only if still used for `/de`; it is still used:

```jsx
<Route path="/de" element={<Navigate to="/" replace />} />
```

- [ ] **Step 3: Run client tests**

Run: `cd client && npm test -- --watchAll=false`  
Expected: existing SEO tests PASS

- [ ] **Step 4: Commit**

```bash
git add client/src/components/NotFound.js client/src/App.js
git commit -m "$(cat <<'EOF'
fix: show noindex 404 page for unknown client routes

EOF
)"
```

---

### Task 4: Nginx canonical host (docs + deploy snippet)

**Files:**
- Modify: `DEPLOY_VPS.md` (replace/extend nginx server blocks around the existing sample ~145–179)

**Interfaces:**
- Consumes: none (ops config)
- Produces: documented nginx config operators paste on VPS

- [ ] **Step 1: Update `DEPLOY_VPS.md` nginx section**

Replace the sample with three logical server blocks (HTTP catch-all → HTTPS apex; HTTPS www → apex; HTTPS apex → proxy):

```nginx
# 1) HTTP → HTTPS apex (both hostnames)
server {
    listen 80;
    listen [::]:80;
    server_name stuttgartnails.de www.stuttgartnails.de;
    return 301 https://stuttgartnails.de$request_uri;
}

# 2) HTTPS www → apex
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.stuttgartnails.de;

    # ssl_certificate paths as managed by certbot
    ssl_certificate /etc/letsencrypt/live/stuttgartnails.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stuttgartnails.de/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://stuttgartnails.de$request_uri;
}

# 3) HTTPS apex → Node
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name stuttgartnails.de;

    ssl_certificate /etc/letsencrypt/live/stuttgartnails.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stuttgartnails.de/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Do NOT enable a blanket trailing-slash redirect for HTML routes.
    # /ru must stay 200; Express 301s /ru/ → /ru.

    location / {
        proxy_pass http://127.0.0.1:3847;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3847;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, immutable, max-age=2592000";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;
    gzip_comp_level 6;
}
```

Add a short **Deploy checklist** subsection:

1. `sudo nginx -t && sudo systemctl reload nginx`
2. Verify:
   - `curl -sI https://www.stuttgartnails.de/` → 301 to `https://stuttgartnails.de/`
   - `curl -sI https://stuttgartnails.de/ru` → 200
   - `curl -sI https://stuttgartnails.de/am/spam` → 404
3. Restart Node app after code deploy (`pm2 restart` or equivalent).

- [ ] **Step 2: Commit**

```bash
git add DEPLOY_VPS.md
git commit -m "$(cat <<'EOF'
docs: nginx canonical host config for apex HTTPS without soft trailing slash

EOF
)"
```

---

### Task 5: Verification + GSC ops notes + ailog

**Files:**
- Modify: `ailog.md`
- Optionally append a short «Post-deploy GSC» note at end of `DEPLOY_VPS.md` (same commit as Task 4 if already covered — if not, add here)

- [ ] **Step 1: Run automated tests**

```bash
npm run test:spa-routes
cd client && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 2: After VPS deploy, run live checks**

```bash
curl -sI "https://stuttgartnails.de/am/bokop-asia-free-download-video-mp4-porn-video-perawat-ngentot-krgzmfirz3gzb"
curl -sI "https://stuttgartnails.de/ru"
curl -sI "https://stuttgartnails.de/ru/"
curl -sI "https://www.stuttgartnails.de/"
curl -sI "http://stuttgartnails.de/"
curl -sI "https://stuttgartnails.de/ru/datenschutz"
```

Expected:
- spam → `404`
- `/ru` → `200`
- `/ru/` → `301` → `/ru`
- www → `301` → apex
- http → `301` → https apex
- `/ru/datenschutz` → `200`

- [ ] **Step 3: GSC manual (operator)**

1. Search Console → Removals → Temporary removal for the spam URL.
2. URL Inspection for `https://stuttgartnails.de/` and `https://stuttgartnails.de/ru` → Request indexing.
3. Wait for Coverage to drop redirect/spam entries after re-crawl.

- [ ] **Step 4: Update `ailog.md`**

Append session result: tasks done, live curl evidence, pending GSC wait.

- [ ] **Step 5: Final commit if ailog/docs changed**

```bash
git add ailog.md
git commit -m "$(cat <<'EOF'
chore: log SEO soft-404 fix verification

EOF
)"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Allowlist HTML routes | Task 1–2 |
| 404 for unknown/spam | Task 2–3 |
| `/ru` 200 without redirect to `/ru/` | Task 2 + Task 4 |
| www → apex | Task 4 |
| http → https apex | Task 4 |
| React no client redirect soft-404 | Task 3 |
| GSC removals / reindex | Task 5 |
| No new dependencies | Global Constraints |

## Self-review notes

- No TBD placeholders.
- `resolveSpaRequest` signatures consistent across Task 1–2.
- Client must not import `lib/spaRoutes.js` (CommonJS); server tests own the policy.
- Port `3847` matches existing `DEPLOY_VPS.md`.
