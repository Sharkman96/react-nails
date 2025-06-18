// Утилиты для оптимизации изображений

// CDN конфигурация
const CDN_CONFIG = {
  baseUrl: process.env.REACT_APP_CDN_URL || '',
  imageOptimization: {
    quality: 85,
    format: 'webp',
    maxWidth: 1920,
    maxHeight: 1080
  }
};

// Определяем поддержку WebP
const supportsWebP = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
};

// Генерируем оптимизированный URL изображения
export const getOptimizedImageUrl = (originalUrl, options = {}) => {
  if (!originalUrl) return '';
  
  const {
    width,
    height,
    quality = CDN_CONFIG.imageOptimization.quality,
    format = supportsWebP() ? 'webp' : 'jpeg',
    fit = 'cover'
  } = options;

  // Если используется CDN
  if (CDN_CONFIG.baseUrl && originalUrl.startsWith('/uploads/')) {
    const params = new URLSearchParams();
    
    if (width) params.append('w', width);
    if (height) params.append('h', height);
    if (quality) params.append('q', quality);
    if (format) params.append('f', format);
    if (fit) params.append('fit', fit);
    
    return `${CDN_CONFIG.baseUrl}${originalUrl}?${params.toString()}`;
  }

  return originalUrl;
};

// Создаем srcset для responsive изображений
export const generateSrcSet = (originalUrl, sizes = [320, 640, 960, 1280, 1920]) => {
  if (!originalUrl) return '';
  
  return sizes
    .map(size => `${getOptimizedImageUrl(originalUrl, { width: size })} ${size}w`)
    .join(', ');
};

// Создаем sizes атрибут для responsive изображений
export const generateSizes = (breakpoints = {
  mobile: '100vw',
  tablet: '50vw',
  desktop: '33vw'
}) => {
  return Object.entries(breakpoints)
    .map(([device, size]) => {
      switch (device) {
        case 'mobile':
          return `(max-width: 768px) ${size}`;
        case 'tablet':
          return `(min-width: 769px) and (max-width: 1024px) ${size}`;
        case 'desktop':
          return `(min-width: 1025px) ${size}`;
        default:
          return size;
      }
    })
    .join(', ');
};

// Предзагрузка изображений
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Предзагрузка критических изображений
export const preloadCriticalImages = (imageUrls) => {
  const promises = imageUrls.map(url => preloadImage(url));
  return Promise.allSettled(promises);
};

// Создаем placeholder для изображения
export const createImagePlaceholder = (width, height, color = '#f0f0f0') => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Градиентный фон
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, adjustBrightness(color, -20));
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
};

// Утилита для изменения яркости цвета
const adjustBrightness = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

// Оптимизация изображений для галереи
export const optimizeGalleryImage = (imageUrl, index) => {
  const isFirstImage = index === 0;
  
  return {
    src: getOptimizedImageUrl(imageUrl, {
      width: isFirstImage ? 800 : 400,
      quality: isFirstImage ? 90 : 80
    }),
    srcSet: generateSrcSet(imageUrl, isFirstImage ? [400, 800, 1200] : [200, 400, 600]),
    sizes: isFirstImage ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw',
    loading: isFirstImage ? 'eager' : 'lazy'
  };
};

// Оптимизация изображений для модального окна
export const optimizeModalImage = (imageUrl) => {
  return {
    src: getOptimizedImageUrl(imageUrl, {
      width: 1200,
      quality: 95
    }),
    srcSet: generateSrcSet(imageUrl, [600, 900, 1200, 1600]),
    sizes: '(max-width: 768px) 95vw, (max-width: 1024px) 80vw, 70vw'
  };
};

// Утилита для определения размера изображения
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      });
    };
    img.onerror = reject;
    img.src = url;
  });
};

// Утилита для проверки поддержки AVIF
export const supportsAVIF = () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}; 