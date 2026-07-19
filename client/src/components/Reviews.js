import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { GOOGLE_MAPS_URL } from '../utils/schema';
import { prerenderInitial } from '../utils/prerender';
import './Reviews.css';

const VISIBLE_COUNT = 3;

const Stars = ({ value, size = 18 }) => {
  const full = Math.round(Number(value) || 0);
  return (
    <span className="reviews-stars" aria-label={`${full} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= full ? 'reviews-star is-filled' : 'reviews-star'}
          fill={n <= full ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  );
};

const ReviewCard = ({ review, index }) => (
  <motion.article
    initial={prerenderInitial({ opacity: 0, y: 24 })}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay: index * 0.06 }}
    className="reviews-card"
  >
    <div className="reviews-card-top">
      <strong className="reviews-author">{review.author}</strong>
      <Stars value={review.rating} size={14} />
    </div>
    {review.text ? <p className="reviews-text">{review.text}</p> : null}
    {review.relativeTime ? (
      <time className="reviews-time" dateTime={review.publishTime || undefined}>
        {review.relativeTime}
      </time>
    ) : null}
  </motion.article>
);

const Reviews = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/reviews')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const reviews = useMemo(
    () => (Array.isArray(data?.reviews) ? data.reviews : []),
    [data]
  );

  const pageCount = Math.max(1, Math.ceil(reviews.length / VISIBLE_COUNT));
  const showCarouselNav = reviews.length > VISIBLE_COUNT;

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1));
  }, [pageCount]);

  if (!data) return null;

  const hasReviews = reviews.length > 0;
  const hasRating = typeof data.rating === 'number' && data.rating > 0;
  if (!hasReviews && !hasRating) return null;

  const mapsUri = data.googleMapsUri || GOOGLE_MAPS_URL;
  const count = data.userRatingCount || reviews.length;
  const slideReviews = reviews.slice(
    page * VISIBLE_COUNT,
    page * VISIBLE_COUNT + VISIBLE_COUNT
  );

  return (
    <section id="reviews" className="reviews">
      <div className="reviews-container">
        <div className="reviews-layout">
          <motion.div
            initial={prerenderInitial({ opacity: 0, y: 30 })}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="reviews-header"
          >
            <span className="reviews-eyebrow">{t('reviews.eyebrow')}</span>
            <h2 className="reviews-title">{t('reviews.title')}</h2>
            <div className="reviews-underline" />
            <p className="reviews-subtitle">{t('reviews.subtitle')}</p>

            {hasRating && (
              <div className="reviews-summary">
                <span className="reviews-score">{data.rating.toFixed(1)}</span>
                <div className="reviews-summary-meta">
                  <Stars value={data.rating} size={20} />
                  <span className="reviews-count">
                    {t('reviews.basedOn', { count })}
                  </span>
                </div>
              </div>
            )}

            <a
              href={mapsUri}
              target="_blank"
              rel="noopener noreferrer"
              className="reviews-cta"
            >
              {t('reviews.cta')}
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          </motion.div>

          {hasReviews && (
            <div className="reviews-carousel">
              <div className="reviews-carousel-viewport">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={page}
                    className="reviews-slide"
                    initial={prerenderInitial({ opacity: 0, x: 24 })}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {slideReviews.map((review, index) => (
                      <ReviewCard
                        key={`${review.author}-${review.publishTime || page}-${index}`}
                        review={review}
                        index={index}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {showCarouselNav && (
                <div className="reviews-carousel-nav">
                  <button
                    type="button"
                    className="reviews-nav-btn"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    aria-label={t('reviews.prev')}
                  >
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>
                  <span className="reviews-nav-indicator" aria-live="polite">
                    {page + 1} / {pageCount}
                  </span>
                  <button
                    type="button"
                    className="reviews-nav-btn"
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                    disabled={page >= pageCount - 1}
                    aria-label={t('reviews.next')}
                  >
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
