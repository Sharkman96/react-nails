const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Конфигурация оптимизации изображений
const IMAGE_CONFIG = {
  formats: {
    webp: { quality: 85 },
    jpeg: { quality: 85 },
    avif: { quality: 80 }
  },
  sizes: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 }
  },
  maxFileSize: 5 * 1024 * 1024 // 5MB
};

// Middleware для обработки загруженных изображений
const optimizeUploadedImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    // Проверяем, что это изображение
    if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
      return next();
    }

    // Получаем метаданные изображения
    const metadata = await sharp(filePath).metadata();
    
    // Проверяем размер файла
    const stats = await fs.stat(filePath);
    if (stats.size > IMAGE_CONFIG.maxFileSize) {
      // Сжимаем изображение, если оно слишком большое
      await sharp(filePath)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(filePath + '.tmp');
      
      await fs.unlink(filePath);
      await fs.rename(filePath + '.tmp', filePath);
    }

    // Создаем WebP версию
    const webpPath = filePath.replace(fileExt, '.webp');
    await sharp(filePath)
      .webp(IMAGE_CONFIG.formats.webp)
      .toFile(webpPath);

    // Добавляем информацию об оптимизированных версиях
    req.file.optimized = {
      original: req.file.filename,
      webp: path.basename(webpPath),
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      }
    };

    next();
  } catch (error) {
    console.error('Error optimizing image:', error);
    next();
  }
};

// Middleware для обработки запросов изображений с параметрами
const imageResizeMiddleware = async (req, res, next) => {
  const { width, height, quality, format, fit } = req.query;
  
  if (!width && !height && !quality && !format) {
    return next();
  }

  try {
    const imagePath = path.join(__dirname, '..', 'uploads', req.params.filename);
    
    // Проверяем существование файла
    try {
      await fs.access(imagePath);
    } catch {
      return res.status(404).json({ error: 'Image not found' });
    }

    let sharpInstance = sharp(imagePath);

    // Применяем ресайзинг
    if (width || height) {
      const resizeOptions = {
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        fit: fit || 'cover',
        withoutEnlargement: true
      };
      sharpInstance = sharpInstance.resize(resizeOptions);
    }

    // Применяем формат и качество
    let outputFormat = format || 'jpeg';
    let outputOptions = {};

    switch (outputFormat.toLowerCase()) {
      case 'webp':
        outputOptions = { quality: quality ? parseInt(quality) : 85 };
        sharpInstance = sharpInstance.webp(outputOptions);
        break;
      case 'avif':
        outputOptions = { quality: quality ? parseInt(quality) : 80 };
        sharpInstance = sharpInstance.avif(outputOptions);
        break;
      case 'jpeg':
      case 'jpg':
        outputOptions = { quality: quality ? parseInt(quality) : 85 };
        sharpInstance = sharpInstance.jpeg(outputOptions);
        break;
      case 'png':
        outputOptions = { quality: quality ? parseInt(quality) : 85 };
        sharpInstance = sharpInstance.png(outputOptions);
        break;
      default:
        outputOptions = { quality: quality ? parseInt(quality) : 85 };
        sharpInstance = sharpInstance.jpeg(outputOptions);
    }

    // Устанавливаем заголовки
    res.setHeader('Content-Type', `image/${outputFormat}`);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 год

    // Отправляем оптимизированное изображение
    sharpInstance.pipe(res);

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
};

// Утилита для создания различных размеров изображения
const generateImageSizes = async (originalPath, filename) => {
  const sizes = {};
  const baseName = path.parse(filename).name;
  const ext = path.extname(filename);

  try {
    for (const [sizeName, dimensions] of Object.entries(IMAGE_CONFIG.sizes)) {
      const outputPath = path.join(
        path.dirname(originalPath),
        `${baseName}_${sizeName}${ext}`
      );

      await sharp(originalPath)
        .resize(dimensions.width, dimensions.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);

      sizes[sizeName] = path.basename(outputPath);
    }

    return sizes;
  } catch (error) {
    console.error('Error generating image sizes:', error);
    return {};
  }
};

// Утилита для создания WebP версии
const createWebPVersion = async (originalPath) => {
  try {
    const webpPath = originalPath.replace(/\.[^.]+$/, '.webp');
    await sharp(originalPath)
      .webp(IMAGE_CONFIG.formats.webp)
      .toFile(webpPath);
    
    return path.basename(webpPath);
  } catch (error) {
    console.error('Error creating WebP version:', error);
    return null;
  }
};

// Утилита для получения информации об изображении
const getImageInfo = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    const stats = await fs.stat(imagePath);
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats.size,
      hasAlpha: metadata.hasAlpha
    };
  } catch (error) {
    console.error('Error getting image info:', error);
    return null;
  }
};

module.exports = {
  optimizeUploadedImage,
  imageResizeMiddleware,
  generateImageSizes,
  createWebPVersion,
  getImageInfo,
  IMAGE_CONFIG
}; 