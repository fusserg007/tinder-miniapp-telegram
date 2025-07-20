# 🚀 Telegram Mini App для знакомств

<img align="right" width="300" height="724" src="./docs/images/first-run/main-screenshot.png">

Это полнофункциональное приложение для знакомств в Telegram с современным стеком технологий.

**Демо бот:** [@flirt_zone_bot](https://t.me/flirt_zone_bot)

## 🌟 Возможности

### Для пользователей:
- Создание профиля знакомств с фотографиями
- Оценка других пользователей поблизости
- Взаимные симпатии и общение в Telegram
- Premium подписка с дополнительными возможностями

### Для разработчиков:
- Микросервисная архитектура
- Современный стек: React + Node.js + MongoDB + Docker
- Готовые конфигурации для развертывания
- Подробная документация

## 🚀 Быстрый старт

### Развертывание на TimeWeb Cloud

1. **Получите токен бота** от @BotFather в Telegram
2. **Создайте приложение** в TimeWeb Cloud
3. **Подключите этот репозиторий**
4. **Настройте переменные окружения**
5. **Запустите развертывание**

📖 **Подробная инструкция:** [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

### Локальная разработка

```bash
# Клонируйте репозиторий
git clone https://github.com/fusserg007/tinder-miniapp-telegram.git
cd tinder-miniapp-telegram

# Скопируйте и настройте переменные окружения
cp env.example .env
# Отредактируйте .env файл

# Запустите все сервисы
npm run dev
```

## 🛠️ Технологии

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **База данных:** MongoDB
- **Файловое хранилище:** MinIO
- **Обработка изображений:** ImgProxy
- **Контейнеризация:** Docker + Docker Compose
- **Веб-сервер:** Nginx

## 📁 Структура проекта

```
├── backend/           # Backend API на Node.js
├── tg-web-app/        # Frontend на React
├── nginx/             # Конфигурации Nginx
├── docs/              # Документация
├── docker-compose.*.yml # Docker конфигурации
└── DEPLOY_GUIDE.md    # Инструкция по развертыванию
```

## 🔧 Конфигурации развертывания

- `docker-compose.dev.yml` - для локальной разработки
- `docker-compose.timeweb.yml` - для TimeWeb Cloud
- `docker-compose.prod.yml` - для production сервера

## 📚 Документация

- [Инструкция по развертыванию](./DEPLOY_GUIDE.md)
- [Первый запуск проекта](./docs/ru/00-first-run.md)
- [Дизайн приложения](./docs/ru/01-design.md)
- [Настройка проекта](./docs/ru/02-settings.md)
- [Разработка интерфейса](./docs/ru/04-develop-interface.md)
- [Подготовка backend](./docs/ru/06-prepare-backend.md)
- [Авторизация](./docs/ru/07-auth-reg.md)
- [Платежи](./docs/ru/08-payments.md)

## 🤝 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте [инструкцию по развертыванию](./DEPLOY_GUIDE.md)
2. Изучите логи приложения
3. Создайте Issue в этом репозитории

## 📄 Лицензия

MIT License - см. файл [LICENSE](./LICENSE)

## 👨‍💻 Автор

**Юрий Кундин** - веб-разработчик из Владимира

- Telegram: [@ykundin](https://t.me/ykundin)
- VK: [ykundin](https://vk.com/ykundin)
- Instagram: [@y.kundin](https://www.instagram.com/y.kundin)

---

⭐ Поставьте звезду, если проект был полезен!