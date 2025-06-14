const GalleryItem = require('../models/GalleryItem');
const fs = require('fs').promises;
const path = require('path');

// Получить все элементы галереи
const getAllGalleryItems = async (req, res) => {
  try {
    const items = await GalleryItem.find({ isActive: true }).sort({ order: 1 });
    res.json(items);
  } catch (error) {
    console.error('Get gallery items error:', error);
    res.status(500).json({ message: 'Ошибка при получении галереи' });
  }
};

// Получить все элементы галереи для админки
const getAllGalleryItemsAdmin = async (req, res) => {
  try {
    const items = await GalleryItem.find().sort({ order: 1 });
    res.json(items);
  } catch (error) {
    console.error('Get gallery items admin error:', error);
    res.status(500).json({ message: 'Ошибка при получении галереи' });
  }
};

// Создать новый элемент галереи
const createGalleryItem = async (req, res) => {
  try {
    const itemData = { ...req.body };
    
    // Если загружен файл, добавляем путь к изображению
    if (req.file) {
      itemData.imageUrl = `/uploads/gallery/${req.file.filename}`;
    }
    
    const item = new GalleryItem(itemData);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Create gallery item error:', error);
    res.status(500).json({ message: 'Ошибка при создании элемента галереи' });
  }
};

// Обновить элемент галереи
const updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Если загружен новый файл
    if (req.file) {
      // Получаем старый элемент для удаления старого файла
      const oldItem = await GalleryItem.findById(id);
      if (oldItem && oldItem.imageUrl && oldItem.imageUrl.startsWith('/uploads/')) {
        try {
          const oldFilePath = path.join(__dirname, '..', oldItem.imageUrl);
          await fs.unlink(oldFilePath);
        } catch (error) {
          console.error('Error deleting old file:', error);
        }
      }
      
      updateData.imageUrl = `/uploads/gallery/${req.file.filename}`;
    }
    
    const item = await GalleryItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({ message: 'Элемент галереи не найден' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Update gallery item error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении элемента галереи' });
  }
};

// Удалить элемент галереи
const deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await GalleryItem.findById(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Элемент галереи не найден' });
    }
    
    // Удаляем файл изображения, если он существует
    if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
      try {
        const filePath = path.join(__dirname, '..', item.imageUrl);
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    
    await GalleryItem.findByIdAndDelete(id);
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
    
    const imageUrl = `/uploads/gallery/${req.file.filename}`;
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