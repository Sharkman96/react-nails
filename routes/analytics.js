const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics');
const auth = require('../middleware/auth');

// Публичные маршруты (для отслеживания)
router.post('/click', analyticsController.trackButtonClick);
router.post('/pageview', analyticsController.trackPageView);

// Защищенные маршруты (только для админа)
router.get('/clicks', auth, analyticsController.getButtonClicks);
router.post('/reset', auth, analyticsController.resetButtonClicks);
router.post('/reset-all', auth, analyticsController.resetAllStats);
router.get('/stats', auth, analyticsController.getStats);

module.exports = router; 