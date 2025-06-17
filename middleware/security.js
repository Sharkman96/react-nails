const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// CSRF токены хранилище (в продакшене использовать Redis)
const csrfTokens = new Map();

// Конфигурация безопасности
const SECURITY_CONFIG = {
  csrf: {
    tokenLength: 32,
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 часа
    headerName: 'X-CSRF-Token'
  },
  fileUpload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxFiles: 10
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }
};

// Генерация CSRF токена
const generateCSRFToken = () => {
  return crypto.randomBytes(SECURITY_CONFIG.csrf.tokenLength).toString('hex');
};

// CSRF middleware
const csrfProtection = (req, res, next) => {
  // Пропускаем GET запросы
  if (req.method === 'GET') {
    return next();
  }

  const token = req.headers[SECURITY_CONFIG.csrf.headerName.toLowerCase()] || 
                req.body._csrf || 
                req.query._csrf;

  if (!token) {
    return res.status(403).json({ 
      error: 'CSRF token missing',
      code: 'CSRF_MISSING'
    });
  }

  const storedToken = csrfTokens.get(token);
  if (!storedToken) {
    return res.status(403).json({ 
      error: 'Invalid CSRF token',
      code: 'CSRF_INVALID'
    });
  }

  // Проверяем срок действия токена
  if (Date.now() > storedToken.expiry) {
    csrfTokens.delete(token);
    return res.status(403).json({ 
      error: 'CSRF token expired',
      code: 'CSRF_EXPIRED'
    });
  }

  // Удаляем использованный токен
  csrfTokens.delete(token);
  next();
};

// Middleware для генерации CSRF токена
const generateCSRFTokenMiddleware = (req, res, next) => {
  const token = generateCSRFToken();
  const expiry = Date.now() + SECURITY_CONFIG.csrf.tokenExpiry;
  
  csrfTokens.set(token, { expiry });
  
  res.locals.csrfToken = token;
  next();
};

// Валидация файлов
const fileValidation = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const files = req.files || [req.file];
  
  for (const file of files) {
    // Проверка размера файла
    if (file.size > SECURITY_CONFIG.fileUpload.maxFileSize) {
      return res.status(400).json({
        error: `File ${file.originalname} is too large. Maximum size is ${SECURITY_CONFIG.fileUpload.maxFileSize / 1024 / 1024}MB`,
        code: 'FILE_TOO_LARGE'
      });
    }

    // Проверка MIME типа
    if (!SECURITY_CONFIG.fileUpload.allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: `File type ${file.mimetype} is not allowed`,
        code: 'FILE_TYPE_NOT_ALLOWED'
      });
    }

    // Проверка расширения файла
    const ext = path.extname(file.originalname).toLowerCase();
    if (!SECURITY_CONFIG.fileUpload.allowedExtensions.includes(ext)) {
      return res.status(400).json({
        error: `File extension ${ext} is not allowed`,
        code: 'FILE_EXTENSION_NOT_ALLOWED'
      });
    }

    // Проверка на вредоносное содержимое
    if (file.buffer) {
      const header = file.buffer.toString('hex', 0, 8);
      if (header.includes('ffd8ff') || header.includes('89504e47') || header.includes('47494638')) {
        // Это валидное изображение
      } else {
        return res.status(400).json({
          error: 'File appears to be corrupted or not a valid image',
          code: 'FILE_CORRUPTED'
        });
      }
    }
  }

  next();
};

// Настройка multer с валидацией
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: SECURITY_CONFIG.fileUpload.maxFileSize,
    files: SECURITY_CONFIG.fileUpload.maxFiles
  },
  fileFilter: (req, file, cb) => {
    // Дополнительная проверка MIME типа
    if (!SECURITY_CONFIG.fileUpload.allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }
    
    // Проверка расширения
    const ext = path.extname(file.originalname).toLowerCase();
    if (!SECURITY_CONFIG.fileUpload.allowedExtensions.includes(ext)) {
      return cb(new Error('Invalid file extension'), false);
    }
    
    cb(null, true);
  }
});

// Логирование действий
const actionLogger = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  // Перехватываем ответ
  res.send = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous',
      body: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined,
      headers: sanitizeHeaders(req.headers)
    };

    // Логируем в зависимости от статуса
    if (res.statusCode >= 400) {
      console.error('❌ Security Event:', logEntry);
    } else if (res.statusCode >= 300) {
      console.warn('⚠️  Redirect:', logEntry);
    } else {
      console.log('✅ Request:', logEntry);
    }

    // Сохраняем в файл (в продакшене использовать Winston или подобное)
    saveLogToFile(logEntry);
    
    originalSend.call(this, data);
  };

  next();
};

// Санитизация данных для логирования
const sanitizeRequestBody = (body) => {
  if (!body) return body;
  
  const sanitized = { ...body };
  
  // Удаляем чувствительные данные
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized._csrf;
  delete sanitized.secret;
  
  return sanitized;
};

const sanitizeHeaders = (headers) => {
  const sanitized = { ...headers };
  
  // Удаляем чувствительные заголовки
  delete sanitized.authorization;
  delete sanitized.cookie;
  delete sanitized['x-csrf-token'];
  
  return sanitized;
};

// Сохранение логов в файл
const saveLogToFile = async (logEntry) => {
  try {
    const logDir = path.join(__dirname, '..', 'logs');
    await fs.mkdir(logDir, { recursive: true });
    
    const logFile = path.join(logDir, `security-${new Date().toISOString().split('T')[0]}.log`);
    const logLine = JSON.stringify(logEntry) + '\n';
    
    await fs.appendFile(logFile, logLine);
  } catch (error) {
    console.error('Error saving log:', error);
  }
};

// Middleware для проверки безопасности заголовков
const securityHeaders = (req, res, next) => {
  // Защита от XSS
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Запрет MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Защита от clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Strict Transport Security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self'; " +
    "media-src 'self' data: https:;"
  );
  
  next();
};

// Middleware для проверки IP адреса
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        error: 'Access denied from this IP address',
        code: 'IP_NOT_ALLOWED'
      });
    }
    
    next();
  };
};

// Утилиты для работы с безопасностью
const securityUtils = {
  generateToken: generateCSRFToken,
  validateFile: (file) => {
    return SECURITY_CONFIG.fileUpload.allowedTypes.includes(file.mimetype) &&
           SECURITY_CONFIG.fileUpload.allowedExtensions.includes(path.extname(file.originalname).toLowerCase());
  },
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>]/g, '');
  },
  hashPassword: (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
  }
};

module.exports = {
  csrfProtection,
  generateCSRFTokenMiddleware,
  fileValidation,
  upload,
  actionLogger,
  securityHeaders,
  ipWhitelist,
  securityUtils,
  SECURITY_CONFIG
}; 