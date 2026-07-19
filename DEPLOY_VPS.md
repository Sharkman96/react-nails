# Инструкция по деплою на VPS сервер

## 📋 Подготовка проекта

### Шаг 1: Сборка клиента (если не сделано)
```bash
cd client
npm run build
cd ..
```

### Шаг 2: Создание архива для загрузки

**На Windows (PowerShell):**
```powershell
# Создаём архив без node_modules
Compress-Archive -Path "config.env", "server.js", "package.json", "package-lock.json", "client/build", "controllers", "middleware", "routes", "lib", "data", "public" -DestinationPath "react-nails.zip" -Force
```

**Или вручную:**
1. Создайте папку `react-nails-deploy`
2. Скопируйте в неё:
   - `config.env`
   - `server.js`
   - `package.json`
   - `package-lock.json`
   - `client/build/` (вся папка)
   - `controllers/`
   - `middleware/`
   - `routes/`
   - `lib/`
   - `data/`
   - `public/`
3. Заархивируйте папку

**НЕ включайте:**
- `node_modules/`
- `client/node_modules/`
- `client/src/`
- `.git/`

---

## 🖥️ Настройка VPS сервера

### Шаг 3: Подключение к серверу
```bash
ssh user@your-server-ip
```

### Шаг 4: Установка Node.js (если не установлен)
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверка
node -v
npm -v
```

### Шаг 5: Установка PM2 (менеджер процессов)
```bash
sudo npm install -g pm2
```

---

## 📤 Загрузка проекта

### Шаг 6: Загрузка архива на сервер

**С локального компьютера (Windows PowerShell):**
```powershell
scp react-nails.zip user@your-server-ip:/home/user/
```

**Или через FileZilla/WinSCP:**
1. Подключитесь к серверу по SFTP
2. Загрузите `react-nails.zip` в `/home/user/`

### Шаг 7: Распаковка на сервере
```bash
# На сервере
cd /home/user
mkdir -p /var/www/stuttgartnails
unzip react-nails.zip -d /var/www/stuttgartnails
cd /var/www/stuttgartnails
```

### Шаг 8: Установка зависимостей
```bash
npm install --production
```

### Шаг 9: Проверка config.env
```bash
cat config.env
# Должно быть:
# PORT=5010
# NODE_ENV=production
# GOOGLE_PLACES_API_KEY=...          # Places API (New), только сервер
# GOOGLE_PLACE_ID=ChIJE_wiOw3bmUcRrggBAHoNZLQ
```

Google Reviews (`GET /api/reviews`):
- В Google Cloud включите **Places API (New)** и ограничьте ключ этим API.
- Кэш пишется в `data/reviews.json` (TTL 7 дней), файл не коммитится.
- OAuth `client_secret` для отзывов не нужен.

---

## 🚀 Запуск приложения

### Шаг 10: Запуск через PM2
```bash
cd /var/www/stuttgartnails
pm2 start server.js --name "stuttgartnails"

# Сохранение конфигурации PM2
pm2 save

# Автозапуск при перезагрузке сервера
pm2 startup
```

### Полезные команды PM2:
```bash
pm2 list                    # Список процессов
pm2 logs stuttgartnails     # Логи приложения
pm2 restart stuttgartnails  # Перезапуск
pm2 stop stuttgartnails     # Остановка
pm2 delete stuttgartnails   # Удаление
```

---

## 🌐 Настройка Nginx

### Шаг 11: Установка Nginx (если не установлен)
```bash
sudo apt update
sudo apt install nginx -y
```

### Шаг 12: Создание конфигурации сайта
```bash
sudo nano /etc/nginx/sites-available/stuttgartnails
```

**Канонический хост:** только `https://stuttgartnails.de` (без www).  
**Не включайте** глобальный redirect «добавить trailing slash» для HTML — `/ru` должен отдавать **200**, а `/ru/` редиректит Node на `/ru`.

**Вставьте конфигурацию** (пути SSL — после Certbot; при первой установке сначала получите сертификат, затем примените блоки):

```nginx
# 1) HTTP → HTTPS apex (оба hostname)
server {
    listen 80;
    listen [::]:80;
    server_name stuttgartnails.de www.stuttgartnails.de;
    return 301 https://stuttgartnails.de$request_uri;
}

# 2) HTTPS www → apex
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.stuttgartnails.de;

    ssl_certificate /etc/letsencrypt/live/stuttgartnails.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stuttgartnails.de/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://stuttgartnails.de$request_uri;
}

# 3) HTTPS apex → Node
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name stuttgartnails.de;

    ssl_certificate /etc/letsencrypt/live/stuttgartnails.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stuttgartnails.de/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:5010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:5010;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, immutable, max-age=2592000";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;
    gzip_comp_level 6;
}
```

### Шаг 13: Активация сайта
```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/stuttgartnails /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Перезагрузка Nginx
sudo systemctl reload nginx
```

### Шаг 13b: Проверка каноникала и soft-404 (после деплоя кода)
```bash
curl -sI https://www.stuttgartnails.de/ | head -n 5
# ожидается: 301 → https://stuttgartnails.de/

curl -sI https://stuttgartnails.de/ru | head -n 5
# ожидается: 200 (не 301 на /ru/)

curl -sI https://stuttgartnails.de/am/spam-test | head -n 5
# ожидается: 404

curl -sI http://stuttgartnails.de/ | head -n 5
# ожидается: 301 → https://stuttgartnails.de/
```

### Шаг 13c: Google Search Console после деплоя
1. Removals → Temporary removal для спам-URL (`/am/...`).
2. URL Inspection → Request indexing для `https://stuttgartnails.de/` и `https://stuttgartnails.de/ru`.
3. Дождаться переобхода Coverage.

---

## 🔒 Настройка SSL (HTTPS)

### Шаг 14: Установка Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Шаг 15: Получение SSL сертификата
```bash
sudo certbot --nginx -d stuttgartnails.de -d www.stuttgartnails.de
```

Следуйте инструкциям:
1. Введите email
2. Согласитесь с условиями (A)
3. Выберите редирект на HTTPS (2)

После Certbot **замените** автосгенерированные server-блоки на каноническую схему из Шага 12 (www → apex), затем `sudo nginx -t && sudo systemctl reload nginx`.

### Шаг 16: Автообновление сертификата
```bash
# Проверка автообновления
sudo certbot renew --dry-run
```

---

## 🌍 Настройка DNS

### Шаг 17: Настройка A-записей у регистратора домена

Добавьте следующие DNS записи:

| Тип | Имя | Значение | TTL |
|-----|-----|----------|-----|
| A | @ | IP_ВАШЕГО_СЕРВЕРА | 3600 |
| A | www | IP_ВАШЕГО_СЕРВЕРА | 3600 |

**Пример для stuttgartnails.de:**
```
A    stuttgartnails.de       → 123.456.789.10
A    www.stuttgartnails.de   → 123.456.789.10
```

DNS обновление может занять до 24-48 часов.

---

## ✅ Проверка работы

### Шаг 18: Тестирование
```bash
# Проверка локально на сервере
curl http://localhost:5010/api/health

# Проверка через домен (после настройки DNS)
curl https://stuttgartnails.de/api/health
```

---

## 🔄 Обновление проекта

### При изменениях в коде:

1. **Локально:** Пересоберите клиент и создайте новый архив
```bash
cd client
npm run build
cd ..
# Создайте архив как в Шаге 2
```

2. **На сервере:**
```bash
# Загрузите новый архив
cd /var/www/stuttgartnails

# Бэкап текущей версии
cp -r . ../stuttgartnails-backup

# Распакуйте новые файлы
unzip -o /home/user/react-nails.zip

# Перезапустите приложение
pm2 restart stuttgartnails
```

---

## 🔧 Решение проблем

### Приложение не запускается
```bash
# Проверьте логи
pm2 logs stuttgartnails --lines 50

# Проверьте порт
sudo netstat -tlnp | grep 5010
```

### Nginx ошибка 502 Bad Gateway
```bash
# Проверьте, работает ли приложение
pm2 list

# Проверьте логи Nginx
sudo tail -f /var/log/nginx/error.log
```

### Сайт недоступен
```bash
# Проверьте статус Nginx
sudo systemctl status nginx

# Проверьте firewall
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
```

---

## 📁 Структура на сервере

```
/var/www/stuttgartnails/
├── config.env
├── server.js
├── package.json
├── package-lock.json
├── node_modules/
├── client/
│   └── build/
├── controllers/
├── middleware/
├── routes/
├── data/
│   ├── services.json
│   └── gallery.json
└── public/
    └── images/
        └── gallery/
```

---

## 📝 Быстрый чеклист

- [ ] Собран клиент (`npm run build`)
- [ ] Создан архив без node_modules
- [ ] Загружен на сервер
- [ ] Установлены зависимости (`npm install --production`)
- [ ] Запущен через PM2
- [ ] Настроен Nginx
- [ ] Настроен SSL (Certbot)
- [ ] Настроены DNS записи
- [ ] Проверена работа сайта
