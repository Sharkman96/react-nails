const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const initAdmin = async () => {
  try {
    // Подключение к MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Подключение к MongoDB установлено');

    // Проверка существования админа
    const existingAdmin = await User.findOne({ username: process.env.ADMIN_USERNAME });
    
    if (existingAdmin) {
      console.log('Админ уже существует');
      process.exit(0);
    }

    // Создание нового админа
    const admin = new User({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('Админ успешно создан');
    console.log(`Логин: ${process.env.ADMIN_USERNAME}`);
    console.log(`Пароль: ${process.env.ADMIN_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error('Ошибка при создании админа:', error);
    process.exit(1);
  }
};

initAdmin(); 