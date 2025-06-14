const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getAllServicesAdmin,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const auth = require('../middleware/auth');

// Публичные маршруты
router.get('/', getAllServices);

// Защищенные маршруты (требуют авторизации)
router.get('/admin', auth, getAllServicesAdmin);
router.post('/', auth, createService);
router.put('/:id', auth, updateService);
router.delete('/:id', auth, deleteService);

module.exports = router; 