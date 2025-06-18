import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './App.css';
import './styles/themes.css';

// Контексты
import { ThemeProvider } from './contexts/ThemeContext';

// Компоненты
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Gallery from './components/Gallery';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/admin/AdminPanel';
import SEO from './components/SEO';
import { createWebSiteSchema, createOrganizationSchema } from './utils/schema';

const MainSite = () => {
  const { t, i18n } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (i18n.isInitialized) {
      document.title = i18n.language === 'ru' 
        ? 'Профессиональный маникюр в Штутгарте | Мастер по маникюру'
        : 'Professionelle Maniküre in Stuttgart | Nageldesign Meister';
      setIsLoaded(true);
    }
  }, [i18n.isInitialized, i18n.language]);

  if (!isLoaded) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="main-site">
      <SEO 
        title={t('hero.title')}
        description={t('hero.description')}
        keywords={i18n.language === 'ru'
          ? 'маникюр штутгарт, педикюр штутгарт, наращивание ногтей, дизайн ногтей, маникюр салон'
          : 'maniküre stuttgart, pediküre stuttgart, nagelverlängerung, nageldesign, maniküre salon'
        }
        image="/images/hero-bg.jpg"
        schema={[
          createWebSiteSchema(),
          createOrganizationSchema()
        ]}
      />
      <Hero />
      <Services />
      <Gallery />
      <About />
      <Contact />
    </div>
  );
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (i18n.isInitialized) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [i18n.isInitialized]);

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="app-container">
      {!isAdmin && <Header />}
      <main className="main-content">
        {children}
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <HelmetProvider>
        <Layout>
          <Routes>
            <Route path="/admin/*" element={<AdminPanel />} />
            <Route path="/" element={<MainSite />} />
          </Routes>
        </Layout>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;
