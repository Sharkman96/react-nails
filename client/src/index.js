import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const LoadingFallback = () => (
  <div style={{
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.2rem'
  }}>
    Loading...
  </div>
);

const app = (
  <React.StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);

const container = document.getElementById('root');

// Always createRoot: hydrateRoot + react-snap causes React #418/#423 when
// a previously saved index.html is reused for another route during the crawl.
container.innerHTML = '';
createRoot(container).render(app);

reportWebVitals();
