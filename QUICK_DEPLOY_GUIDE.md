# 🚀 Быстрая шпаргалка по деплою

## Ежедневный workflow (локально)

```bash
# 1. Получить последние изменения
git pull origin master

# 2. Внести изменения в код
# ... редактирование файлов ...

# 3. Проверить что изменилось
git status
git diff

# 4. Добавить изменения
git add .
# или добавить конкретные файлы
git add filename.js

# 5. Зафиксировать изменения
git commit -m "Описание того что изменилось"

# 6. Отправить на GitHub
git push origin master
```

## Обновление на сервере

### Безопасный способ (рекомендуется)
```bash
cd /path/to/your/project
./scripts/safe-deploy.sh
```

### Быстрый способ
```bash
cd /path/to/your/project
./scripts/deploy.sh
```

### Ручной способ
```bash
cd /path/to/your/project
pm2 stop react-nails
git pull origin master
npm install --only=production
cd client && npm install && npm run build && cd ..
pm2 start server.js --name "react-nails"
```

## Важные файлы для .gitignore

```gitignore
# Уже настроено в проекте
config.env
config.env.backup
uploads/
logs/
node_modules/
client/build/
```

## Быстрые команды Git

```bash
# Статус
git status

# Последние коммиты
git log --oneline -5

# Отменить изменения в файле
git checkout filename.js

# Отменить последний коммит (если не запушен)
git reset --soft HEAD~1

# Принудительно синхронизировать с удаленным репозиторием
git fetch origin
git reset --hard origin/master
```

## Проверка на сервере

```bash
# Статус приложения
pm2 status

# Логи
pm2 logs react-nails

# Перезапуск
pm2 restart react-nails

# Остановка/Запуск
pm2 stop react-nails
pm2 start server.js --name "react-nails"
```

## В случае проблем

### Если нужно откатиться
```bash
# Найти коммит для отката
git log --oneline -10

# Откатиться к конкретному коммиту
git reset --hard COMMIT_HASH

# Восстановить config.env
cp config.env.backup config.env

# Перезапустить приложение
pm2 restart react-nails
```

### Если затерся config.env
```bash
# Восстановить из бэкапа
cp config.env.backup config.env

# Или создать заново
cp env.example config.env
# потом отредактировать с правильными значениями
```

## Чек-лист перед деплоем

- [ ] Код протестирован локально
- [ ] Все изменения зафиксированы в Git
- [ ] Секретные файлы не попадают в репозиторий
- [ ] Создан бэкап важных файлов на сервере

---

**Полная инструкция**: см. `DEPLOYMENT_GUIDE.md` 