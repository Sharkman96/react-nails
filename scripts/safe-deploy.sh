#!/bin/bash

# Безопасный скрипт развертывания React Nails
# Включает проверки, бэкапы и откат при ошибках

set -e  # Остановить при первой ошибке

echo "🔄 Начинаю безопасное обновление React Nails..."

# Проверка что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден. Убедитесь что вы находитесь в корневой директории проекта."
    exit 1
fi

# Проверка что нет незакоммиченных изменений
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Есть незакоммиченные изменения на сервере!"
    echo "Следующие файлы изменены:"
    git status --porcelain
    echo ""
    echo "Варианты действий:"
    echo "1. Зафиксировать изменения: git add . && git commit -m 'Серверные изменения'"
    echo "2. Отменить изменения: git checkout ."
    echo "3. Сохранить во временную ветку: git stash"
    exit 1
fi

# Получение информации о текущем состоянии
CURRENT_COMMIT=$(git rev-parse HEAD)
CURRENT_DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="../backup-$CURRENT_DATE"

echo "📋 Информация о текущем состоянии:"
echo "   Текущий коммит: $CURRENT_COMMIT"
echo "   Дата бэкапа: $CURRENT_DATE"
echo "   Директория бэкапа: $BACKUP_DIR"

# Проверка доступности удаленного репозитория
echo "🌐 Проверка подключения к GitHub..."
git fetch origin
if [ $? -ne 0 ]; then
    echo "❌ Не удается подключиться к удаленному репозиторию!"
    exit 1
fi

# Проверка есть ли обновления
REMOTE_COMMIT=$(git rev-parse origin/master)
if [ "$CURRENT_COMMIT" = "$REMOTE_COMMIT" ]; then
    echo "✅ Проект уже обновлен до последней версии!"
    echo "   Текущий коммит: $CURRENT_COMMIT"
    exit 0
fi

echo "📥 Найдены новые изменения:"
git log --oneline $CURRENT_COMMIT..$REMOTE_COMMIT

# Создание полного бэкапа
echo "💾 Создание полного бэкапа..."
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR/"
echo "   Бэкап создан: $BACKUP_DIR"

# Создание бэкапа важных файлов
echo "🔒 Создание бэкапа важных конфигурационных файлов..."
if [ -f "config.env" ]; then
    cp config.env config.env.backup-$CURRENT_DATE
    echo "   Создан бэкап: config.env.backup-$CURRENT_DATE"
fi

if [ -d "uploads" ]; then
    cp -r uploads uploads.backup-$CURRENT_DATE
    echo "   Создан бэкап: uploads.backup-$CURRENT_DATE"
fi

# Остановка приложения
echo "⏹️  Остановка приложения..."
pm2 stop react-nails || echo "   Приложение не было запущено"

# Функция отката
rollback() {
    echo "🔄 Выполняю откат к предыдущей версии..."
    git reset --hard $CURRENT_COMMIT
    
    if [ -f "config.env.backup-$CURRENT_DATE" ]; then
        cp "config.env.backup-$CURRENT_DATE" config.env
        echo "   Восстановлен config.env"
    fi
    
    echo "▶️  Запуск приложения после отката..."
    pm2 start server.js --name "react-nails" --env production
    
    echo "❌ Откат выполнен. Приложение запущено на предыдущей версии."
    exit 1
}

# Установка ловушки для отката при ошибке
trap rollback ERR

# Обновление кода
echo "📥 Обновление кода из GitHub..."
git pull origin master

# Проверка что package.json изменился
if git diff --name-only $CURRENT_COMMIT HEAD | grep -q "package.json\|client/package.json"; then
    echo "📦 Обнаружены изменения в зависимостях, обновляю..."
    
    # Установка серверных зависимостей
    echo "   Установка серверных зависимостей..."
    npm install --only=production
    
    # Установка клиентских зависимостей
    echo "   Установка клиентских зависимостей..."
    cd client
    npm install
    cd ..
else
    echo "📦 Зависимости не изменились, пропускаю установку"
fi

# Сборка клиентского приложения
echo "🏗️  Сборка клиентского приложения..."
cd client
GENERATE_SOURCEMAP=false REACT_APP_ENV=production npm run build
if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки клиентского приложения!"
    cd ..
    rollback
fi
cd ..

# Восстановление важных файлов если они были затерты
if [ -f "config.env.backup-$CURRENT_DATE" ] && [ ! -f "config.env" ]; then
    echo "🔧 Восстановление config.env..."
    cp "config.env.backup-$CURRENT_DATE" config.env
fi

# Проверка что config.env существует
if [ ! -f "config.env" ]; then
    echo "❌ Файл config.env не найден!"
    echo "Создайте его на основе env.example:"
    echo "cp env.example config.env"
    rollback
fi

# Создание/обновление администратора
echo "👤 Проверка администратора..."
npm run init-admin

# Тестовый запуск (проверка что приложение запускается)
echo "🧪 Тестовый запуск приложения..."
timeout 10s node server.js &
TEST_PID=$!
sleep 5

if kill -0 $TEST_PID 2>/dev/null; then
    echo "   ✅ Приложение запускается корректно"
    kill $TEST_PID
    wait $TEST_PID 2>/dev/null || true
else
    echo "   ❌ Приложение не запускается!"
    rollback
fi

# Запуск приложения через PM2
echo "▶️  Запуск приложения..."
pm2 start server.js --name "react-nails" --env production

# Проверка что приложение запустилось
sleep 3
if pm2 list | grep -q "react-nails.*online"; then
    echo "   ✅ Приложение успешно запущено через PM2"
else
    echo "   ❌ Ошибка запуска через PM2"
    pm2 logs react-nails --lines 10
    rollback
fi

# Сохранение конфигурации PM2
pm2 save

# Очистка старых бэкапов (оставляем только последние 5)
echo "🧹 Очистка старых бэкапов..."
ls -dt ../backup-* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true
ls -t config.env.backup-* 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
ls -dt uploads.backup-* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true

# Отключение ловушки
trap - ERR

echo ""
echo "✅ Безопасное обновление завершено успешно!"
echo "📊 Статус приложения:"
pm2 status react-nails
echo ""
echo "🔗 Приложение доступно по адресу: http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip')"
echo ""
echo "📝 Информация о развертывании:"
echo "   Предыдущий коммит: $CURRENT_COMMIT"
echo "   Текущий коммит: $(git rev-parse HEAD)"
echo "   Бэкап создан: $BACKUP_DIR"
echo ""
echo "🆘 В случае проблем для отката выполните:"
echo "   git reset --hard $CURRENT_COMMIT"
echo "   cp config.env.backup-$CURRENT_DATE config.env"
echo "   pm2 restart react-nails" 