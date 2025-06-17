# Простая сборка без многоэтапности для экономии ресурсов
FROM node:18-alpine

# Оптимизация памяти
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV GENERATE_SOURCEMAP=false
ENV CI=false

WORKDIR /app

# Копируем все файлы
COPY . .

# Устанавливаем зависимости сервера (без devDependencies)
RUN npm install --only=production --no-audit --no-fund

# Переходим в client и устанавливаем зависимости
WORKDIR /app/client
RUN npm install --no-audit --no-fund

# Собираем React приложение
RUN npm run build

# Возвращаемся в корень и очищаем кэш npm для экономии места
WORKDIR /app
RUN npm cache clean --force
RUN rm -rf client/node_modules
RUN rm -rf client/src

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"] 