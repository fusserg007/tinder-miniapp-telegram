#!/bin/bash

# 🚀 Скрипт автоматического развертывания на TimeWeb Cloud

echo "🚀 Запуск развертывания на TimeWeb Cloud..."

# Проверяем наличие необходимых файлов
if [ ! -f "docker-compose.timeweb.yml" ]; then
    echo "❌ Ошибка: файл docker-compose.timeweb.yml не найден!"
    exit 1
fi

if [ ! -f ".env.timeweb" ]; then
    echo "❌ Ошибка: файл .env.timeweb не найден!"
    echo "📝 Создайте файл .env.timeweb на основе env.example"
    exit 1
fi

echo "✅ Все необходимые файлы найдены"

# Копируем переменные окружения
echo "📄 Копирование переменных окружения..."
cp .env.timeweb .env

# Запускаем развертывание
echo "🚀 Запуск развертывания..."
docker-compose -f docker-compose.timeweb.yml up -d

echo ""
echo "✅ Развертывание запущено!"
echo ""
echo "📊 Проверить статус: docker-compose -f docker-compose.timeweb.yml ps"
echo "📜 Посмотреть логи: docker-compose -f docker-compose.timeweb.yml logs -f"
echo ""
echo "📖 Подробная инструкция: DEPLOY_GUIDE.md"