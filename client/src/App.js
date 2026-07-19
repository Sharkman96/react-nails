import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import './styles/themes.css';

import { ThemeProvider } from './contexts/ThemeContext';

import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Gallery from './components/Gallery';
import GelNails from './components/GelNails';
import About from './components/About';
import Contact from './components/Contact';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import LegalPage from './components/LegalPage';
import SEO from './components/SEO';
import NotFound from './components/NotFound';
import {
  createBreadcrumbSchema,
} from './utils/schema';
import { getCanonicalUrl, getLangFromPath } from './utils/localeRoutes';
import { isReactSnapPrerender } from './utils/prerender';

const MainSite = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const routeLang = getLangFromPath(location.pathname);
  const snap = isReactSnapPrerender();
  const [isLoaded, setIsLoaded] = useState(snap);

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

  const canonicalUrl = getCanonicalUrl(routeLang);

  if (!isLoaded && !snap) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="main-site">
      <SEO
        lang={routeLang}
        title={t('meta.title')}
        description={t('meta.description')}
        keywords={t('meta.keywords')}
        image="/og-image.jpg"
        canonical={canonicalUrl}
        schema={[
          createBreadcrumbSchema([
            { name: t('navigation.home'), url: `${canonicalUrl}` },
            { name: t('navigation.services'), url: `${canonicalUrl}#services` },
            { name: t('navigation.gallery'), url: `${canonicalUrl}#gallery` },
            { name: t('navigation.faq'), url: `${canonicalUrl}#faq` },
            { name: t('navigation.contact'), url: `${canonicalUrl}#contact` },
          ]),
        ]}
      />
      <Hero />
      <Services />
      <GelNails />
      <Gallery />
      <About />
      <FAQ />
      <Contact />
    </div>
  );
};

const Layout = ({ children }) => {
  const { i18n } = useTranslation();
  const snap = isReactSnapPrerender();
  const [isLoading, setIsLoading] = useState(!snap);

  useEffect(() => {
    if (snap) return undefined;
    if (i18n.isInitialized) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [i18n.isInitialized, snap]);

  if (isLoading && !snap) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const LocalizedApp = () => (
  <Layout>
    <MainSite />
  </Layout>
);

const LocalizedLegalPage = ({ page }) => (
  <Layout>
    <LegalPage page={page} />
  </Layout>
);

function App() {
  return (
    <ThemeProvider>
      <HelmetProvider>
        <Routes>
          <Route path="/" element={<LocalizedApp />} />
          <Route path="/de" element={<Navigate to="/" replace />} />
          <Route path="/ru" element={<LocalizedApp />} />
          <Route path="/impressum" element={<LocalizedLegalPage page="impressum" />} />
          <Route path="/datenschutz" element={<LocalizedLegalPage page="datenschutz" />} />
          <Route path="/ru/impressum" element={<LocalizedLegalPage page="impressum" />} />
          <Route path="/ru/datenschutz" element={<LocalizedLegalPage page="datenschutz" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;
