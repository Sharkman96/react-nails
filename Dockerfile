# Multi-stage build для оптимизации
# Этап 1: Сборка клиентского приложения
FROM node:18-alpine AS client-builder

# Оптимизация памяти для React
ENV NODE_OPTIONS="--max-old-space-size=1024"
ENV GENERATE_SOURCEMAP=false
ENV CI=false

WORKDIR /app/client

# Копируем package.json и устанавливаем зависимости
COPY client/package*.json ./
RUN npm ci --legacy-peer-deps

# Копируем исходники и собираем
COPY client/ ./
RUN npm run build

# Этап 2: Подготовка production сервера
FROM node:18-alpine AS production

WORKDIR /app

# Копируем package.json сервера и устанавливаем зависимости
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Копируем серверные файлы
COPY . .

# Копируем собранное клиентское приложение
COPY --from=client-builder /app/client/build ./client/build

# Создаем пользователя без привилегий
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Меняем владельца файлов
RUN chown -R nextjs:nodejs /app
USER nextjs

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"] 