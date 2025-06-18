import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, X } from 'lucide-react';
import LazyImage from './ui/LazyImage';
import { useCache } from '../hooks/useCache';
import { optimizeGalleryImage, optimizeModalImage, preloadCriticalImages } from '../utils/imageOptimization';
import { useCSRF } from '../utils/csrf';
import { pickLang } from '../utils/lang';
import './Gallery.css';

const Gallery = () => {
  const { t, i18n } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [preloadedImages, setPreloadedImages] = useState(new Set());
  const { addTokenToObject } = useCSRF();

  // Используем кэширование для данных галереи
  const { data: galleryItems, loading, error, refetch } = useCache(
    'gallery-items',
    async () => {
      const response = await fetch('/api/gallery');
      if (!response.ok) {
        throw new Error('Failed to fetch gallery items');
      }
      const data = await response.json();
      // Фильтруем только активные работы и сортируем по порядку
      return data
        .filter(item => item.isActive)
        .sort((a, b) => a.order - b.order);
    },
    {
      ttl: 10 * 60 * 1000, // 10 минут
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    }
  );

  // Предзагружаем первые несколько изображений
  useEffect(() => {
    if (galleryItems && galleryItems.length > 0) {
      const criticalImages = galleryItems
        .slice(0, 3)
        .filter(item => item.imageUrl)
        .map(item => optimizeGalleryImage(item.imageUrl, 0).src);
      
      preloadCriticalImages(criticalImages).then(() => {
        setPreloadedImages(new Set(criticalImages));
      });
    }
  }, [galleryItems]);

  const handleImageClick = (item) => {
    setSelectedImage(item);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const openInstagram = async () => {
    try {
      // Отправляем клик по кнопке Instagram с CSRF токеном
      const dataWithToken = await addTokenToObject({ buttonType: 'instagram' });
      await fetch('/api/analytics/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithToken)
      });
    } catch (error) {
      console.error('Error tracking Instagram click:', error);
    }
    
    window.open('https://instagram.com/smartnails_stuttgart', '_blank');
  };

  if (loading) {
    return (
      <section id="gallery" className="gallery">
        <div className="gallery-container">
          <div className="gallery-header">
            <h2 className="gallery-title">{t('gallery.title')}</h2>
            <p className="gallery-description">{t('gallery.description')}</p>
          </div>
          <div className="loading-gallery">
            <div className="loading-spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="gallery" className="gallery">
        <div className="gallery-container">
          <div className="gallery-header">
            <h2 className="gallery-title">{t('gallery.title')}</h2>
            <p className="gallery-description">{t('gallery.description')}</p>
          </div>
          <div className="error-gallery">
            <p>Ошибка загрузки галереи</p>
            <button onClick={refetch} className="retry-btn">
              Попробовать снова
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="gallery">
      <div className="gallery-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="gallery-header"
        >
          <h2 className="gallery-title">{t('gallery.title')}</h2>
          <p className="gallery-description">{t('gallery.description')}</p>
        </motion.div>

        {(!galleryItems || galleryItems.length === 0) ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="no-gallery"
          >
            <p>{t('gallery.noItems')}</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="gallery-grid"
          >
            {galleryItems.map((item, index) => {
              const optimizedImage = optimizeGalleryImage(item.imageUrl, index);
              const isPreloaded = preloadedImages.has(optimizedImage.src);
              
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="gallery-item"
                  onClick={() => handleImageClick(item)}
                  whileHover={{ scale: 1.05 }}
                >
                  <div 
                    className="gallery-item-placeholder"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.imageUrl ? (
                      <LazyImage 
                        src={optimizedImage.src}
                        srcSet={optimizedImage.srcSet}
                        sizes={optimizedImage.sizes}
                        alt={pickLang(item.title, i18n.language)} 
                        className="gallery-image"
                        loading={isPreloaded ? 'eager' : 'lazy'}
                        threshold={200}
                        effect="blur"
                        placeholderSrc={item.color ? `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" style="background-color:${item.color}"></svg>` : null}
                      />
                    ) : (
                      <div className="nail-preview">
                        <div className="nail-finger"></div>
                        <div className="nail-tip"></div>
                      </div>
                    )}
                  </div>
                  <div className="gallery-item-overlay">
                    <h3>{pickLang(item.title, i18n.language)}</h3>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="gallery-cta"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="instagram-btn"
            onClick={openInstagram}
          >
            <Instagram size={24} />
            {t('gallery.viewMore')}
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
              <div 
                className="modal-image"
                style={{ backgroundColor: selectedImage.color }}
              >
                {selectedImage.imageUrl ? (
                  <LazyImage 
                    src={optimizeModalImage(selectedImage.imageUrl).src}
                    srcSet={optimizeModalImage(selectedImage.imageUrl).srcSet}
                    sizes={optimizeModalImage(selectedImage.imageUrl).sizes}
                    alt={pickLang(selectedImage.title, i18n.language)} 
                    className="modal-image-content"
                    loading="eager"
                    effect="blur"
                    placeholderSrc={selectedImage.color ? `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" style="background-color:${selectedImage.color}"></svg>` : null}
                  />
                ) : (
                  <div className="nail-preview-large">
                    <div className="nail-finger-large"></div>
                    <div className="nail-tip-large"></div>
                  </div>
                )}
              </div>
              <div className="modal-info">
                <h3>{pickLang(selectedImage.title, i18n.language)}</h3>
                <p>{pickLang(selectedImage.description, i18n.language)}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery; 