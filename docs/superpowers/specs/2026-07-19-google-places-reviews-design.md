# Google Places reviews block — Design

**Date:** 2026-07-19  
**Site:** https://stuttgartnails.de  
**Status:** Approved

## Problem

The site has no on-page Google reviews. SEO helpers already include `createReviewSchema` in `schema.js`, but there is no visible reviews section and no live data source. The Business Information API does not return reviews.

## Goals

- Show a reviews section on the homepage: aggregate rating + up to 5 review cards.
- Source data from **Google Places API (Place Details)**.
- Cache on the server in `data/reviews.json` with a **7-day TTL**.
- Keep API credentials server-side only.
- Place the section **after Gallery, before About** (still before Contact).

## Non-goals

- Google Business Profile / My Business reviews API (OAuth `business.manage`).
- Using the OAuth `client_secret` JSON for this feature.
- Admin UI to edit reviews.
- Adding AggregateRating / review JSON-LD in this iteration (can follow later).
- Nav link for Reviews (optional `#reviews` anchor only).

## Architecture

```
Google Places API (Place Details)
        ↓ (refresh when cache missing or older than 7 days)
server: reviewsController → data/reviews.json
        ↓
GET /api/reviews  (public, read-only)
        ↓
React: <Reviews /> after <Gallery />
```

### Environment

| Variable | Required | Notes |
|----------|----------|--------|
| `GOOGLE_PLACES_API_KEY` | yes | Places API (New) key; never ship to client |
| `GOOGLE_PLACE_ID` | yes | Place ID of the business location |

Do not commit keys. Do not reuse the OAuth web client secret for Places.

### Cache file: `data/reviews.json`

```json
{
  "rating": 5,
  "userRatingCount": 42,
  "googleMapsUri": "https://...",
  "fetchedAt": "2026-07-19T10:00:00.000Z",
  "reviews": [
    {
      "author": "Anna",
      "rating": 5,
      "text": "...",
      "publishTime": "2026-06-01T12:00:00Z",
      "relativeTime": "vor 1 Monat"
    }
  ]
}
```

### Refresh rules

1. On `GET /api/reviews`, if file missing or `fetchedAt` older than 7 days → fetch Place Details, write file, return fresh payload.
2. If Google request fails and a previous file exists → return stale cache (still 200).
3. If Google fails and no file exists → `200` with `{ "rating": null, "userRatingCount": 0, "reviews": [], "fetchedAt": null }`; frontend hides the section.

### Places request (server-only)

- Endpoint: Place Details (New) for `GOOGLE_PLACE_ID`.
- Field mask limited to rating, user rating count, reviews, maps URI (minimize cost).
- Language: prefer `de` for relative times shown on the German site; Russian locale can still show the same cached German/original review text (Places returns reviewer language as written).

## Frontend

### Component

- New `client/src/components/Reviews.js` (+ CSS).
- Visual language matches About/Gallery: section eyebrow, title, underline, framer-motion enter.
- Header: star rating, review count, CTA link to Google Maps / all reviews.
- Body: up to 5 cards — author, stars, text, relative/publish time.
- If API returns no reviews / error → render nothing (no empty skeleton on production).
- i18n keys under `reviews.*` in DE and RU locale files.
- Insert in `App.js` `MainSite`: `Gallery → Reviews → About → FAQ → Contact`.
- Section `id="reviews"`.

### Data loading

- `fetch('/api/reviews')` (same origin in prod; dev via existing proxy if configured).
- No API key in the browser.

## Backend

| Piece | Role |
|-------|------|
| `controllers/reviewsController.js` | read/refresh cache, call Places |
| `routes/reviews.js` | `GET /` → public handler |
| `server.js` | mount `/api/reviews` |
| `data/reviews.json` | persisted cache |

**gitignore** `data/reviews.json` so deploy starts empty and fills on first successful Places fetch. Document `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` in `DEPLOY_VPS.md`.

## Error handling

| Case | Behavior |
|------|----------|
| Missing env vars | Log warning; return empty payload (200); no crash |
| Places quota/error | Serve stale file if present |
| Malformed cache | Treat as miss; try refresh |
| Client fetch fail | Hide section |

## Testing

- Unit/controller: TTL miss triggers refresh; TTL hit serves file; Google failure serves stale.
- Manual: set env locally → `GET /api/reviews` → UI shows cards between Gallery and About.
- Confirm Network tab has no API key leakage.

## Security

- API key only in server `.env`.
- Public endpoint is read-only; no write routes.
- Do not log full API key.
- Rotate any OAuth client secret that was shared outside Google Console if exposed.

## Out of scope follow-ups

- Wire `createReviewSchema` once reviews are stable in production.
- Switch to GBP reviews API if more than ~5 reviews must be listed.
