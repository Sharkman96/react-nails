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
