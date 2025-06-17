# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем все файлы сначала
COPY . .

# Устанавливаем зависимости сервера (без postinstall)
RUN npm ci --only=production --ignore-scripts

# Переходим в клиентскую папку и устанавливаем зависимости
WORKDIR /app/client
RUN npm ci

# Собираем React приложение
RUN npm run build

# Возвращаемся в корневую директорию
WORKDIR /app

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"] 