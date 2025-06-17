const rateLimit = require('express-rate-limit');

// Простое in-memory кэширование (можно заменить на Redis)
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
  }

  set(key, value, ttlMs = 5 * 60 * 1000) {
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttlMs);
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const expiry = this.ttl.get(key);
    if (Date.now() > expiry) {
      this.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.ttl.entries()) {
      if (now > expiry) {
        this.delete(key);
      }
    }
  }
}

const cache = new MemoryCache();

// Автоматическая очистка кэша каждые 5 минут
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

// Middleware для кэширования API ответов
const cacheMiddleware = (ttl = 5 * 60 * 1000) => {
  return (req, res, next) => {
    // Пропускаем кэширование для POST, PUT, DELETE запросов
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    // Перехватываем оригинальный res.json
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, data, ttl);
      res.set('X-Cache', 'MISS');
      return originalJson.call(this, data);
    };

    next();
  };
};

// Rate limiting middleware для обычных API
const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting middleware для админ панели (более высокие лимиты)
const adminRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 500, // максимум 500 запросов с одного IP для админки
  message: {
    error: 'Too many admin requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Используем IP + User-Agent для более точной идентификации
    return `${req.ip}-${req.get('User-Agent')}`;
  }
});

// Rate limiting для аутентификации (более строгий)
const authRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 20, // максимум 20 попыток входа за 15 минут
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // не считаем успешные запросы
});

// Middleware для кэширования статических файлов
const staticCacheMiddleware = (req, res, next) => {
  // Кэшируем статические файлы на 1 день
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 день
  }
  
  // Кэшируем изображения на 7 дней
  if (req.url.match(/\.(png|jpg|jpeg|gif|webp|avif)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 дней
  }
  
  next();
};

// Middleware для сжатия ответов
const compressionMiddleware = (req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'];
  
  if (acceptEncoding && acceptEncoding.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
  } else if (acceptEncoding && acceptEncoding.includes('deflate')) {
    res.setHeader('Content-Encoding', 'deflate');
  }
  
  next();
};

// Утилиты для работы с кэшем
const cacheUtils = {
  get: (key) => cache.get(key),
  set: (key, value, ttl) => cache.set(key, value, ttl),
  delete: (key) => cache.delete(key),
  clear: () => cache.clear(),
  cleanup: () => cache.cleanup()
};

module.exports = {
  cacheMiddleware,
  rateLimitMiddleware,
  adminRateLimitMiddleware,
  authRateLimitMiddleware,
  staticCacheMiddleware,
  compressionMiddleware,
  cacheUtils
}; 