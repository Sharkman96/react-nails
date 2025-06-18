import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Star, Sparkles, Scissors, Palette, Zap } from 'lucide-react';
import { useCache } from '../hooks/useCache';
import SEO from './SEO';
import { createServiceSchema } from '../utils/schema';
import './Services.css';
import { pickLang } from '../utils/lang';

// Функция для получения компонента иконки по названию
const getServiceIcon = (iconName, size = 32) => {
  const iconProps = { size, color: 'currentColor' };
  
  switch (iconName) {
    case 'scissors':
      return <Scissors {...iconProps} />;
    case 'sparkles':
      return <Sparkles {...iconProps} />;
    case 'palette':
      return <Palette {...iconProps} />;
    case 'zap':
      return <Zap {...iconProps} />;
    default:
      return <Sparkles {...iconProps} />; // Иконка по умолчанию
  }
};

const Services = () => {
  const { t, i18n } = useTranslation();

  // Используем кэширование для данных услуг
  const { data: services, loading, error, refetch } = useCache(
    'services',
    async () => {
      const response = await fetch('/api/services');
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      return data.filter(service => service.isActive).sort((a, b) => a.order - b.order);
    },
    {
      ttl: 10 * 60 * 1000, // 10 минут
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    }
  );

  // Создаем Schema.org разметку для услуг
  const servicesSchema = services ? services.map(service => 
    createServiceSchema({
      name: pickLang(service.name, i18n.language),
      description: pickLang(service.description, i18n.language),
      category: service.category,
      price: pickLang(service.price, i18n.language)
    })
  ) : [];

  const filteredServices = services || [];

  if (loading) {
    return (
      <section id="services" className="services">
        <div className="services-container">
          <div className="services-header">
            <h2 className="services-title">{t('services.title')}</h2>
            <p className="services-description">{t('services.description')}</p>
          </div>
          <div className="loading-services">
            <div className="loading-spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="services" className="services">
        <div className="services-container">
          <div className="services-header">
            <h2 className="services-title">{t('services.title')}</h2>
            <p className="services-description">{t('services.description')}</p>
          </div>
          <div className="error-services">
            <p>Ошибка загрузки услуг</p>
            <button onClick={refetch} className="retry-btn">
              Попробовать снова
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="services">
      <SEO 
        title={t('services.title')}
        description={t('services.description')}
        keywords={t('services.keywords')}
        url="/services"
        schema={servicesSchema}
      />
      
      <div className="services-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="services-header"
        >
          <h2 className="services-title">{t('services.title')}</h2>
          <p className="services-description">{t('services.description')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="services-grid"
        >
          {filteredServices.map((service, index) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="service-card"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="service-icon" style={{ color: service.color }}>
                {getServiceIcon(service.icon)}
              </div>
              <div className="service-content">
                <h3 className="service-title">
                  {pickLang(service.name, i18n.language)}
                </h3>
                {service.description && (pickLang(service.description, i18n.language)) && (
                  <p className="service-description">
                    {pickLang(service.description, i18n.language)}
                  </p>
                )}
                <div className="service-details">
                  <div className="service-price">
                    <span>{pickLang(service.price, i18n.language)}€</span>
                  </div>
                </div>
                {service.rating && (
                  <div className="service-rating">
                    <Star size={16} fill="#ffd700" />
                    <span>{service.rating}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredServices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="no-services"
          >
            <p>{t('services.noServices')}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Services; 