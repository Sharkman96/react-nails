const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Генерация JWT токена
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Вход в систему
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Пожалуйста, предоставьте имя пользователя и пароль' });
    }

    // Поиск пользователя
    const user = await User.findOne({ username, isActive: true });
    if (!user) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    // Проверка пароля
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    // Генерация токена
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Проверка токена
const verifyToken = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  login,
  verifyToken
}; 