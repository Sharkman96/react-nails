# 🚂 Развертывание на Railway

## Подготовка проекта

Проект уже подготовлен для развертывания на Railway с конфигурациями:
- `railway.json` - настройки Railway
- `nixpacks.toml` - конфигурация сборки

## 🚀 Пошаговое развертывание

### 1. Создайте аккаунт на Railway
1. Зайдите на [railway.app](https://railway.app)
2. Нажмите **"Login"**
3. Войдите через GitHub

### 2. Создайте новый проект
1. Нажмите **"New Project"**
2. Выберите **"Deploy from GitHub repo"**
3. Выберите репозиторий **`Sharkman96/react-nails`**
4. Нажмите **"Deploy Now"**

### 3. Настройте переменные окружения
В разделе **Variables** добавьте:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://546312qwee:bs0vVxk4wmcChbM7@clusternails.xgrwbdc.mongodb.net/nailart_studio?retryWrites=true&w=majority&appName=ClusterNails
JWT_SECRET=railway-production-secret-key-stuttgartnails-2024
JWT_EXPIRE=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123!
ALLOWED_ORIGINS=https://stuttgartnails.de,https://react-nails-production.up.railway.app
```

⚠️ **ВАЖНО**: Обязательно измените `JWT_SECRET` на свой уникальный ключ!

### 4. Подключите домен stuttgartnails.de
1. В настройках проекта перейдите в **"Settings" → "Domains"**
2. Нажмите **"Custom Domain"**
3. Введите: `stuttgartnails.de`
4. Добавьте также: `www.stuttgartnails.de`

### 5. Настройте DNS у регистратора
Railway покажет DNS записи, обычно это:

```
Type: CNAME
Name: @
Value: [railway-provided-domain].railway.app

Type: CNAME
Name: www
Value: [railway-provided-domain].railway.app
```

## 📋 Особенности Railway

### Автоматические развертывания
- Railway автоматически пересобирает проект при push в GitHub
- Логи доступны в реальном времени
- Automatic HTTPS с Let's Encrypt

### Структура проекта для Railway
```
project/
├── server.js          # Backend API
├── package.json       # Зависимости сервера
├── railway.json       # Конфигурация Railway
├── nixpacks.toml      # Настройки сборки
└── client/            # React приложение
    ├── package.json   # Зависимости клиента
    └── build/         # Собранный React (создается автоматически)
```

## 🔧 Мониторинг и логи

### Просмотр логов
1. В панели Railway перейдите в **"Deployments"**
2. Нажмите на активное развертывание
3. Смотрите логи в реальном времени

### Метрики
- CPU и RAM использование
- Количество запросов
- Время ответа

## 📊 Проверка развертывания

### Основные URL для проверки:
- **Сайт**: `https://stuttgartnails.de`
- **API Health**: `https://stuttgartnails.de/api/health`
- **Админ панель**: `https://stuttgartnails.de/admin`
- **Услуги**: `https://stuttgartnails.de/api/services`

### Тестирование функций:
1. **Главная страница** - должна загружаться
2. **API endpoints** - проверить `/api/health`
3. **Админ панель** - вход с вашими credentials
4. **Галерея** - загрузка и отображение
5. **Услуги** - CRUD операции в админке

## 💰 Ценообразование Railway

### Hobby Plan (Рекомендуется)
- **$5/месяц** на проект
- 500 часов выполнения
- 1GB RAM
- 1GB диска
- Custom domains
- SSL сертификаты

### Developer Plan
- **$20/месяц**
- Unlimited usage
- Приоритетная поддержка

## 🛠 Команды Railway CLI (опционально)

### Установка
```bash
npm install -g @railway/cli
```

### Основные команды
```bash
railway login              # Вход в аккаунт
railway link               # Связать с проектом
railway status             # Статус проекта
railway logs               # Просмотр логов
railway shell              # Удаленная консоль
```

## 🔧 Решение проблем

### Если сборка не удается:
1. Проверьте логи сборки в Railway
2. Убедитесь, что Node.js версия 18+
3. Проверьте зависимости в package.json

### Если API не отвечает:
1. Проверьте переменные окружения
2. Убедитесь, что MongoDB доступна
3. Проверьте логи приложения

### Если статические файлы не загружаются:
1. Убедитесь, что React приложение собирается
2. Проверьте настройки Express для статических файлов

## 📱 Мобильная оптимизация

Railway автоматически:
- Включает HTTP/2
- Оптимизирует CDN
- Обеспечивает быструю загрузку

## 🔐 Безопасность

Railway предоставляет:
- Автоматические SSL сертификаты
- DDoS защита
- Изоляция контейнеров
- Шифрование переменных окружения

---

## 🎯 Итого процесс займет ~10-15 минут:

1. **2 минуты** - создание проекта в Railway
2. **3 минуты** - настройка переменных
3. **5-10 минут** - первая сборка и развертывание
4. **До 48 часов** - DNS propagation для домена

**Удачного развертывания! 🚂** 