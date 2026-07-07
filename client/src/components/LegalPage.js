import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import SEO from './SEO';
import { getLegalInterpolation } from '../utils/legal';
import {
  getCanonicalUrl,
  getLangFromPath,
  getLanguagePath,
} from '../utils/localeRoutes';
import { createBreadcrumbSchema } from '../utils/schema';
import './LegalPage.css';

const interpolateLegalText = (text, values) =>
  String(text).replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `{{${key}}}`);

const LegalPage = ({ page }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const routeLang = getLangFromPath(location.pathname);
  const [isLoaded, setIsLoaded] = useState(false);
  const legalValues = getLegalInterpolation(routeLang);

  useEffect(() => {
    if (i18n.language !== routeLang) {
      i18n.changeLanguage(routeLang);
    }
  }, [routeLang, i18n]);

  useEffect(() => {
    if (i18n.isInitialized && i18n.language === routeLang) {
      setIsLoaded(true);
    }
  }, [i18n.isInitialized, i18n.language, routeLang]);

  if (!isLoaded) {
    return <div className="loading-screen">Loading...</div>;
  }

  const sections = t(`legal.${page}.sections`, {
    returnObjects: true,
    defaultValue: [],
    ...legalValues,
  });

  const sectionList = Array.isArray(sections) ? sections : [];
  const canonicalUrl = getCanonicalUrl(routeLang, `/${page}`);
  const homePath = getLanguagePath(routeLang);

  return (
    <article className="legal-page">
      <SEO
        lang={routeLang}
        title={t(`legal.${page}.title`)}
        description={t(`legal.${page}.metaDescription`, legalValues)}
        canonical={canonicalUrl}
        schema={createBreadcrumbSchema([
          { name: t('navigation.home'), url: getCanonicalUrl(routeLang) },
          { name: t(`legal.${page}.title`), url: canonicalUrl },
        ])}
      />

      <div className="legal-container">
        <Link to={homePath} className="legal-back">
          <ArrowLeft size={16} aria-hidden="true" />
          {t('legal.backToHome')}
        </Link>

        <header className="legal-header">
          <h1 className="legal-title">{t(`legal.${page}.title`)}</h1>
          <p className="legal-updated">
            {t('legal.lastUpdated', { date: legalValues.lastUpdated })}
          </p>
        </header>

        <div className="legal-content">
          {sectionList.map((section) => (
            <section key={section.id} className="legal-section" id={section.id}>
              <h2>{interpolateLegalText(section.heading, legalValues)}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{interpolateLegalText(paragraph, legalValues)}</p>
              ))}
              {section.list?.length > 0 && (
                <ul>
                  {section.list.map((item, index) => (
                    <li key={index}>{interpolateLegalText(item, legalValues)}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
};

export default LegalPage;
