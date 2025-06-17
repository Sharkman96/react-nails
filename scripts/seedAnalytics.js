const mongoose = require('mongoose');
const PageView = require('../models/PageView');
const ButtonClick = require('../models/ButtonClick');
require('dotenv').config({ path: './config.env' });

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedAnalytics() {
  try {
    console.log('🌱 Добавление тестовых данных аналитики...');

    // Очистка существующих данных
    await PageView.deleteMany({});
    await ButtonClick.deleteMany({});

    // Создание тестовых данных просмотров за последние 7 дней
    const now = new Date();
    const pageViews = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const viewsCount = Math.floor(Math.random() * 50) + 10; // 10-60 просмотров в день
      
      for (let j = 0; j < viewsCount; j++) {
        const randomTime = new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        pageViews.push({
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          page: Math.random() > 0.5 ? '/' : '/services',
          country: ['Germany', 'Russia', 'Ukraine', 'Poland'][Math.floor(Math.random() * 4)],
          city: ['Berlin', 'Moscow', 'Kiev', 'Warsaw'][Math.floor(Math.random() * 4)],
          referrer: '',
          language: 'ru',
          timestamp: randomTime
        });
      }
    }

    await PageView.insertMany(pageViews);
    console.log(`✅ Добавлено ${pageViews.length} просмотров страниц`);

    // Создание тестовых данных кликов по кнопкам
    const buttonClicks = [
      {
        buttonType: 'whatsapp',
        count: Math.floor(Math.random() * 30) + 5, // 5-35 кликов
        lastClicked: new Date()
      },
      {
        buttonType: 'instagram', 
        count: Math.floor(Math.random() * 20) + 3, // 3-23 клика
        lastClicked: new Date()
      },
      {
        buttonType: 'phone',
        count: Math.floor(Math.random() * 10) + 1, // 1-11 кликов
        lastClicked: new Date()
      }
    ];

    await ButtonClick.insertMany(buttonClicks);
    console.log('✅ Добавлены тестовые данные кликов по кнопкам');

    console.log('🎉 Тестовые данные аналитики успешно добавлены!');
    
  } catch (error) {
    console.error('❌ Ошибка при добавлении тестовых данных:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedAnalytics(); 