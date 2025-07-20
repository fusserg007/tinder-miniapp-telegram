@echo off
chcp 65001 >nul

echo 🚀 Запуск развертывания на TimeWeb Cloud...
echo.

REM Проверяем наличие необходимых файлов
if not exist "docker-compose.timeweb.yml" (
    echo ❌ Ошибка: файл docker-compose.timeweb.yml не найден!
    pause
    exit /b 1
)

if not exist ".env.timeweb" (
    echo ❌ Ошибка: файл .env.timeweb не найден!
    echo 📝 Создайте файл .env.timeweb на основе env.example
    pause
    exit /b 1
)

echo ✅ Все необходимые файлы найдены
echo.

REM Копируем переменные окружения
echo 📄 Копирование переменных окружения...
copy ".env.timeweb" ".env" >nul

REM Запускаем развертывание
echo 🚀 Запуск развертывания...
docker-compose -f docker-compose.timeweb.yml up -d

echo.
echo ✅ Развертывание запущено!
echo.
echo 📊 Проверить статус: docker-compose -f docker-compose.timeweb.yml ps
echo 📜 Посмотреть логи: docker-compose -f docker-compose.timeweb.yml logs -f
echo.
echo 📖 Подробная инструкция: DEPLOY_GUIDE.md
echo.
pause