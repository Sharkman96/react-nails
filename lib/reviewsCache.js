const fs = require('fs').promises;

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function emptyReviewsPayload(reason = 'unavailable') {
  return {
    rating: null,
    userRatingCount: 0,
    googleMapsUri: null,
    fetchedAt: null,
    reviews: [],
    reason,
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
