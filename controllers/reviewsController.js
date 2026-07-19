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
