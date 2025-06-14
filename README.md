# Nail Master Website

Профессиональный сайт для nail-мастера с многоязычной поддержкой, админ панелью и аналитикой.

## 🚀 Функции

- 🌍 Многоязычность (Русский/Немецкий)
- 📊 Аналитика и статистика
- 🖼️ Галерея работ с загрузкой файлов
- 💼 Управление услугами
- 🔐 Админ панель с JWT авторизацией
- 📱 Адаптивный дизайн
- 🎯 SEO оптимизация

## 🛠️ Технологии

- **Frontend**: React, Framer Motion, i18next
- **Backend**: Node.js, Express
- **База данных**: MongoDB
- **Аутентификация**: JWT
- **Загрузка файлов**: Multer
- **Аналитика**: GeoIP

## 📦 Установка

```bash
# Клонировать репозиторий
git clone <your-repo-url>
cd react-nails

# Установить зависимости
npm install
cd client && npm install && cd ..

# Создать файл .env
cp env.example .env
# Отредактировать .env с вашими данными

# Запустить в режиме разработки
npm run dev
```

## 🌐 Деплой

### Вариант 1: Vercel (Рекомендуется)

1. **Подготовка:**
   ```bash
   # Создайте репозиторий на GitHub
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Деплой на Vercel:**
   - Зайдите на [vercel.com](https://vercel.com)
   - Подключите ваш GitHub репозиторий
   - Настройте переменные окружения:
     ```
     MONGODB_URI=your-mongodb-connection-string
     JWT_SECRET=your-secret-key
     NODE_ENV=production
     ```
   - Нажмите Deploy

### Вариант 2: Railway

1. **Подготовка:**
   - Создайте аккаунт на [railway.app](https://railway.app)
   - Подключите GitHub репозиторий

2. **Настройка:**
   - Добавьте переменные окружения в Railway Dashboard
   - Railway автоматически определит Node.js проект

### Вариант 3: Render

1. **Подготовка:**
   - Создайте аккаунт на [render.com](https://render.com)
   - Подключите GitHub репозиторий

2. **Настройка:**
   - Выберите "Web Service"
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

## 🔧 Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nailart_studio

# JWT Secret (сгенерируйте случайную строку)
JWT_SECRET=your-super-secret-jwt-key-here

# Port
PORT=5000

# Environment
NODE_ENV=production
```

## 📊 Настройка MongoDB

1. **MongoDB Atlas:**
   - Создайте кластер на [mongodb.com](https://mongodb.com)
   - Получите connection string
   - Добавьте в переменные окружения

2. **Инициализация админа:**
   ```bash
   npm run init-admin
   ```

## 🎨 Кастомизация

### Изменение цветов и стилей:
- `client/src/components/*.css` - стили компонентов
- `client/src/App.css` - глобальные стили

### Добавление языков:
- `client/src/locales/` - файлы переводов
- `client/src/i18n.js` - конфигурация i18n

### Изменение контента:
- Админ панель: `/admin`
- Логин: создается через `npm run init-admin`

## 📱 Доступ

- **Основной сайт**: `https://your-domain.com`
- **Админ панель**: `https://your-domain.com/admin`

## 🔒 Безопасность

- JWT токены для авторизации
- Хеширование паролей (bcrypt)
- Защита от XSS (helmet)
- CORS настройки
- Валидация загружаемых файлов

## 📈 Аналитика

Система отслеживает:
- Просмотры страниц
- Клики по кнопкам (WhatsApp, Instagram, телефон)
- Геолокацию посетителей
- Уникальных посетителей
- Популярные страницы

## 🛠️ Разработка

```bash
# Запуск сервера разработки
npm run server

# Запуск клиента разработки
npm run client

# Запуск всего проекта
npm run dev

# Сборка для продакшена
npm run build
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в консоли
2. Убедитесь, что все переменные окружения настроены
3. Проверьте подключение к MongoDB
4. Убедитесь, что порт 5000 свободен

## 📄 Лицензия

MIT License 