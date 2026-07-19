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
    const missing = [
      !apiKey ? 'GOOGLE_PLACES_API_KEY' : null,
      !placeId ? 'GOOGLE_PLACE_ID' : null,
    ].filter(Boolean);
    console.warn(`Reviews: missing ${missing.join(', ')}`);
    return { ok: false, reason: 'missing_credentials', missing };
  }
  const place = await fetchPlacesDetails(apiKey, placeId);
  const payload = mapPlacesToCache(place, new Date().toISOString());
  await writeReviewsFile(DATA_FILE, payload);
  return { ok: true, payload };
}

const getReviews = async (req, res) => {
  try {
    const cached = await readReviewsFile(DATA_FILE);
    if (isCacheFresh(cached)) {
      return res.json(cached);
    }

    try {
      const result = await refreshFromPlaces();
      if (result.ok) return res.json(result.payload);
      if (cached && Array.isArray(cached.reviews) && cached.reviews.length) {
        return res.json(cached);
      }
      return res.json(emptyReviewsPayload(result.reason));
    } catch (err) {
      console.error('Reviews refresh failed:', err.message);
      if (cached && Array.isArray(cached.reviews) && cached.reviews.length) {
        return res.json(cached);
      }
      return res.json(emptyReviewsPayload('places_error'));
    }
  } catch (error) {
    console.error('Get reviews error:', error);
    return res.json(emptyReviewsPayload('server_error'));
  }
};

module.exports = { getReviews };
