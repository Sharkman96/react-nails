import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from './SEO';
import { getLangFromPath } from '../utils/localeRoutes';

const NotFound = () => {
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);

  return (
    <div className="main-site" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <SEO
        lang={lang}
        title="404 — SmartNails Stuttgart"
        description="Seite nicht gefunden / Страница не найдена"
        noindex
      />
      <h1>404</h1>
      <p>Seite nicht gefunden.</p>
      <p>
        <Link to="/">Home (DE)</Link>
        {' · '}
        <Link to="/ru">Home (RU)</Link>
      </p>
    </div>
  );
};

export default NotFound;
