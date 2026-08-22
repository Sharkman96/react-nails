import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import SEO from './SEO';
import {
  getCanonicalUrl,
  getHreflangAlternates,
  getLandingPath,
  getLangFromPath,
  getLanguagePath,
} from '../utils/localeRoutes';
import { createBreadcrumbSchema, createFAQSchema, createServiceSchema } from '../utils/schema';
import { pickLang } from '../utils/lang';
import { buildPromoWhatsAppUrl } from '../utils/promo';
import { isReactSnapPrerender } from '../utils/prerender';
import './LandingPage.css';

const LandingPage = ({ slug }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const routeLang = getLangFromPath(location.pathname);
  const snap = isReactSnapPrerender();
  const [isLoaded, setIsLoaded] = useState(snap);
  const [priceGroups, setPriceGroups] = useState([]);

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

  useEffect(() => {
    if (slug !== 'preise') return undefined;
    let cancelled = false;
    fetch('/data/services.json')
      .then((res) => (res.ok ? res.json() : []))
      .then((json) => {
        if (!cancelled && Array.isArray(json)) {
          setPriceGroups(json.filter((item) => item.isActive !== false));
        }
      })
      .catch(() => {
        if (!cancelled) setPriceGroups([]);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!isLoaded && !snap) {
    return <div className="loading-screen">Loading...</div>;
  }

  const base = `landing.${slug}`;
  const sections = t(`${base}.sections`, { returnObjects: true, defaultValue: [] });
  const faq = t(`${base}.faq`, { returnObjects: true, defaultValue: [] });
  const related = t(`${base}.related`, { returnObjects: true, defaultValue: [] });
  const sectionList = Array.isArray(sections) ? sections : [];
  const faqList = Array.isArray(faq) ? faq : [];
  const relatedList = Array.isArray(related) ? related : [];

  const canonicalUrl = getCanonicalUrl(routeLang, `/${slug}`);
  const homePath = getLanguagePath(routeLang);
  const homeUrl = getCanonicalUrl(routeLang);
  const whatsappUrl = buildPromoWhatsAppUrl(routeLang);

  const schemas = [
    createBreadcrumbSchema([
      { name: t('navigation.home'), url: homeUrl },
      { name: t(`${base}.title`), url: canonicalUrl },
    ]),
  ];

  if (faqList.length) {
    schemas.push(
      createFAQSchema(
        faqList.map((item) => ({ question: item.q, answer: item.a }))
      )
    );
  }

  if (slug === 'gelnagel-stuttgart') {
    schemas.push(
      createServiceSchema({
        name: t(`${base}.title`),
        description: t(`${base}.lead`),
        category: 'Gelnägel',
        price: '45',
      })
    );
  }

  if (slug === 'manikure-stuttgart') {
    schemas.push(
      createServiceSchema({
        name: t(`${base}.title`),
        description: t(`${base}.lead`),
        category: 'Maniküre',
        price: '30',
      })
    );
  }

  return (
    <article className="landing-page">
      <SEO
        lang={routeLang}
        title={t(`${base}.metaTitle`)}
        description={t(`${base}.metaDescription`)}
        keywords={t(`${base}.keywords`)}
        image="/og-image.jpg"
        canonical={canonicalUrl}
        alternates={getHreflangAlternates(`/${slug}`)}
        schema={schemas}
      />

      <div className="landing-container">
        <Link to={homePath} className="landing-back">
          <ArrowLeft size={16} aria-hidden="true" />
          {t('landing.backToHome')}
        </Link>

        <header className="landing-header">
          <p className="landing-eyebrow">{t(`${base}.eyebrow`)}</p>
          <h1 className="landing-title">{t(`${base}.title`)}</h1>
          <p className="landing-lead">{t(`${base}.lead`)}</p>
        </header>

        <div className="landing-content">
          {sectionList.map((section) => (
            <section key={section.id} className="landing-section" id={section.id}>
              <h2>{section.heading}</h2>
              {(section.paragraphs || []).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list?.length ? (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          {slug === 'preise' && priceGroups.length > 0 ? (
            <section className="landing-section" id="preisliste">
              <h2>{t('landing.preise.listHeading')}</h2>
              <div className="landing-prices">
                {priceGroups.map((group) => (
                  <div key={group.id} className="landing-price-group">
                    <h3>{pickLang(group.name, routeLang)}</h3>
                    <ul>
                      {(group.variants || []).map((variant) => (
                        <li key={`${group.id}-${pickLang(variant.label, routeLang)}`}>
                          <span>{pickLang(variant.label, routeLang)}</span>
                          <strong>{variant.price} €</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p>{t('services.priceNote')}</p>
            </section>
          ) : null}

          {faqList.length ? (
            <section className="landing-section" id="faq">
              <h2>{t('faq.title')}</h2>
              {faqList.map((item) => (
                <div key={item.q} className="landing-faq">
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </div>
              ))}
            </section>
          ) : null}
        </div>

        <div className="landing-cta">
          <a
            className="landing-cta-btn"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('landing.bookCta')}
          </a>
          <p className="landing-cta-note">{t('promo.contactHint')}</p>
        </div>

        {relatedList.length ? (
          <nav className="landing-related" aria-label={t('landing.relatedLabel')}>
            <p>{t('landing.relatedLabel')}</p>
            <ul>
              {relatedList.map((relatedSlug) => (
                <li key={relatedSlug}>
                  <Link to={getLandingPath(relatedSlug, routeLang)}>
                    {t(`landing.${relatedSlug}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </article>
  );
};

export default LandingPage;
