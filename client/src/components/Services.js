import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Gift, MessageCircle, Star, Sparkles, Scissors, Palette, Zap } from 'lucide-react';
import { useCache } from '../hooks/useCache';
import SEO from './SEO';
import { createServiceSchema } from '../utils/schema';
import './Services.css';
import { pickLang } from '../utils/lang';
import { PROMO_CODE, buildPromoWhatsAppUrl } from '../utils/promo';
import { prerenderInitial } from '../utils/prerender';

/** Строка цены для отображения (EUR). */
const formatPriceDisplay = (price) => {
  if (price == null || price === '') return '';
  const s = String(price).trim();
  if (/€/u.test(s)) return s;
  return `${s} €`;
};

/** Число для Schema.org Offer (диапазон «1–5» → верхняя граница). */
const schemaOfferPrice = (price) => {
  const s = String(price);
  const nums = s.match(/\d+/g);
  if (!nums || nums.length === 0) return '0';
  return nums.length > 1 ? nums[nums.length - 1] : nums[0];
};

const buildServiceSchemas = (services, lang) => {
  if (!services?.length) return [];
  return services.flatMap((service) => {
    const category = service.category || service.key || 'beauty';
    if (Array.isArray(service.variants) && service.variants.length > 0) {
      return service.variants.map((v) =>
        createServiceSchema({
          name: `${pickLang(service.name, lang)} — ${pickLang(v.label, lang)}`,
          description: service.description ? pickLang(service.description, lang) : '',
          category,
          price: schemaOfferPrice(v.price),
        })
      );
    }
    return [
      createServiceSchema({
        name: pickLang(service.name, lang),
        description: service.description ? pickLang(service.description, lang) : '',
        category,
        price: schemaOfferPrice(pickLang(service.price, lang)),
      }),
    ];
  });
};

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

  // Загружаем услуги из статического JSON-файла
  const { data: services, loading, error, refetch } = useCache(
    'services',
    async () => {
      const response = await fetch('/data/services.json');
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      return data.filter(service => service.isActive).sort((a, b) => a.order - b.order);
    },
    {
      ttl: 60 * 60 * 1000, // 1 час (статический файл)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  );

  const servicesSchema = buildServiceSchemas(services, i18n.language);

  const filteredServices = services || [];
  const openPromoWhatsApp = () => {
    window.open(buildPromoWhatsAppUrl(i18n.language), '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <section id="services" className="services">
        <div className="services-container">
          <div className="services-header services-header--solo">
            <div className="services-header-left">
              <span className="services-eyebrow">{t('services.title')}</span>
              <h2 className="services-title">{t('services.title')}</h2>
            </div>
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
          <div className="services-header services-header--solo">
            <div className="services-header-left">
              <span className="services-eyebrow">{t('services.title')}</span>
              <h2 className="services-title">{t('services.title')}</h2>
            </div>
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
        schemaOnly
        schema={servicesSchema}
      />
      
      <div className="services-container">
        <motion.div
          initial={prerenderInitial({ opacity: 0, y: 30 })}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="services-header services-header--solo"
        >
          <div className="services-header-left">
            <span className="services-eyebrow">{t('services.title')}</span>
            <h2 className="services-title">{t('services.title')}</h2>
          </div>
        </motion.div>

        <motion.div
          initial={prerenderInitial({ opacity: 0 })}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="services-grid"
        >
          {filteredServices.map((service, index) => (
            <motion.div
              key={service._id || service.id}
              /* только opacity: scale/transform на iOS/WebKit режут многострочные прайсы */
              initial={prerenderInitial({ opacity: 0 })}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.36) }}
              viewport={{ once: true, amount: 0.08 }}
              className="service-card"
            >
              <div className="service-icon" style={{ color: service.color }}>
                {getServiceIcon(service.icon)}
              </div>
              <div className="service-content">
                <h3 className="service-title">
                  {pickLang(service.name, i18n.language)}
                </h3>
                {service.description && pickLang(service.description, i18n.language) ? (
                  <p className="service-description">
                    {pickLang(service.description, i18n.language)}
                  </p>
                ) : null}

                {Array.isArray(service.variants) && service.variants.length > 0 ? (
                  <ul className="service-variant-list">
                    {service.variants.map((v, i) => (
                      <li key={v.id || i} className="service-variant-row">
                        <span className="service-variant-label">
                          {pickLang(v.label, i18n.language)}
                        </span>
                        <span className="service-variant-price">
                          {formatPriceDisplay(v.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <>
                    <div className="service-details">
                      <div className="service-price">
                        <span>{formatPriceDisplay(pickLang(service.price, i18n.language))}</span>
                      </div>
                    </div>
                    {service.rating && (
                      <div className="service-rating">
                        <Star size={16} fill="#ffd700" />
                        <span>{service.rating}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredServices.length === 0 && (
          <motion.div
            initial={prerenderInitial({ opacity: 0 })}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="no-services"
          >
            <p>{t('services.noServices')}</p>
          </motion.div>
        )}

        <motion.div
          initial={prerenderInitial({ opacity: 0, y: 24 })}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="promo-card"
        >
          <div className="promo-card-glow" aria-hidden="true" />
          <div className="promo-icon">
            <Gift size={26} />
          </div>
          <div className="promo-copy">
            <span className="promo-eyebrow">{t('promo.eyebrow')}</span>
            <h3 className="promo-title">{t('promo.title')}</h3>
            <p className="promo-description">{t('promo.description')}</p>
            <div className="promo-code-row" aria-label={`${t('promo.codeLabel')}: ${PROMO_CODE}`}>
              <span>{t('promo.codeLabel')}</span>
              <strong>{PROMO_CODE}</strong>
            </div>
            <small>{t('promo.note')}</small>
          </div>
          <button className="promo-cta" type="button" onClick={openPromoWhatsApp}>
            <MessageCircle size={18} />
            {t('promo.cta')}
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Services; 