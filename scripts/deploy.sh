#!/bin/bash

# Скрипт развертывания React Nails на продакшн сервере

echo "🚀 Начинаю развертывание React Nails..."

# Проверка что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден. Убедитесь что вы находитесь в корневой директории проекта."
    exit 1
fi

# Остановка приложения
echo "⏹️  Остановка приложения..."
pm2 stop react-nails || echo "Приложение не было запущено"

# Обновление кода
echo "📥 Обновление кода..."
git pull origin master

# Установка зависимостей сервера
echo "📦 Установка зависимостей сервера..."
npm install --only=production

# Установка зависимостей клиента и сборка
echo "🏗️  Сборка клиентского приложения..."
cd client
npm install
GENERATE_SOURCEMAP=false REACT_APP_ENV=production npm run build
cd ..

# Создание администратора (если нужно)
echo "👤 Проверка администратора..."
npm run init-admin

# Запуск приложения
echo "▶️  Запуск приложения..."
pm2 start server.js --name "react-nails" --env production

# Сохранение конфигурации PM2
pm2 save

echo "✅ Развертывание завершено!"
echo "🌐 Сайт доступен по адресу: http://$(curl -s ifconfig.me)"
echo "📊 Статус приложения:"
pm2 status 