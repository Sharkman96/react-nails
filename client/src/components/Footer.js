import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Instagram, MapPin } from 'lucide-react';
import { GOOGLE_MAPS_URL } from '../utils/schema';
import { getLegalPath } from '../utils/localeRoutes';
import './Footer.css';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const year = new Date().getFullYear();
  const lang = i18n.language === 'ru' ? 'ru' : 'de';

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <span className="footer-brand">SmartNails Stuttgart</span>
          <span className="footer-divider">·</span>
          <span className="footer-copy">© {year}</span>
        </div>

        <nav className="footer-legal" aria-label={t('footer.legalNav', { defaultValue: 'Rechtliches' })}>
          <Link to={getLegalPath('impressum', lang)}>{t('footer.impressum')}</Link>
          <span className="footer-legal-divider" aria-hidden="true">·</span>
          <Link to={getLegalPath('datenschutz', lang)}>{t('footer.privacy')}</Link>
        </nav>

        <div className="footer-right">
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-location"
          >
            <MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {t('contact.address')}
          </a>
          <a
            href="https://instagram.com/smartnails_stuttgart"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-instagram"
          >
            <Instagram size={15} />
            @smartnails_stuttgart
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
