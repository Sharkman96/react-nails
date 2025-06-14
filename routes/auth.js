const express = require('express');
const router = express.Router();
const { login, verifyToken } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Вход в систему
router.post('/login', login);

// Проверка токена
router.get('/verify', auth, verifyToken);

module.exports = router; 