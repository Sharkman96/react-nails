import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const PageTracker = () => {
  const location = useLocation();
  const lastTrackedPath = useRef(null);
  const trackingTimeout = useRef(null);

  useEffect(() => {
    const trackPageView = async () => {
      // Не отслеживаем админ панель
      if (location.pathname.startsWith('/admin')) {
        return;
      }

      // Не отслеживаем повторные переходы на ту же страницу
      if (lastTrackedPath.current === location.pathname) {
        return;
      }

      // Очищаем предыдущий таймаут
      if (trackingTimeout.current) {
        clearTimeout(trackingTimeout.current);
      }

      // Добавляем небольшую задержку для предотвращения множественных запросов
      trackingTimeout.current = setTimeout(async () => {
        try {
          await fetch('/api/analytics/pageview', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ page: location.pathname })
          });
          
          // Запоминаем последний отслеженный путь
          lastTrackedPath.current = location.pathname;
        } catch (error) {
          console.error('Error tracking page view:', error);
        }
      }, 100); // Задержка 100мс
    };

    trackPageView();

    // Очистка таймаута при размонтировании
    return () => {
      if (trackingTimeout.current) {
        clearTimeout(trackingTimeout.current);
      }
    };
  }, [location.pathname]);

  return null; // Этот компонент не рендерит ничего
};

export default PageTracker; 