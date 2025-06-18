// Конфигурация производительности

export const PERFORMANCE_CONFIG = {
  // CDN настройки
  cdn: {
    baseUrl: process.env.REACT_APP_CDN_URL || '',
    enabled: !!process.env.REACT_APP_CDN_URL
  },

  // Настройки оптимизации изображений
  images: {
    quality: parseInt(process.env.REACT_APP_IMAGE_QUALITY) || 85,
    format: process.env.REACT_APP_IMAGE_FORMAT || 'webp',
    maxWidth: parseInt(process.env.REACT_APP_MAX_IMAGE_WIDTH) || 1920,
    maxHeight: parseInt(process.env.REACT_APP_MAX_IMAGE_HEIGHT) || 1080,
    enableWebP: true,
    enableAVIF: false
  },

  // Настройки кэширования
  cache: {
    ttl: parseInt(process.env.REACT_APP_CACHE_TTL) || 300000, // 5 минут
    enabled: process.env.REACT_APP_ENABLE_CACHE !== 'false',
    maxSize: 50 * 1024 * 1024 // 50MB
  },

  // Настройки lazy loading
  lazyLoading: {
    enabled: process.env.REACT_APP_ENABLE_LAZY_LOADING !== 'false',
    threshold: 200,
    effect: 'blur',
    placeholder: true
  },

  // Настройки предзагрузки
  preloading: {
    enabled: process.env.REACT_APP_ENABLE_PRELOADING !== 'false',
    criticalImagesCount: parseInt(process.env.REACT_APP_CRITICAL_IMAGES_COUNT) || 3,
    prefetchOnHover: true
  },

  // Настройки сжатия
  compression: {
    enabled: true,
    gzip: true,
    brotli: false
  },

  // Настройки мониторинга производительности
  monitoring: {
    enabled: process.env.NODE_ENV === 'production',
    webVitals: true,
    imageLoadTimes: true,
    cacheHitRate: true
  }
};

// Утилиты для проверки поддержки браузера
export const browserSupport = {
  webp: () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  },

  avif: () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  },

  intersectionObserver: () => {
    return 'IntersectionObserver' in window;
  },

  serviceWorker: () => {
    return 'serviceWorker' in navigator;
  }
};

// Утилиты для мониторинга производительности
export const performanceUtils = {
  measureImageLoad: (src) => {
    return new Promise((resolve) => {
      const start = performance.now();
      const img = new Image();
      
      img.onload = () => {
        const end = performance.now();
        const loadTime = end - start;
        
        if (PERFORMANCE_CONFIG.monitoring.imageLoadTimes) {
          console.log(`Image loaded: ${src} in ${loadTime.toFixed(2)}ms`);
        }
        
        resolve({ loadTime, success: true });
      };
      
      img.onerror = () => {
        const end = performance.now();
        const loadTime = end - start;
        
        console.error(`Image failed to load: ${src} after ${loadTime.toFixed(2)}ms`);
        resolve({ loadTime, success: false });
      };
      
      img.src = src;
    });
  },

  measureCacheHit: (key, hit) => {
    if (PERFORMANCE_CONFIG.monitoring.cacheHitRate) {
      console.log(`Cache ${hit ? 'HIT' : 'MISS'} for key: ${key}`);
    }
  },

  logWebVitals: (metric) => {
    if (PERFORMANCE_CONFIG.monitoring.webVitals) {
      console.log(`Web Vital: ${metric.name} = ${metric.value}`);
    }
  }
};

export default PERFORMANCE_CONFIG; 