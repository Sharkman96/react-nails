const mongoose = require('mongoose');
const Service = require('../models/Service');
require('dotenv').config({ path: '../config.env' });

const services = [
  {
    key: 'manicure',
    name: {
      ru: 'Классический маникюр',
      de: 'Klassische Maniküre'
    },
    price: {
      ru: 'от 25',
      de: 'ab 25'
    },
    description: {
      ru: 'Профессиональный уход за ногтями и кутикулой с покрытием гель-лаком',
      de: 'Professionelle Nagel- und Nagelhautpflege mit Gel-Lack-Beschichtung'
    },
    icon: 'nail-polish',
    color: '#ff6b9d',
    order: 1,
    isActive: true
  },
  {
    key: 'pedicure',
    name: {
      ru: 'Педикюр',
      de: 'Pediküre'
    },
    price: {
      ru: 'от 35',
      de: 'ab 35'
    },
    description: {
      ru: 'Комплексный уход за ногами и ногтями на ногах',
      de: 'Umfassende Fuß- und Zehennagelpflege'
    },
    icon: 'foot',
    color: '#667eea',
    order: 2,
    isActive: true
  },
  {
    key: 'gel-polish',
    name: {
      ru: 'Гель-лак',
      de: 'Gel-Lack'
    },
    price: {
      ru: 'от 20',
      de: 'ab 20'
    },
    description: {
      ru: 'Долговечное покрытие ногтей, держится до 3 недель',
      de: 'Langanhaltende Nagelbeschichtung, hält bis zu 3 Wochen'
    },
    icon: 'brush',
    color: '#c44569',
    order: 3,
    isActive: true
  },
  {
    key: 'nail-extensions',
    name: {
      ru: 'Наращивание ногтей',
      de: 'Nagelverlängerung'
    },
    price: {
      ru: 'от 45',
      de: 'ab 45'
    },
    description: {
      ru: 'Наращивание ногтей гелем или акрилом любой длины и формы',
      de: 'Nagelverlängerung mit Gel oder Acryl in jeder Länge und Form'
    },
    icon: 'extension',
    color: '#764ba2',
    order: 4,
    isActive: true
  },
  {
    key: 'nail-design',
    name: {
      ru: 'Дизайн ногтей',
      de: 'Nageldesign'
    },
    price: {
      ru: 'от 5',
      de: 'ab 5'
    },
    description: {
      ru: 'Художественное оформление ногтей, рисунки, стразы, наклейки',
      de: 'Künstlerische Nagelgestaltung, Zeichnungen, Strasssteine, Aufkleber'
    },
    icon: 'palette',
    color: '#f093fb',
    order: 5,
    isActive: true
  }
];

async function seedServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartnails');
    console.log('Connected to MongoDB');

    // Очищаем существующие услуги
    await Service.deleteMany({});
    console.log('Cleared existing services');

    // Добавляем новые услуги
    await Service.insertMany(services);
    console.log('Services seeded successfully');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
}

seedServices(); 