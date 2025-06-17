# Руководство по развертыванию на Vercel

## Подготовка проекта

Проект уже подготовлен для развертывания на Vercel с следующими конфигурациями:

### 1. Созданные файлы конфигурации:
- `vercel.json` - основная конфигурация для Vercel
- Обновлен `package.json` с скриптом `vercel-build`

### 2. Архитектура проекта:
- **Frontend**: React приложение в папке `client/`
- **Backend**: Express.js API в корне проекта (`server.js`)
- **База данных**: MongoDB Atlas (уже настроена)

## Пошаговое развертывание

### Шаг 1: Подготовка к развертыванию

1. **Убедитесь, что все изменения сохранены**:
   ```bash
   git add .
   git commit -m "Подготовка к развертыванию на Vercel"
   git push origin main
   ```

### Шаг 2: Установка Vercel CLI (опционально)

```bash
npm install -g vercel
```

### Шаг 3: Развертывание через веб-интерфейс Vercel

1. **Зайдите на [vercel.com](https://vercel.com)**
2. **Создайте аккаунт или войдите**
3. **Нажмите "New Project"**
4. **Подключите GitHub репозиторий**
5. **Выберите ваш репозиторий `react-nails`**

### Шаг 4: Настройка переменных окружения

В панели управления Vercel добавьте следующие переменные окружения:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://546312qwee:bs0vVxk4wmcChbM7@clusternails.xgrwbdc.mongodb.net/nailart_studio?retryWrites=true&w=majority&appName=ClusterNails
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-vercel
JWT_EXPIRE=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123!
ALLOWED_ORIGINS=https://stuttgartnails.de,https://www.stuttgartnails.de
```

⚠️ **ВАЖНО**: Обязательно измените `JWT_SECRET` на новый уникальный ключ для продакшена!

### Шаг 5: Настройка домена stuttgartnails.de

1. **В панели Vercel перейдите в раздел "Domains"**
2. **Добавьте домен**: `stuttgartnails.de`
3. **Добавьте также**: `www.stuttgartnails.de`
4. **Vercel покажет DNS записи, которые нужно добавить**

### Шаг 6: Настройка DNS у регистратора домена

Добавьте следующие DNS записи у вашего регистратора домена:

```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

**Или используйте CNAME для обоих**:
```
Type: CNAME
Name: @
Value: alias.vercel-dns.com

Type: CNAME
Name: www  
Value: alias.vercel-dns.com
```

### Шаг 7: Настройка SSL сертификата

Vercel автоматически создаст SSL сертификат для вашего домена. Это может занять несколько минут.

## Особенности конфигурации

### vercel.json объяснение:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",  // Сборка React приложения
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    },
    {
      "src": "server.js",            // Сборка API
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server.js" },        // API роуты
    { "src": "/sitemap.xml", "dest": "/server.js" },     // Sitemap
    { "src": "/robots.txt", "dest": "/server.js" },      // Robots.txt
    { "src": "/(.*)", "dest": "/client/build/$1" }       // Статические файлы
  ]
}
```

## Проверка развертывания

### 1. Проверьте основные страницы:
- `https://stuttgartnails.de` - главная страница
- `https://stuttgartnails.de/services` - услуги
- `https://stuttgartnails.de/gallery` - галерея
- `https://stuttgartnails.de/contact` - контакты

### 2. Проверьте API:
- `https://stuttgartnails.de/api/health` - статус API
- `https://stuttgartnails.de/api/services` - список услуг

### 3. Проверьте админ панель:
- `https://stuttgartnails.de/admin` - вход в админ панель

## Мониторинг и логи

1. **В панели Vercel перейдите в "Functions"** для просмотра логов API
2. **Используйте "Analytics"** для мониторинга производительности
3. **Настройте уведомления** для отслеживания ошибок

## Дополнительные настройки

### Настройка редиректов (опционально):

Добавьте в `vercel.json` для принудительного HTTPS:

```json
{
  "redirects": [
    {
      "source": "http://stuttgartnails.de/(.*)",
      "destination": "https://stuttgartnails.de/$1",
      "permanent": true
    },
    {
      "source": "http://www.stuttgartnails.de/(.*)", 
      "destination": "https://www.stuttgartnails.de/$1",
      "permanent": true
    }
  ]
}
```

### Настройка кеширования:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=300, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

## Решение проблем

### Если сайт не открывается:
1. Проверьте DNS записи (может занять до 48 часов)
2. Убедитесь, что SSL сертификат создан
3. Проверьте логи в панели Vercel

### Если API не работает:
1. Проверьте переменные окружения
2. Убедитесь, что MongoDB доступна
3. Проверьте логи функций в Vercel

### Если админ панель не работает:
1. Проверьте правильность ADMIN_USERNAME и ADMIN_PASSWORD
2. Убедитесь, что JWT_SECRET настроен правильно

## Команды для локального тестирования

```bash
# Установка зависимостей
npm install
npm run install-client

# Локальный запуск
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен версии
npm start
```

## Бэкапы и безопасность

1. **Регулярно создавайте бэкапы MongoDB**
2. **Используйте сильные пароли**
3. **Регулярно обновляйте зависимости**
4. **Мониторьте логи безопасности**

---

## Контакты для поддержки

Если возникнут проблемы, проверьте:
1. Логи в панели Vercel
2. Статус MongoDB Atlas
3. DNS записи у регистратора домена

**Удачного развертывания! 🚀** 