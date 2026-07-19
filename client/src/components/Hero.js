import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Instagram } from 'lucide-react';
import { useCSRF } from '../utils/csrf';
import { buildPromoWhatsAppUrl } from '../utils/promo';
import { prerenderInitial } from '../utils/prerender';
import './Hero.css';

const fadeUp = (delay = 0) => ({
  initial: prerenderInitial({ opacity: 0, y: 32 }),
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
});

const fadeRight = (delay = 0) => ({
  initial: prerenderInitial({ opacity: 0, x: 40 }),
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
});

const Hero = () => {
  const { t, i18n } = useTranslation();
  const { addTokenToObject } = useCSRF();
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (i18n.isInitialized) setIsLoaded(true);
  }, [i18n.isInitialized]);

  const handleContact = (type) => {
    if (type === 'whatsapp') window.open(buildPromoWhatsAppUrl(i18n.language), '_blank', 'noopener,noreferrer');
    if (type === 'instagram') window.open('https://instagram.com/smartnails_stuttgart', '_blank');
    void (async () => {
      try {
        const data = await addTokenToObject({ buttonType: type });
        await fetch('/api/analytics/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch {}
    })();
  };

  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isLoaded) {
    return (
      <section id="hero" className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="loading-placeholder" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <AnimatePresence>
      <section id="hero" className="hero">
        <div className="hero-background">
          <div className="hero-overlay" />
        </div>

        <div className="hero-content">
          {/* ── Left: Text ── */}
          <div className="hero-text">
            <motion.span className="hero-eyebrow" {...fadeUp(0.05)}>
              Stuttgart · Nageldesign
            </motion.span>

            <motion.h1 className="hero-title" {...fadeUp(0.15)}>
              {t('hero.title')}
            </motion.h1>

            <motion.h2 className="hero-subtitle" {...fadeUp(0.25)}>
              {t('hero.subtitle')}
            </motion.h2>

            <motion.p className="hero-description" {...fadeUp(0.35)}>
              {t('hero.description')}
            </motion.p>

            <motion.div className="hero-buttons" {...fadeUp(0.45)}>
              <motion.button
                className="hero-btn primary"
                onClick={() => handleContact('whatsapp')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <MessageCircle size={18} />
                {t('contact.whatsapp')}
              </motion.button>

              <motion.button
                className="hero-btn secondary"
                onClick={() => handleContact('instagram')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Instagram size={18} />
                {t('contact.instagram')}
              </motion.button>
            </motion.div>
          </div>

          {/* ── Right: Visual ── */}
          <motion.div className="hero-image" {...fadeRight(0.2)}>
            {/* Floating badges */}
            <div className="hero-badge badge-1">
              <span className="badge-icon">✨</span>
              <div>
                <span className="badge-text">
                  {i18n.language === 'ru' ? 'Премиум качество' : 'Premium Qualität'}
                </span>
                <span className="badge-sub">Stuttgart</span>
              </div>
            </div>

            <div className="hero-badge badge-2">
              <span className="badge-icon">💅</span>
              <div>
                <span className="badge-text">
                  {i18n.language === 'ru' ? '5+ лет опыта' : '5+ Jahre Erfahrung'}
                </span>
                <span className="badge-sub">Nail Art</span>
              </div>
            </div>

            {!imageError ? (
              <img
                src="/assets/hero-image.jpg"
                alt={t('hero.imageAlt', 'Professional nail art')}
                className="hero-main-image"
                width={720}
                height={900}
                decoding="async"
                fetchPriority="high"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="hero-image-placeholder">
                <div className="nail-art-preview">
                  <div className="nail-sample nail-1" />
                  <div className="nail-sample nail-2" />
                  <div className="nail-sample nail-3" />
                  <div className="nail-sample nail-4" />
                  <div className="nail-sample nail-5" />
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Scroll indicator ── */}
        <motion.div
          className="hero-scroll-indicator"
          initial={prerenderInitial({ opacity: 0 })}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          onClick={scrollToServices}
        >
          <div className="scroll-line" />
          <span className="scroll-label">scroll</span>
        </motion.div>
      </section>
    </AnimatePresence>
  );
};

export default Hero;
