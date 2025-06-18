// API конфигурация
const API_CONFIG = {
  // Базовый URL для API
  baseURL: process.env.NODE_ENV === 'production' 
    ? '' // В продакшене используем относительные пути через Nginx
    : 'http://localhost:5000',
  
  // Endpoints
  endpoints: {
    auth: '/api/auth',
    services: '/api/services',
    gallery: '/api/gallery',
    analytics: '/api/analytics',
    admin: '/api/admin'
  },
  
  // Настройки запросов
  defaultOptions: {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Для передачи cookies
  },

  // Таймауты
  timeout: 30000 // 30 секунд
};

export default API_CONFIG; 