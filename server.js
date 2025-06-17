const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Импорт middleware
const { 
  cacheMiddleware, 
  rateLimitMiddleware,
  adminRateLimitMiddleware,
  authRateLimitMiddleware,
  staticCacheMiddleware, 
  compressionMiddleware 
} = require('./middleware/cache');

const { 
  optimizeUploadedImage, 
  imageResizeMiddleware 
} = require('./middleware/imageOptimization');

const {
  csrfProtection,
  generateCSRFTokenMiddleware,
  fileValidation,
  upload,
  actionLogger,
  securityHeaders,
  ipWhitelist,
  securityUtils
} = require('./middleware/security');

const {
  validate,
  sanitizeData,
  validateFileType,
  validateFileSize,
  validateFileCount,
  validationSchemas
} = require('./middleware/validation');

const {
  logger,
  requestLogger,
  errorLogger,
  logUtils
} = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nailart_studio')
.then(() => {
  logger.info('MongoDB подключена');
  console.log('MongoDB подключена');
})
.catch(err => {
  logger.error('Ошибка подключения к MongoDB', { error: err.message });
  console.error('Ошибка подключения к MongoDB:', err);
});

// Базовые middleware безопасности
app.use(compression());

// Отключаем CSP в режиме разработки, чтобы избежать конфликтов с unsafe-eval
if (process.env.NODE_ENV === 'development') {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
  }));
} else {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: ["'self'", "ws:", "wss:", "http://localhost:*", "https:"],
        mediaSrc: ["'self'", "data:", "https:"],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["'self'", "blob:"],
        frameSrc: ["'self'"],
        manifestSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
  }));
}

// Дополнительные заголовки безопасности
app.use(securityHeaders);

// CORS с ограничениями
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Парсинг JSON с ограничениями
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Логирование запросов
app.use(requestLogger);

// Санитизация данных
app.use(sanitizeData);

// Кэширование статических файлов
app.use(staticCacheMiddleware);

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const galleryRoutes = require('./routes/gallery');
const analyticsRoutes = require('./routes/analytics');
const csrfRoutes = require('./routes/csrf');
const sitemapRoutes = require('./routes/sitemap');

// Rate limiting для аутентификации (более строгий)
app.use('/api/auth', authRateLimitMiddleware);

// API маршруты с защитой
app.use('/api/auth', authRoutes);
app.use('/api', csrfRoutes); // CSRF маршруты

// Админские роуты с повышенным лимитом запросов
app.use('/api/admin', adminRateLimitMiddleware);

// Админские роуты без CSRF (только с авторизацией)
// Убираем кэширование для админских операций чтобы изменения отражались мгновенно
app.use('/api/admin/services', serviceRoutes);
app.use('/api/admin/gallery', galleryRoutes);

app.use('/api/admin/analytics', analyticsRoutes);

// Обычный rate limiting для публичных API
app.use('/api/', rateLimitMiddleware);

// Публичные маршруты без CSRF (GET запросы не требуют CSRF токена)
app.use('/api/services', 
  cacheMiddleware(10 * 60 * 1000), // 10 минут
  serviceRoutes
);

app.use('/api/gallery', 
  cacheMiddleware(5 * 60 * 1000), // 5 минут
  galleryRoutes
);

app.use('/api/analytics', analyticsRoutes);

// Sitemap routes
app.use('/', sitemapRoutes);

// API routes
app.get('/api/health', (req, res) => {
  logger.info('Health check', { ip: req.ip, userAgent: req.get('User-Agent') });
  res.json({ 
    status: 'OK', 
    message: 'Nail Master API is running',
    timestamp: new Date().toISOString(),
    security: {
      csrfEnabled: true,
      rateLimitEnabled: true,
      validationEnabled: true
    }
  });
});

// Маршрут для загрузки файлов с валидацией
app.post('/api/upload', 
  generateCSRFTokenMiddleware,
  csrfProtection,
  upload.single('image'),
  validateFileType(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  validateFileSize(10 * 1024 * 1024), // 10MB
  fileValidation,
  optimizeUploadedImage,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        code: 'NO_FILE'
      });
    }

    logger.fileOperation('upload', req.file.originalname, {
      size: req.file.size,
      mimetype: req.file.mimetype,
      userId: req.user?.id || 'anonymous'
    });

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        optimized: req.file.optimized
      }
    });
  }
);

// Маршрут для оптимизации изображений
app.get('/uploads/:filename', imageResizeMiddleware, (req, res, next) => {
  // Если middleware не обработал запрос, передаем дальше
  next();
});

// Serve uploaded files с кэшированием
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d', // Кэшируем изображения на 7 дней
  etag: true,
  lastModified: true
}));

// Serve assets files с кэшированием
app.use('/assets', express.static(path.join(__dirname, 'client/src/assets'), {
  maxAge: '30d', // Кэшируем статические ресурсы на 30 дней
  etag: true,
  lastModified: true
}));

// Serve static files from the React app с кэшированием
app.use(express.static(path.join(__dirname, 'client/build'), {
  maxAge: '1d', // Кэшируем статические файлы на 1 день
  etag: true,
  lastModified: true
}));

// SEO-friendly routes
app.get('/ru', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

app.get('/de', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// Это позволит React Router обрабатывать все маршруты, включая /admin
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Middleware для обработки ошибок
app.use(errorLogger);

// Обработчик 404
app.use((req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  
  res.status(404).json({
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND'
  });
});

// Глобальный обработчик ошибок
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    security: {
      csrfEnabled: true,
      rateLimitEnabled: true,
      validationEnabled: true,
      loggingEnabled: true
    }
  });
  
  console.log(`Server is running on port ${PORT}`);
  console.log('Access the app at: http://localhost:5000');
  console.log('Access admin panel at: http://localhost:5000/admin');
  console.log('Security features enabled:');
  console.log('✅ CSRF Protection');
  console.log('✅ Rate Limiting');
  console.log('✅ File Validation');
  console.log('✅ Request Logging');
  console.log('✅ Security Headers');
  console.log('✅ Input Sanitization');
}); 