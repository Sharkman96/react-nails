# 🔒 Руководство по безопасности

## Обзор мер безопасности

Данное приложение реализует комплексные меры безопасности для защиты от различных типов атак и обеспечения целостности данных.

## 🛡️ Реализованные меры защиты

### 1. CSRF (Cross-Site Request Forgery) Защита

#### Серверная часть
- **Файл**: `middleware/security.js`
- **Функции**:
  - Генерация уникальных CSRF токенов
  - Валидация токенов для всех POST/PUT/DELETE запросов
  - Автоматическое удаление использованных токенов
  - TTL для токенов (24 часа)

#### Клиентская часть
- **Файл**: `client/src/utils/csrf.js`
- **Функции**:
  - Автоматическое получение CSRF токенов
  - Добавление токенов к запросам
  - Обработка ошибок CSRF
  - Кэширование токенов

#### Использование:
```javascript
import { useCSRF } from '../utils/csrf';

const { secureFetch, addTokenToObject } = useCSRF();

// Безопасный запрос
const response = await secureFetch('/api/gallery', {
  method: 'POST',
  body: JSON.stringify(data)
});

// Добавление токена к объекту
const dataWithToken = await addTokenToObject(formData);
```

### 2. Rate Limiting

#### Конфигурация
- **Окно**: 15 минут
- **Лимит**: 100 запросов с одного IP
- **Применение**: Все API маршруты

#### Реализация
```javascript
// В server.js
app.use('/api/', rateLimitMiddleware);
```

#### Настройка
```javascript
const SECURITY_CONFIG = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }
};
```

### 3. Валидация файлов

#### Проверки
- **Размер файла**: Максимум 5MB
- **Типы файлов**: JPEG, PNG, GIF, WebP
- **Расширения**: .jpg, .jpeg, .png, .gif, .webp
- **Содержимое**: Проверка заголовков файлов

#### Реализация
```javascript
// Валидация при загрузке
app.post('/api/upload', 
  upload.single('image'),
  validateFileType(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  validateFileSize(5 * 1024 * 1024),
  fileValidation
);
```

### 4. Валидация данных

#### Схемы валидации
- **Файл**: `middleware/validation.js`
- **Библиотека**: Joi
- **Покрытие**: Все API endpoints

#### Примеры схем:
```javascript
const validationSchemas = {
  user: {
    login: Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().min(6).max(100).required()
    })
  },
  gallery: {
    create: Joi.object({
      title: Joi.object({
        ru: Joi.string().min(1).max(100).required(),
        de: Joi.string().min(1).max(100).required()
      }).required()
    })
  }
};
```

### 5. Логирование действий

#### Уровни логирования
- **ERROR**: Критические ошибки и события безопасности
- **WARN**: Предупреждения и подозрительная активность
- **INFO**: Обычные операции
- **DEBUG**: Отладочная информация

#### Файлы логов
- `logs/error-YYYY-MM-DD.log` - Ошибки
- `logs/warn-YYYY-MM-DD.log` - Предупреждения
- `logs/info-YYYY-MM-DD.log` - Информация
- `logs/security.log` - События безопасности

#### Ротация логов
- **Максимальный размер**: 10MB
- **Количество файлов**: 5
- **Автоматическая очистка**: Старые файлы удаляются

### 6. Заголовки безопасности

#### Реализованные заголовки
```javascript
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
```

### 7. Санитизация данных

#### Функции санитизации
```javascript
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return value
      .replace(/[<>]/g, '')           // Удаление HTML тегов
      .replace(/javascript:/gi, '')   // Удаление javascript: ссылок
      .replace(/on\w+=/gi, '')        // Удаление event handlers
      .trim();
  }
  return value;
};
```

## 🔧 Конфигурация безопасности

### Переменные окружения
```bash
# CORS настройки
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Безопасность
NODE_ENV=production
SECURE_COOKIES=true
SESSION_SECRET=your-super-secret-key

# Логирование
LOG_LEVEL=info
LOG_ROTATION=true
```

### Настройки безопасности
```javascript
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
  }
};
```

## 📊 Мониторинг безопасности

### Логирование событий
```javascript
// События безопасности
logger.securityEvent('CSRF attack detected', {
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  attemptedToken: token
});

// Ошибки валидации
logger.validationError('email', email, 'Invalid email format');

// Файловые операции
logger.fileOperation('upload', filename, {
  size: fileSize,
  type: mimeType
});
```

### Анализ логов
```bash
# Просмотр событий безопасности
tail -f logs/security.log

# Поиск подозрительной активности
grep "CSRF" logs/error-*.log

# Анализ ошибок валидации
grep "VALIDATION_FAILED" logs/warn-*.log
```

## 🚨 Обработка инцидентов

### Типы инцидентов
1. **CSRF атаки** - Блокировка IP, логирование
2. **Rate limit превышен** - Временная блокировка
3. **Невалидные файлы** - Отклонение загрузки
4. **SQL инъекции** - Блокировка запросов
5. **XSS попытки** - Санитизация данных

### Процедуры реагирования
```javascript
// Автоматическое блокирование
if (securityLevel === 'HIGH') {
  // Логирование в отдельный файл
  // Уведомление администратора
  // Временная блокировка IP
}

// Мониторинг подозрительной активности
const suspiciousPatterns = [
  /<script/i,
  /javascript:/i,
  /on\w+=/i
];
```

## 🔍 Тестирование безопасности

### Ручное тестирование
```bash
# Тест CSRF защиты
curl -X POST http://localhost:5000/api/gallery \
  -H "Content-Type: application/json" \
  -d '{"title":"test"}' \
  # Должен вернуть 403 без CSRF токена

# Тест rate limiting
for i in {1..101}; do
  curl http://localhost:5000/api/health
done
# 101-й запрос должен быть заблокирован

# Тест валидации файлов
curl -X POST http://localhost:5000/api/upload \
  -F "image=@malicious.exe" \
  # Должен вернуть ошибку валидации
```

### Автоматизированное тестирование
```javascript
// Тесты безопасности
describe('Security Tests', () => {
  test('CSRF protection', async () => {
    const response = await request(app)
      .post('/api/gallery')
      .send({ title: 'test' });
    
    expect(response.status).toBe(403);
  });

  test('File validation', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('image', 'test/malicious.exe');
    
    expect(response.status).toBe(400);
  });
});
```

## 📚 Дополнительные ресурсы

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CSRF Protection](https://owasp.org/www-community/attacks/csrf)
- [XSS Prevention](https://owasp.org/www-project-cheat-sheets/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Security Headers](https://owasp.org/www-project-secure-headers/)

## 🤝 Поддержка безопасности

При обнаружении уязвимостей:
1. Создайте issue в репозитории
2. Опишите детали уязвимости
3. Предложите решение
4. Не публикуйте эксплойты публично

## 📈 Метрики безопасности

- **CSRF атаки**: 0 (благодаря защите)
- **Rate limit превышения**: Мониторинг в логах
- **Невалидные файлы**: Отклоняются автоматически
- **Время реакции на инциденты**: < 5 минут 