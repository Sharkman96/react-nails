const express = require('express');
const router = express.Router();
const { generateCSRFTokenMiddleware } = require('../middleware/security');
const { logger } = require('../middleware/logger');

// Маршрут для получения CSRF токена
router.get('/csrf-token', generateCSRFTokenMiddleware, (req, res) => {
  try {
    const token = res.locals.csrfToken;
    
    logger.info('CSRF token generated', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      token: token,
      expiresIn: '24h'
    });
  } catch (error) {
    logger.error('Error generating CSRF token', {
      error: error.message,
      ip: req.ip
    });

    res.status(500).json({
      error: 'Failed to generate CSRF token',
      code: 'CSRF_GENERATION_ERROR'
    });
  }
});

module.exports = router; 