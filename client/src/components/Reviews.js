import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star, ExternalLink } from 'lucide-react';
import { GOOGLE_MAPS_URL } from '../utils/schema';
import { prerenderInitial } from '../utils/prerender';
import './Reviews.css';

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

const Reviews = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);

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

  if (!data) return null;

  const hasReviews = Array.isArray(data.reviews) && data.reviews.length > 0;
  const hasRating = typeof data.rating === 'number' && data.rating > 0;
  if (!hasReviews && !hasRating) return null;

  const mapsUri = data.googleMapsUri || GOOGLE_MAPS_URL;
  const count = data.userRatingCount || data.reviews.length;

  return (
    <section id="reviews" className="reviews">
      <div className="reviews-container">
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
          <div className="reviews-grid">
            {data.reviews.map((review, index) => (
              <motion.article
                key={`${review.author}-${review.publishTime || index}`}
                initial={prerenderInitial({ opacity: 0, y: 24 })}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="reviews-card"
              >
                <div className="reviews-card-top">
                  <strong className="reviews-author">{review.author}</strong>
                  <Stars value={review.rating} size={14} />
                </div>
                {review.text ? (
                  <p className="reviews-text">{review.text}</p>
                ) : null}
                {review.relativeTime ? (
                  <time className="reviews-time" dateTime={review.publishTime || undefined}>
                    {review.relativeTime}
                  </time>
                ) : null}
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Reviews;
