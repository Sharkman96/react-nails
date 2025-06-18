import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MessageCircle, Instagram } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const { t } = useTranslation();

  const handleContact = (type) => {
    switch (type) {
      case 'whatsapp':
        window.open('https://wa.me/79001234567', '_blank');
        break;
      case 'instagram':
        window.open('https://instagram.com/smartnails_stuttgart', '_blank');
        break;
        default:
        break;
    }
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="contact-header"
        >
          <h2 className="contact-title">{t('contact.title')}</h2>
          <div className="contact-underline"></div>
        </motion.div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-row">
              <span className="contact-label">Instagram:</span>
              <a href="https://instagram.com/smartnails_stuttgart" target="_blank" rel="noopener noreferrer">@smartnails_stuttgart</a>
            </div>
            <div className="contact-row">
              <span className="contact-label">WhatsApp:</span>
              <a href="https://wa.me/491701264472" target="_blank" rel="noopener noreferrer">+49 170 1264472</a>
            </div>
            <div className="contact-row">
              <span className="contact-label">{t('contact.address')}</span>
              </div>
            <div className="contact-row">
            </div>
          </div>

          <div className="contact-actions">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="contact-btn whatsapp"
              onClick={() => handleContact('whatsapp')}
            >
              <MessageCircle size={20} />
              {t('contact.whatsapp')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="contact-btn instagram"
              onClick={() => handleContact('instagram')}
            >
              <Instagram size={20} />
              {t('contact.instagram')}
            </motion.button>
          
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact; 