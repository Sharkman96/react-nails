# Технические улучшения производительности

## 🚀 Обзор оптимизаций

Данный проект включает комплексные технические улучшения для повышения производительности веб-приложения:

### 1. Lazy Loading для изображений

#### Компонент LazyImage
- **Файл**: `client/src/components/ui/LazyImage.js`
- **Функции**:
  - Автоматическая загрузка изображений при появлении в viewport
  - Поддержка placeholder изображений
  - Обработка ошибок загрузки
  - Плавные анимации появления

#### Использование:
```jsx
import LazyImage from './components/ui/LazyImage';

<LazyImage 
  src={imageUrl}
  alt="Описание изображения"
  threshold={200}
  effect="blur"
  placeholderSrc={placeholderUrl}
/>
```

### 2. Кэширование данных

#### Хук useCache
- **Файл**: `client/src/hooks/useCache.js`
- **Функции**:
  - In-memory кэширование с TTL
  - Автоматическая очистка устаревших данных
  - Поддержка принудительного обновления
  - Refetch при восстановлении соединения

#### Использование:
```jsx
import { useCache } from '../hooks/useCache';

const { data, loading, error, refetch } = useCache(
  'gallery-items',
  async () => {
    const response = await fetch('/api/gallery');
    return response.json();
  },
  {
    ttl: 10 * 60 * 1000, // 10 минут
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  }
);
```

### 3. CDN для статических файлов

#### Конфигурация CDN
- **Файл**: `client/src/utils/imageOptimization.js`
- **Функции**:
  - Автоматическое определение поддержки WebP
  - Генерация оптимизированных URL
  - Поддержка различных форматов изображений
  - Responsive изображения с srcset

#### Настройка:
```javascript
// В .env файле
REACT_APP_CDN_URL=https://your-cdn-domain.com
```

### 4. Оптимизация изображений

#### Серверная оптимизация
- **Файл**: `middleware/imageOptimization.js`
- **Функции**:
  - Автоматическое сжатие загруженных изображений
  - Создание WebP версий
  - Динамический ресайзинг по запросу
  - Поддержка различных форматов

#### Клиентская оптимизация
- **Файл**: `client/src/utils/imageOptimization.js`
- **Функции**:
  - Генерация srcset для responsive изображений
  - Предзагрузка критических изображений
  - Создание placeholder изображений
  - Оптимизация для галереи и модальных окон

## 📊 Мониторинг производительности

### Web Vitals
- Отслеживание Core Web Vitals
- Логирование метрик производительности
- Анализ времени загрузки изображений

### Кэш-аналитика
- Отслеживание hit/miss ratio
- Мониторинг размера кэша
- Автоматическая очистка

## 🔧 Конфигурация

### Переменные окружения
```bash
# CDN
REACT_APP_CDN_URL=https://your-cdn-domain.com

# Оптимизация изображений
REACT_APP_IMAGE_QUALITY=85
REACT_APP_IMAGE_FORMAT=webp
REACT_APP_MAX_IMAGE_WIDTH=1920
REACT_APP_MAX_IMAGE_HEIGHT=1080

# Кэширование
REACT_APP_CACHE_TTL=300000
REACT_APP_ENABLE_CACHE=true

# Lazy Loading
REACT_APP_ENABLE_LAZY_LOADING=true
REACT_APP_ENABLE_PRELOADING=true
REACT_APP_CRITICAL_IMAGES_COUNT=3
```

### Серверные настройки
```javascript
// Кэширование API
app.use('/api/gallery', cacheMiddleware(5 * 60 * 1000));

// Rate limiting
app.use('/api/', rateLimitMiddleware);

// Кэширование статических файлов
app.use(staticCacheMiddleware);
```

## 📈 Результаты оптимизации

### Ожидаемые улучшения:
- **Время загрузки**: Сокращение на 40-60%
- **Размер изображений**: Уменьшение на 50-70%
- **Использование трафика**: Сокращение на 30-50%
- **Core Web Vitals**: Улучшение всех метрик

### Метрики производительности:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## 🛠 Установка и запуск

### 1. Установка зависимостей
```bash
# Клиентская часть
cd client
npm install react-lazy-load-image-component react-query

# Серверная часть
cd ..
npm install express-rate-limit redis multer sharp
```

### 2. Настройка переменных окружения
```bash
cp client/.env.example client/.env
# Отредактируйте .env файл
```

### 3. Запуск приложения
```bash
# Разработка
npm run dev

# Продакшн
npm run build
npm start
```

## 🔍 Отладка

### Проверка кэширования
```javascript
// В консоли браузера
import { cacheUtils } from './hooks/useCache';
console.log(cacheUtils.get('gallery-items'));
```

### Мониторинг загрузки изображений
```javascript
// В консоли браузера
import { performanceUtils } from './config/performance';
performanceUtils.measureImageLoad('image-url');
```

## 📚 Дополнительные ресурсы

- [Web Vitals](https://web.dev/vitals/)
- [Lazy Loading Images](https://web.dev/lazy-loading-images/)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Caching Strategies](https://web.dev/caching-strategies/)

## 🤝 Вклад в проект

При добавлении новых оптимизаций:
1. Обновите документацию
2. Добавьте тесты производительности
3. Проверьте совместимость с браузерами
4. Обновите конфигурацию 