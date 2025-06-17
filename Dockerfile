# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json файлы
COPY package*.json ./
COPY client/package*.json ./client/

# Устанавливаем зависимости сервера
RUN npm ci --only=production

# Устанавливаем зависимости клиента
WORKDIR /app/client
RUN npm ci

# Собираем React приложение
RUN npm run build

# Возвращаемся в корневую директорию
WORKDIR /app

# Копируем остальные файлы
COPY . .

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"] 