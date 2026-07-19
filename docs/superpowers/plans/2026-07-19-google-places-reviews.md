# Google Places Reviews Block Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a cached Google Places reviews section (rating + up to 5 cards) on the homepage after Gallery.

**Architecture:** Server fetches Place Details (New), maps to a stable JSON shape, persists `data/reviews.json` with 7-day TTL, exposes `GET /api/reviews`. React `Reviews` component loads that endpoint and hides itself when empty.

**Tech Stack:** Node 18+, Express, `node-fetch` (already in package.json), React 18, framer-motion, i18next, `node:test`. No new npm dependencies.

## Global Constraints

- Places API only (not Business Information / GBP OAuth).
- Env: `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID=ChIJE_wiOw3bmUcRrggBAHoNZLQ`.
- Cache file: `data/reviews.json`, gitignored, TTL 7 days.
- On Google failure with stale file → serve stale; with no file → empty payload 200.
- API key never sent to the client.
- No AggregateRating schema in this iteration.
- Section order: Gallery → Reviews → About → FAQ → Contact.
- Match existing About/Gallery visual language; no new libraries.
- Do not commit secrets or `config.env`.

## File map

| File | Responsibility |
|------|----------------|
| `lib/reviewsCache.js` | TTL check, empty payload, map Places → cache shape, read/write file helpers |
| `lib/reviewsCache.test.js` | Unit tests for TTL + mapper |
| `controllers/reviewsController.js` | `GET` handler: cache hit/miss + Places fetch |
| `routes/reviews.js` | Mount public GET |
| `server.js` | `app.use('/api/reviews', ...)` |
| `data/reviews.json` | Runtime cache (gitignored) |
| `.gitignore` | Ignore `data/reviews.json` |
| `client/src/components/Reviews.js` | UI section |
| `client/src/components/Reviews.css` | Styles |
| `client/src/App.js` | Insert `<Reviews />` |
| `client/src/locales/de/translation.json` | `reviews.*` |
| `client/src/locales/ru/translation.json` | `reviews.*` |
| `DEPLOY_VPS.md` | Env vars documentation |
| `ailog.md` | Session log |
| `package.json` | `test:reviews-cache` script |

---

### Task 1: Cache helpers + tests

**Files:**
- Create: `lib/reviewsCache.js`
- Create: `lib/reviewsCache.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: none
- Produces:
  - `TTL_MS = 7 * 24 * 60 * 60 * 1000`
  - `emptyReviewsPayload(): { rating: null, userRatingCount: 0, googleMapsUri: null, fetchedAt: null, reviews: [] }`
  - `isCacheFresh(payload, nowMs = Date.now()): boolean`
  - `mapPlacesToCache(place, fetchedAtIso): object` — maps Places Place Details JSON to cache shape
  - `readReviewsFile(filePath): Promise<object|null>`
  - `writeReviewsFile(filePath, payload): Promise<boolean>`

- [x] **Step 1: Write failing tests**

```js
const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const {
  emptyReviewsPayload,
  isCacheFresh,
  mapPlacesToCache,
  TTL_MS,
} = require('./reviewsCache');

describe('emptyReviewsPayload', () => {
  test('returns empty shape', () => {
    assert.deepEqual(emptyReviewsPayload(), {
      rating: null,
      userRatingCount: 0,
      googleMapsUri: null,
      fetchedAt: null,
      reviews: [],
    });
  });
});

describe('isCacheFresh', () => {
  test('false for null', () => {
    assert.equal(isCacheFresh(null), false);
  });

  test('false when fetchedAt missing', () => {
    assert.equal(isCacheFresh({ reviews: [] }), false);
  });

  test('true inside TTL', () => {
    const now = Date.parse('2026-07-19T12:00:00.000Z');
    const payload = { fetchedAt: '2026-07-18T12:00:00.000Z' };
    assert.equal(isCacheFresh(payload, now), true);
  });

  test('false outside TTL', () => {
    const now = Date.parse('2026-07-19T12:00:00.000Z');
    const payload = { fetchedAt: '2026-07-01T12:00:00.000Z' };
    assert.equal(isCacheFresh(payload, now), false);
  });

  test('TTL_MS is 7 days', () => {
    assert.equal(TTL_MS, 7 * 24 * 60 * 60 * 1000);
  });
});

describe('mapPlacesToCache', () => {
  test('maps rating and reviews', () => {
    const place = {
      rating: 4.9,
      userRatingCount: 42,
      googleMapsUri: 'https://maps.google.com/?cid=1',
      reviews: [
        {
          rating: 5,
          publishTime: '2026-06-01T12:00:00Z',
          relativePublishTimeDescription: 'vor 1 Monat',
          text: { text: 'Super!' },
          authorAttribution: { displayName: 'Anna' },
        },
      ],
    };
    const mapped = mapPlacesToCache(place, '2026-07-19T10:00:00.000Z');
    assert.equal(mapped.rating, 4.9);
    assert.equal(mapped.userRatingCount, 42);
    assert.equal(mapped.reviews.length, 1);
    assert.equal(mapped.reviews[0].author, 'Anna');
    assert.equal(mapped.reviews[0].text, 'Super!');
    assert.equal(mapped.fetchedAt, '2026-07-19T10:00:00.000Z');
  });

  test('handles missing reviews', () => {
    const mapped = mapPlacesToCache({ rating: 5, userRatingCount: 1 }, '2026-07-19T10:00:00.000Z');
    assert.deepEqual(mapped.reviews, []);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `node --test lib/reviewsCache.test.js`  
Expected: FAIL (module missing)

- [ ] **Step 3: Implement `lib/reviewsCache.js`**

```js
const fs = require('fs').promises;

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function emptyReviewsPayload() {
  return {
    rating: null,
    userRatingCount: 0,
    googleMapsUri: null,
    fetchedAt: null,
    reviews: [],
  };
}

function isCacheFresh(payload, nowMs = Date.now()) {
  if (!payload || !payload.fetchedAt) return false;
  const fetched = Date.parse(payload.fetchedAt);
  if (Number.isNaN(fetched)) return false;
  return nowMs - fetched < TTL_MS;
}

function mapPlacesToCache(place, fetchedAtIso) {
  const reviews = Array.isArray(place?.reviews)
    ? place.reviews.slice(0, 5).map((r) => ({
        author: r.authorAttribution?.displayName || 'Google User',
        rating: typeof r.rating === 'number' ? r.rating : 0,
        text: r.text?.text || r.originalText?.text || '',
        publishTime: r.publishTime || null,
        relativeTime: r.relativePublishTimeDescription || '',
      }))
    : [];

  return {
    rating: typeof place?.rating === 'number' ? place.rating : null,
    userRatingCount: typeof place?.userRatingCount === 'number' ? place.userRatingCount : 0,
    googleMapsUri: place?.googleMapsUri || null,
    fetchedAt: fetchedAtIso,
    reviews,
  };
}

async function readReviewsFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeReviewsFile(filePath, payload) {
  try {
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing reviews cache:', err.message);
    return false;
  }
}

module.exports = {
  TTL_MS,
  emptyReviewsPayload,
  isCacheFresh,
  mapPlacesToCache,
  readReviewsFile,
  writeReviewsFile,
};
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `node --test lib/reviewsCache.test.js`  
Expected: all PASS

- [ ] **Step 5: Add npm script**

In `package.json` scripts add: `"test:reviews-cache": "node --test lib/reviewsCache.test.js"`

---

### Task 2: Controller, route, server mount

**Files:**
- Create: `controllers/reviewsController.js`
- Create: `routes/reviews.js`
- Modify: `server.js` (import + `app.use('/api/reviews', cacheMiddleware(...), reviewsRoutes)`)
- Modify: `.gitignore` (add `data/reviews.json`)

**Interfaces:**
- Consumes: helpers from `lib/reviewsCache.js`; `process.env.GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID`; `node-fetch`
- Produces: `getReviews(req, res)` → JSON cache shape

- [ ] **Step 1: Create controller**

```js
const path = require('path');
const fetch = require('node-fetch');
const {
  emptyReviewsPayload,
  isCacheFresh,
  mapPlacesToCache,
  readReviewsFile,
  writeReviewsFile,
} = require('../lib/reviewsCache');

const DATA_FILE = path.join(__dirname, '..', 'data', 'reviews.json');
const FIELD_MASK = 'rating,userRatingCount,googleMapsUri,reviews';

async function fetchPlacesDetails(apiKey, placeId) {
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=de`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Places API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function refreshFromPlaces() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) {
    console.warn('Reviews: missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID');
    return null;
  }
  const place = await fetchPlacesDetails(apiKey, placeId);
  const payload = mapPlacesToCache(place, new Date().toISOString());
  await writeReviewsFile(DATA_FILE, payload);
  return payload;
}

const getReviews = async (req, res) => {
  try {
    const cached = await readReviewsFile(DATA_FILE);
    if (isCacheFresh(cached)) {
      return res.json(cached);
    }

    try {
      const fresh = await refreshFromPlaces();
      if (fresh) return res.json(fresh);
    } catch (err) {
      console.error('Reviews refresh failed:', err.message);
      if (cached && Array.isArray(cached.reviews)) {
        return res.json(cached);
      }
    }

    return res.json(emptyReviewsPayload());
  } catch (error) {
    console.error('Get reviews error:', error);
    return res.json(emptyReviewsPayload());
  }
};

module.exports = { getReviews };
```

- [ ] **Step 2: Create `routes/reviews.js`**

```js
const express = require('express');
const router = express.Router();
const { getReviews } = require('../controllers/reviewsController');

router.get('/', getReviews);

module.exports = router;
```

- [ ] **Step 3: Wire in `server.js`**

After gallery routes import/use:

```js
const reviewsRoutes = require('./routes/reviews');
// ...
app.use('/api/reviews',
  cacheMiddleware(10 * 60 * 1000),
  reviewsRoutes
);
```

- [ ] **Step 4: Gitignore cache file**

Add to `.gitignore`:

```
data/reviews.json
```

- [ ] **Step 5: Manual smoke (needs env)**

Ensure `config.env` contains:

```
GOOGLE_PLACES_API_KEY=...
GOOGLE_PLACE_ID=ChIJE_wiOw3bmUcRrggBAHoNZLQ
```

Run server, then: `curl http://localhost:5000/api/reviews`  
Expected: JSON with `rating`, `reviews` array (or empty if key invalid).

---

### Task 3: Frontend Reviews section

**Files:**
- Create: `client/src/components/Reviews.js`
- Create: `client/src/components/Reviews.css`
- Modify: `client/src/App.js`
- Modify: `client/src/locales/de/translation.json`
- Modify: `client/src/locales/ru/translation.json`

**Interfaces:**
- Consumes: `GET /api/reviews` payload from Task 2
- Produces: visible section when `reviews.length > 0` or `userRatingCount > 0`

- [ ] **Step 1: Add i18n keys**

DE:

```json
"reviews": {
  "eyebrow": "Bewertungen",
  "title": "Was Kundinnen sagen",
  "subtitle": "Echte Google-Bewertungen für SmartNails Stuttgart",
  "cta": "Alle Bewertungen bei Google",
  "basedOn": "basierend auf {{count}} Bewertungen"
}
```

RU:

```json
"reviews": {
  "eyebrow": "Отзывы",
  "title": "Что говорят клиенты",
  "subtitle": "Реальные отзывы Google о SmartNails Stuttgart",
  "cta": "Все отзывы в Google",
  "basedOn": "на основе {{count}} отзывов"
}
```

- [ ] **Step 2: Implement `Reviews.js`**

- Fetch `/api/reviews` on mount
- If no rating and no reviews → return null
- Header: title + stars + count + external CTA (`googleMapsUri` or existing `GOOGLE_MAPS_URL`)
- Grid of up to 5 cards
- Use framer-motion + `prerenderInitial` like About
- `id="reviews"`

- [ ] **Step 3: Styles in `Reviews.css`**

Match About tokens (`--bg-secondary`, `--accent-gold`, `--font-display`). Simple grid of review cards; no purple glow / generic AI look.

- [ ] **Step 4: Insert in `App.js`**

```jsx
import Reviews from './components/Reviews';
// ...
<Gallery />
<Reviews />
<About />
```

- [ ] **Step 5: Manual UI check**

With server running + env set: open homepage, section appears between Gallery and About.

---

### Task 4: Deploy docs + ailog

**Files:**
- Modify: `DEPLOY_VPS.md` (env section)
- Modify: `ailog.md`

- [ ] **Step 1: Document env in DEPLOY_VPS.md** near config.env checklist:

```
GOOGLE_PLACES_API_KEY=...
GOOGLE_PLACE_ID=ChIJE_wiOw3bmUcRrggBAHoNZLQ
```

Note: enable Places API (New) on the Google Cloud project; restrict key to Places API.

- [ ] **Step 2: Log completion in ailog.md**

---

## Self-review

1. Spec coverage: Places + file cache TTL 7d + GET API + UI after Gallery + hide empty + no OAuth + no schema — all tasked.
2. Placeholders: none.
3. Types: payload fields consistent across lib/controller/frontend.
