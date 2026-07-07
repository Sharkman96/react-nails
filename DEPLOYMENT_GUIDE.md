# 🚀 Инструкция по деплою и обновлению проекта React Nails

## Оглавление
1. [Подготовка локального окружения](#подготовка-локального-окружения)
2. [Настройка .gitignore](#настройка-gitignore)
3. [Работа с Git и GitHub](#работа-с-git-и-github)
4. [Обновление проекта на сервере](#обновление-проекта-на-сервере)
5. [Файлы конфигурации сервера](#файлы-конфигурации-сервера)
6. [Автоматизация деплоя](#автоматизация-деплоя)

## Подготовка локального окружения

### 1. Клонирование проекта
```bash
git clone https://github.com/your-username/react-nails.git
cd react-nails
```

### 2. Установка зависимостей
```bash
# Серверные зависимости
npm install

# Клиентские зависимости
cd client
npm install
cd ..
```

### 3. Настройка окружения
Создайте файл `config.env` на основе `env.example`:
```bash
cp env.example config.env
```

⚠️ **ВАЖНО**: Файл `config.env` содержит секретные данные и НЕ должен попадать в Git!

## Настройка .gitignore

### Основные файлы для исключения

Ваш `.gitignore` уже настроен правильно, но проверьте что в нём есть:

```gitignore
# Конфигурационные файлы с секретами
config.env
.env
.env.local
.env.production.local

# Логи и временные файлы
logs/
*.log
uploads/
tmp/

# Системные файлы
.DS_Store
Thumbs.db
.vscode/
.idea/

# Файлы сборки
client/build/
node_modules/
```

### Добавление новых исключений

Если нужно добавить новые файлы в исключения:

```bash
# Добавить файл в .gitignore
echo "новый_файл.txt" >> .gitignore

# Если файл уже был добавлен в Git, удалить его из отслеживания
git rm --cached новый_файл.txt

# Зафиксировать изменения
git add .gitignore
git commit -m "Добавлен новый_файл.txt в .gitignore"
```

## Работа с Git и GitHub

### Ежедневный workflow

1. **Перед началом работы** - получить последние изменения:
```bash
git pull origin master
```

2. **Внести изменения** в код

3. **Проверить изменения**:
```bash
git status
git diff
```

4. **Добавить изменения**:
```bash
# Добавить конкретные файлы
git add filename.js

# Или добавить все изменения (осторожно!)
git add .
```

5. **Зафиксировать изменения**:
```bash
git commit -m "Описание изменений"
```

6. **Отправить на GitHub**:
```bash
git push origin master
```

### Работа с ветками

```bash
# Создать новую ветку для функции
git checkout -b feature/новая-функция

# Переключиться на другую ветку
git checkout master

# Слить ветку в master
git merge feature/новая-функция

# Удалить ветку после слияния
git branch -d feature/новая-функция
```

## Обновление проекта на сервере

### Способ 1: Автоматический деплой (рекомендуется)

На сервере используйте готовый скрипт:

```bash
cd /path/to/your/project
./scripts/deploy.sh
```

### Способ 2: Ручное обновление

```bash
# 1. Перейти в директорию проекта
cd /path/to/your/project

# 2. Остановить приложение
pm2 stop react-nails

# 3. Получить последние изменения
git pull origin master

# 4. Установить новые зависимости (если есть)
npm install --only=production

# 5. Обновить клиентские зависимости и пересобрать
cd client
npm install
npm run build
cd ..

# 6. Перезапустить приложение
pm2 start server.js --name "react-nails"
pm2 save
```

### Способ 3: Безопасное обновление с проверкой

```bash
#!/bin/bash
# Создайте этот скрипт как safe-deploy.sh

echo "🔄 Начинаю безопасное обновление..."

# Проверка что нет незакоммиченных изменений
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Есть незакоммиченные изменения!"
    git status
    exit 1
fi

# Создание бэкапа
echo "💾 Создание бэкапа..."
cp -r . ../backup-$(date +%Y%m%d-%H%M%S)

# Обновление
git pull origin master
if [ $? -ne 0 ]; then
    echo "❌ Ошибка обновления из Git!"
    exit 1
fi

# Остальные шаги деплоя...
pm2 stop react-nails
npm install --only=production
cd client && npm install && npm run build && cd ..
pm2 start server.js --name "react-nails"

echo "✅ Обновление завершено!"
```

## Файлы конфигурации сервера

### Файлы, которые НЕ должны обновляться на сервере

Эти файлы содержат специфичные для сервера настройки:

1. **config.env** - секретные ключи и пароли
2. **uploads/** - загруженные пользователями файлы
3. **logs/** - логи приложения
4. **node_modules/** - зависимости (обновляются через npm install)

### Защита серверных файлов

```bash
# Создать резервную копию важных файлов
cp config.env config.env.backup
cp -r uploads uploads.backup

# Если случайно затерли config.env, восстановить
cp config.env.backup config.env
```

### Синхронизация конфигурации

Если нужно обновить конфигурацию на сервере:

1. **Обновите env.example** в репозитории с новыми параметрами
2. **На сервере** добавьте новые параметры в config.env:
```bash
# Сравнить файлы
diff env.example config.env

# Добавить недостающие параметры
echo "NEW_PARAMETER=value" >> config.env
```

## Автоматизация деплоя

### GitHub Actions (рекомендуется)

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Server

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/your/project
          ./scripts/deploy.sh
```

### Webhook деплой

Настройте webhook в GitHub, который будет вызывать деплой при пуше в master.

## Чек-лист перед деплоем

- [ ] Код протестирован локально
- [ ] Все изменения зафиксированы в Git
- [ ] Проверен .gitignore - секретные файлы не попадают в репозиторий
- [ ] Обновлен env.example если добавлены новые переменные
- [ ] Создан бэкап важных файлов на сервере
- [ ] Уведомлены пользователи о возможном кратковременном отключении

## Устранение проблем

### Если деплой не работает

1. **Проверить логи**:
```bash
pm2 logs react-nails
```

2. **Проверить статус**:
```bash
pm2 status
```

3. **Перезапустить с нуля**:
```bash
pm2 delete react-nails
pm2 start server.js --name "react-nails"
```

### Если конфигурация затерлась

1. **Восстановить из бэкапа**:
```bash
cp config.env.backup config.env
```

2. **Или пересоздать**:
```bash
cp env.example config.env
# Отредактировать config.env с правильными значениями
```

## Полезные команды

```bash
# Посмотреть текущий статус Git
git status

# Посмотреть последние коммиты
git log --oneline -10

# Отменить последний коммит (если не запушен)
git reset --soft HEAD~1

# Принудительно синхронизировать с удаленным репозиторием
git fetch origin
git reset --hard origin/master

# Проверить различия с удаленным репозиторием
git fetch origin
git diff HEAD origin/master
```

---

**Помните**: Всегда делайте бэкапы перед обновлением и тестируйте изменения на dev-сервере перед продакшном! 