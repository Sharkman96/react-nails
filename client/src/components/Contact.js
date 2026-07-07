import React from 'react';

import { useTranslation } from 'react-i18next';

import { motion } from 'framer-motion';

import { Gift, MapPin, MessageCircle, Instagram } from 'lucide-react';

import { buildPromoWhatsAppUrl } from '../utils/promo';

import { GOOGLE_MAPS_URL } from '../utils/schema';

import { prerenderInitial } from '../utils/prerender';

import './Contact.css';



const Contact = () => {

  const { t, i18n } = useTranslation();



  const handleContact = (type) => {

    switch (type) {

      case 'whatsapp':

        window.open(buildPromoWhatsAppUrl(i18n.language), '_blank', 'noopener,noreferrer');

        break;

      case 'instagram':

        window.open('https://instagram.com/smartnails_stuttgart', '_blank', 'noopener,noreferrer');

        break;

      default:

        break;

    }

  };



  return (

    <section id="contact" className="contact">

      <div className="contact-container">

        <motion.div

          initial={prerenderInitial({ opacity: 0, y: 30 })}

          whileInView={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}

          viewport={{ once: true }}

          className="contact-header"

        >

          <span className="contact-eyebrow">{t('contact.title')}</span>

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

              <span className="contact-label">{t('contact.addressLabel')}</span>

              <a

                href={GOOGLE_MAPS_URL}

                target="_blank"

                rel="noopener noreferrer"

                className="contact-address-link"

              >

                {t('contact.address')}

              </a>

            </div>

          </div>



          <div className="contact-actions">

            <div className="contact-promo-note">

              <Gift size={16} />

              <span>{t('promo.contactHint')}</span>

            </div>

            <motion.a

              href={GOOGLE_MAPS_URL}

              target="_blank"

              rel="noopener noreferrer"

              whileHover={{ scale: 1.05 }}

              whileTap={{ scale: 0.95 }}

              className="contact-btn maps"

            >

              <MapPin size={20} />

              {t('contact.googleMaps')}

            </motion.a>

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

