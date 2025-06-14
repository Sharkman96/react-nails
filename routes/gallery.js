const express = require('express');
const router = express.Router();
const {
  getAllGalleryItems,
  getAllGalleryItemsAdmin,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadImage
} = require('../controllers/galleryController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Публичные маршруты
router.get('/', getAllGalleryItems);

// Защищенные маршруты (требуют авторизации)
router.get('/admin', auth, getAllGalleryItemsAdmin);
router.post('/', auth, upload.single('image'), createGalleryItem);
router.put('/:id', auth, upload.single('image'), updateGalleryItem);
router.delete('/:id', auth, deleteGalleryItem);

// Маршрут для загрузки изображения
router.post('/upload', auth, upload.single('image'), uploadImage);

module.exports = router; 