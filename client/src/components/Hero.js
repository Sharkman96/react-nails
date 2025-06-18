import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Instagram } from 'lucide-react';
import { useCSRF } from '../utils/csrf';
import './Hero.css';

const Hero = () => {
  const { t, i18n } = useTranslation();
  const { addTokenToObject } = useCSRF();
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Проверяем, загружены ли переводы
    if (i18n.isInitialized) {
      setIsLoaded(true);
    }
  }, [i18n.isInitialized]);

  const trackClick = async (buttonType) => {
    try {
      const dataWithToken = await addTokenToObject({ buttonType });
      await fetch('/api/analytics/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithToken)
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleContact = async (type) => {
    await trackClick(type);
    
    switch (type) {
      case 'whatsapp':
        window.open('https://wa.me/491701264472', '_blank');
        break;
      case 'instagram':
        window.open('https://instagram.com/smartnails_stuttgart', '_blank');
        break;
      case 'phone':
        window.open('tel:+491701264472', '_blank');
        break;
      default:
        break;
    }
  };

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
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
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <h1 className="hero-title">{t('hero.title')}</h1>
            <h2 className="hero-subtitle">{t('hero.subtitle')}</h2>
            <p className="hero-description">{t('hero.description')}</p>
            
            <div className="hero-buttons">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hero-btn primary"
                onClick={() => handleContact('whatsapp')}
              >
                <MessageCircle size={20} />
                {t('contact.whatsapp')}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hero-btn secondary"
                onClick={() => handleContact('instagram')}
              >
                <Instagram size={20} />
                {t('contact.instagram')}
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hero-image"
          >
            {!imageError ? (
              <img 
                src="/assets/hero-image.jpg" 
                alt={t('hero.imageAlt', 'Professional nail art hands')}
                className="hero-main-image"
                loading="lazy"
                onError={() => {
                  console.log('Image failed to load, showing fallback');
                  setImageError(true);
                }}
              />
            ) : (
              <div className="hero-image-placeholder">
                <div className="nail-art-preview">
                  <div className="nail-sample nail-1"></div>
                  <div className="nail-sample nail-2"></div>
                  <div className="nail-sample nail-3"></div>
                  <div className="nail-sample nail-4"></div>
                  <div className="nail-sample nail-5"></div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="hero-scroll-indicator">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="scroll-arrow"
            onClick={scrollToServices}
            style={{ cursor: 'pointer' }}
          >
            ↓
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
};

export default Hero; 