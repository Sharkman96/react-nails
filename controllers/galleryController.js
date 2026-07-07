const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'gallery.json');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'gallery');

// Чтение данных из JSON файла
const readGallery = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading gallery file:', error);
    return [];
  }
};

// Запись данных в JSON файл
const writeGallery = async (gallery) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(gallery, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing gallery file:', error);
    return false;
  }
};

// Генерация уникального ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Получить все элементы галереи (публичный API)
const getAllGalleryItems = async (req, res) => {
  try {
    const items = await readGallery();
    const activeItems = items
      .filter(item => item.isActive)
      .sort((a, b) => a.order - b.order);
    res.json(activeItems);
  } catch (error) {
    console.error('Get gallery items error:', error);
    res.status(500).json({ message: 'Ошибка при получении галереи' });
  }
};

// Получить все элементы галереи для админки
const getAllGalleryItemsAdmin = async (req, res) => {
  try {
    const items = await readGallery();
    const sortedItems = items.sort((a, b) => a.order - b.order);
    res.json(sortedItems);
  } catch (error) {
    console.error('Get gallery items admin error:', error);
    res.status(500).json({ message: 'Ошибка при получении галереи' });
  }
};

// Создать новый элемент галереи
const createGalleryItem = async (req, res) => {
  try {
    const items = await readGallery();
    const itemData = { ...req.body };
    
    // Генерируем ID
    itemData.id = generateId();
    itemData._id = itemData.id; // Для совместимости с фронтендом
    
    // Если загружен файл, добавляем путь к изображению
    if (req.file) {
      itemData.imageUrl = `/images/gallery/${req.file.filename}`;
    }
    
    // Устанавливаем порядок
    if (!itemData.order) {
      const maxOrder = items.reduce((max, i) => Math.max(max, i.order || 0), 0);
      itemData.order = maxOrder + 1;
    }
    
    // Устанавливаем isActive по умолчанию
    if (itemData.isActive === undefined) {
      itemData.isActive = true;
    }
    
    // Устанавливаем цвет по умолчанию
    if (!itemData.color) {
      itemData.color = '#ff6b9d';
    }
    
    items.push(itemData);
    await writeGallery(items);
    
    res.status(201).json(itemData);
  } catch (error) {
    console.error('Create gallery item error:', error);
    res.status(500).json({ message: 'Ошибка при создании элемента галереи' });
  }
};

// Обновить элемент галереи
const updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await readGallery();
    const updateData = { ...req.body };
    
    const index = items.findIndex(i => i.id === id || i._id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Элемент галереи не найден' });
    }
    
    // Если загружен новый файл
    if (req.file) {
      // Удаляем старый файл если он существует
      const oldItem = items[index];
      if (oldItem.imageUrl && oldItem.imageUrl.startsWith('/images/gallery/')) {
        try {
          const oldFilePath = path.join(__dirname, '..', 'public', oldItem.imageUrl);
          await fs.unlink(oldFilePath);
        } catch (error) {
          console.error('Error deleting old file:', error);
        }
      }
      
      updateData.imageUrl = `/images/gallery/${req.file.filename}`;
    }
    
    items[index] = { ...items[index], ...updateData };
    await writeGallery(items);
    
    res.json(items[index]);
  } catch (error) {
    console.error('Update gallery item error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении элемента галереи' });
  }
};

// Удалить элемент галереи
const deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await readGallery();
    
    const index = items.findIndex(i => i.id === id || i._id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Элемент галереи не найден' });
    }
    
    const item = items[index];
    
    // Удаляем файл изображения, если он существует
    if (item.imageUrl && item.imageUrl.startsWith('/images/gallery/')) {
      try {
        const filePath = path.join(__dirname, '..', 'public', item.imageUrl);
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    
    items.splice(index, 1);
    await writeGallery(items);
    
    res.json({ message: 'Элемент галереи успешно удален' });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    res.status(500).json({ message: 'Ошибка при удалении элемента галереи' });
  }
};

// Загрузить изображение
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }
    
    const imageUrl = `/images/gallery/${req.file.filename}`;
    res.json({ 
      success: true, 
      imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Ошибка при загрузке изображения' });
  }
};

module.exports = {
  getAllGalleryItems,
  getAllGalleryItemsAdmin,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadImage
};
