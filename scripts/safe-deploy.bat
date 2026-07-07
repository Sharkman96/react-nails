@echo off
setlocal enabledelayedexpansion

echo 🔄 Начинаю безопасное обновление React Nails...

REM Проверка что мы в правильной директории
if not exist "package.json" (
    echo ❌ Ошибка: package.json не найден. Убедитесь что вы находитесь в корневой директории проекта.
    exit /b 1
)

REM Получение текущего коммита и даты
for /f "tokens=*" %%i in ('git rev-parse HEAD') do set CURRENT_COMMIT=%%i
for /f "tokens=2 delims==" %%i in ('wmic os get localdatetime /value') do set datetime=%%i
set CURRENT_DATE=%datetime:~0,8%-%datetime:~8,6%

echo 📋 Информация о текущем состоянии:
echo    Текущий коммит: %CURRENT_COMMIT%
echo    Дата бэкапа: %CURRENT_DATE%

REM Проверка подключения к GitHub
echo 🌐 Проверка подключения к GitHub...
git fetch origin
if errorlevel 1 (
    echo ❌ Не удается подключиться к удаленному репозиторию!
    exit /b 1
)

REM Проверка есть ли обновления
for /f "tokens=*" %%i in ('git rev-parse origin/master') do set REMOTE_COMMIT=%%i
if "%CURRENT_COMMIT%"=="%REMOTE_COMMIT%" (
    echo ✅ Проект уже обновлен до последней версии!
    echo    Текущий коммит: %CURRENT_COMMIT%
    exit /b 0
)

echo 📥 Найдены новые изменения

REM Создание бэкапа важных файлов
echo 🔒 Создание бэкапа важных конфигурационных файлов...
if exist "config.env" (
    copy "config.env" "config.env.backup-%CURRENT_DATE%" >nul
    echo    Создан бэкап: config.env.backup-%CURRENT_DATE%
)

if exist "uploads" (
    xcopy "uploads" "uploads.backup-%CURRENT_DATE%" /E /I /Q >nul
    echo    Создан бэкап: uploads.backup-%CURRENT_DATE%
)

REM Остановка приложения
echo ⏹️  Остановка приложения...
pm2 stop react-nails 2>nul || echo    Приложение не было запущено

REM Обновление кода
echo 📥 Обновление кода из GitHub...
git pull origin master
if errorlevel 1 (
    echo ❌ Ошибка обновления из Git!
    goto :rollback
)

REM Установка зависимостей
echo 📦 Установка зависимостей...
call npm install --only=production
if errorlevel 1 (
    echo ❌ Ошибка установки серверных зависимостей!
    goto :rollback
)

REM Сборка клиентского приложения
echo 🏗️  Сборка клиентского приложения...
cd client
set GENERATE_SOURCEMAP=false
set REACT_APP_ENV=production
call npm install
if errorlevel 1 (
    echo ❌ Ошибка установки клиентских зависимостей!
    cd ..
    goto :rollback
)

call npm run build
if errorlevel 1 (
    echo ❌ Ошибка сборки клиентского приложения!
    cd ..
    goto :rollback
)
cd ..

REM Восстановление config.env если он был затерт
if exist "config.env.backup-%CURRENT_DATE%" (
    if not exist "config.env" (
        echo 🔧 Восстановление config.env...
        copy "config.env.backup-%CURRENT_DATE%" "config.env" >nul
    )
)

REM Проверка что config.env существует
if not exist "config.env" (
    echo ❌ Файл config.env не найден!
    echo Создайте его на основе env.example:
    echo copy env.example config.env
    goto :rollback
)

REM Создание/обновление администратора
echo 👤 Проверка администратора...
call npm run init-admin

REM Запуск приложения через PM2
echo ▶️  Запуск приложения...
pm2 start server.js --name "react-nails" --env production
if errorlevel 1 (
    echo ❌ Ошибка запуска через PM2!
    goto :rollback
)

REM Сохранение конфигурации PM2
pm2 save

echo.
echo ✅ Безопасное обновление завершено успешно!
echo 📊 Статус приложения:
pm2 status react-nails
echo.
echo 📝 Информация о развертывании:
echo    Предыдущий коммит: %CURRENT_COMMIT%
for /f "tokens=*" %%i in ('git rev-parse HEAD') do echo    Текущий коммит: %%i
echo.
goto :end

:rollback
echo 🔄 Выполняю откат к предыдущей версии...
git reset --hard %CURRENT_COMMIT%

if exist "config.env.backup-%CURRENT_DATE%" (
    copy "config.env.backup-%CURRENT_DATE%" "config.env" >nul
    echo    Восстановлен config.env
)

echo ▶️  Запуск приложения после отката...
pm2 start server.js --name "react-nails" --env production

echo ❌ Откат выполнен. Приложение запущено на предыдущей версии.
exit /b 1

:end
echo 🆘 В случае проблем для отката выполните:
echo    git reset --hard %CURRENT_COMMIT%
echo    copy config.env.backup-%CURRENT_DATE% config.env
echo    pm2 restart react-nails 