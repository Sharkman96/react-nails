import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { prerenderInitial } from '../utils/prerender';
import './GelNails.css';

const GelNails = () => {
  const { t } = useTranslation();

  const items = ['gelPolish', 'buildUp', 'extensions'];

  return (
    <section id="gelnaegel" className="gelnails">
      <div className="gelnails-container">
        <motion.div
          initial={prerenderInitial({ opacity: 0, y: 30 })}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="gelnails-header"
        >
          <span className="gelnails-eyebrow">{t('gelnails.eyebrow')}</span>
          <h2 className="gelnails-title">{t('gelnails.title')}</h2>
          <div className="gelnails-underline" />
          <p className="gelnails-description">{t('gelnails.description')}</p>
        </motion.div>

        <div className="gelnails-grid">
          {items.map((key, index) => (
            <motion.article
              key={key}
              initial={prerenderInitial({ opacity: 0, y: 24 })}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="gelnails-card"
            >
              <div className="gelnails-card-icon" aria-hidden="true">
                <Sparkles size={22} />
              </div>
              <h3>{t(`gelnails.items.${key}.title`)}</h3>
              <p>{t(`gelnails.items.${key}.description`)}</p>
              <span className="gelnails-price">{t(`gelnails.items.${key}.price`)}</span>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={prerenderInitial({ opacity: 0 })}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="gelnails-cta-wrap"
        >
          <a href="#services" className="gelnails-cta">
            {t('gelnails.cta')}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default GelNails;
