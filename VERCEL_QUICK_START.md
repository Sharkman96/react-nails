# Быстрый старт развертывания на Vercel

## 🚀 Пошаговая инструкция (10 минут)

### 1. Загрузите код в GitHub (если еще не загружен)
```bash
git add .
git commit -m "Готов к развертыванию на Vercel"
git push origin main
```

### 2. Зайдите на [vercel.com](https://vercel.com)
- Войдите через GitHub
- Нажмите **"New Project"**
- Выберите репозиторий `react-nails`
- Нажмите **"Deploy"**

### 3. Добавьте переменные окружения
В панели Vercel → Settings → Environment Variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://546312qwee:bs0vVxk4wmcChbM7@clusternails.xgrwbdc.mongodb.net/nailart_studio?retryWrites=true&w=majority&appName=ClusterNails
JWT_SECRET=новый-уникальный-ключ-для-продакшена-vercel-2024
JWT_EXPIRE=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123!
ALLOWED_ORIGINS=https://stuttgartnails.de,https://www.stuttgartnails.de
```

⚠️ **ВАЖНО**: Измените `JWT_SECRET` на новый уникальный ключ!

### 4. Подключите домен
В панели Vercel → Settings → Domains:
- Добавить домен: `stuttgartnails.de`
- Добавить домен: `www.stuttgartnails.de`

### 5. Настройте DNS у регистратора
Добавьте записи (точные значения покажет Vercel):
```
Type: CNAME
Name: @
Value: [значение от Vercel]

Type: CNAME
Name: www
Value: [значение от Vercel]
```

### 6. Проверьте сайт
- Основной сайт: https://stuttgartnails.de
- API: https://stuttgartnails.de/api/health
- Админ панель: https://stuttgartnails.de/admin

## ✅ Что уже настроено в проекте:

- ✅ `vercel.json` - конфигурация для Vercel
- ✅ `.vercelignore` - исключения для развертывания
- ✅ Оптимизированные скрипты сборки
- ✅ Настройки безопасности и кеширования
- ✅ Поддержка MongoDB Atlas
- ✅ Оптимизация изображений
- ✅ SSL сертификаты (автоматически)

## 🔧 Troubleshooting

**Сайт не открывается?**
- DNS записи могут обновляться до 48 часов
- Проверьте статус в панели Vercel

**API не работает?**
- Проверьте переменные окружения
- Посмотрите логи в Vercel → Functions

**Нужна помощь?**
- Полная инструкция: `VERCEL_DEPLOYMENT_GUIDE.md`
- Логи в панели Vercel
- Проверьте статус MongoDB Atlas

---
**Время развертывания: ~5-10 минут** (+ время DNS 0-48 часов) 