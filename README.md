# Tinder-like Telegram Mini App

💖 Полнофункциональное приложение знакомств в формате Telegram Mini App с возможностью свайпов, матчей и чатов.

## 🎆 Особенности

- **📱 Telegram Mini App** - Нативная интеграция с Telegram
- **🔄 Swipe-механика** - Классические свайпы влево/вправо
- **🔥 Система матчей** - Взаимные лайки создают матчи
- **💬 Чаты** - Обмен сообщениями между матчами
- **📷 Загрузка фото** - До 6 фотографий в профиле
- **⚙️ Настройки поиска** - Возраст, расстояние
- **📱 Адаптивный дизайн** - Оптимизация под мобильные устройства

## 🛠️ Технологический стек

### Frontend
- **React 18** + TypeScript
- **React Router** для навигации
- **Vite** для сборки
- **Telegram Web App SDK**

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **MongoDB** + **Mongoose**
- **AWS S3** для хранения изображений
- **Sharp** для обработки изображений

### DevOps
- **Docker** + **Docker Compose**
- **Nginx** (reverse proxy)
- **MongoDB** (база данных)
- **MinIO** (S3-совместимое хранилище)
- **ImgProxy** (оптимизация изображений)

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/fusserg007/tinder-miniapp-telegram.git
cd tinder-miniapp-telegram
```

### 2. Настройка переменных окружения

#### Для разработки (.env.dev)
```env
# MongoDB
MONGO_URI=mongodb://mongo:27017/tinder_miniapp

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here

# S3 Storage (MinIO для разработки)
S3_ENDPOINT=http://object-storage:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=photos
S3_REGION=us-east-1

# ImgProxy
IMGPROXY_URL=http://imgproxy:8080
IMGPROXY_KEY=your_imgproxy_key
IMGPROXY_SALT=your_imgproxy_salt

# App Settings
PORT=3000
NODE_ENV=development
```

#### Для продакшена (.env.timeweb)
```env
# MongoDB
MONGO_URI=mongodb://mongo:27017/tinder_miniapp

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_production_bot_token

# S3 Storage (Timeweb Cloud)
S3_ENDPOINT=https://s3.timeweb.cloud
S3_ACCESS_KEY=your_timeweb_access_key
S3_SECRET_KEY=your_timeweb_secret_key
S3_BUCKET=your_bucket_name
S3_REGION=ru-1

# ImgProxy
IMGPROXY_URL=http://imgproxy:8080
IMGPROXY_KEY=your_production_imgproxy_key
IMGPROXY_SALT=your_production_imgproxy_salt

# App Settings
PORT=3000
NODE_ENV=production
DOMAIN=your-domain.com
```

### 3. Запуск в режиме разработки

```bash
# Копируем файл переменных окружения
cp .env.dev .env

# Запускаем все сервисы
docker-compose -f docker-compose.dev.yml up -d
```

Приложение будет доступно по адресу:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **MinIO Console**: http://localhost:9001 (admin/password)

### 4. Деплой на продакшен

#### Автоматический деплой (Linux/macOS)
```bash
# Настраиваем переменные окружения
cp .env.timeweb .env

# Запускаем скрипт деплоя
./deploy.sh
```

#### Автоматический деплой (Windows)
```cmd
REM Настраиваем переменные окружения
copy .env.timeweb .env

REM Запускаем скрипт деплоя
deploy.bat
```

#### Ручной деплой
```bash
# Сборка и запуск
docker-compose -f docker-compose.timeweb.yml up -d --build
```

## 📝 Структура проекта

```
tinder-miniapp-telegram/
├── backend/                 # Backend приложение
│   ├── src/
│   │   ├── config/          # Конфигурация БД
│   │   ├── middleware/      # Middleware (аутентификация)
│   │   ├── models/          # Модели данных
│   │   ├── routes/          # API маршруты
│   │   └── index.ts         # Точка входа
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── tg-web-app/              # Frontend приложение
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   ├── contexts/        # React контексты
│   │   ├── pages/           # Страницы приложения
│   │   ├── App.tsx          # Главный компонент
│   │   └── main.tsx         # Точка входа
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── nginx/                   # Конфигурация Nginx
├── docker-compose.dev.yml   # Разработка
├── docker-compose.timeweb.yml # Продакшен
├── deploy.sh               # Скрипт деплоя (Linux/macOS)
├── deploy.bat              # Скрипт деплоя (Windows)
└── README.md
```

## 🤖 Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота
3. Настройте Menu Button:
   ```
   /setmenubutton
   @your_bot_name
   💖 Найти пару
   https://your-domain.com
   ```
4. Настройте Web App:
   ```
   /newapp
   @your_bot_name
   Tinder Mini App
   Description of your app
   https://your-domain.com
   /path/to/icon.png
   ```

## 📊 API Endpoints

### Пользователи
- `GET /api/users/profile/:telegramId` - Получить профиль
- `PUT /api/users/profile/:telegramId` - Обновить профиль
- `GET /api/users/candidates/:telegramId` - Получить кандидатов
- `PUT /api/users/last-seen/:telegramId` - Обновить время посещения

### Матчи
- `POST /api/matches/swipe` - Свайп (лайк/дизлайк)
- `GET /api/matches/list/:telegramId` - Список матчей

### Сообщения
- `POST /api/messages/send` - Отправить сообщение
- `GET /api/messages/chat/:matchId/:telegramId` - История чата
- `PUT /api/messages/read` - Отметить как прочитанное
- `GET /api/messages/unread/:telegramId` - Количество непрочитанных

### Загрузка файлов
- `POST /api/upload/photo` - Загрузить фото

## 🔧 Разработка

### Установка зависимостей

```bash
# Backend
cd backend
npm install

# Frontend
cd tg-web-app
npm install
```

### Запуск в режиме разработки

```bash
# Backend (порт 3000)
cd backend
npm run dev

# Frontend (порт 5173)
cd tg-web-app
npm run dev
```

### Сборка для продакшена

```bash
# Backend
cd backend
npm run build

# Frontend
cd tg-web-app
npm run build
```

## 🛡️ Безопасность

- ✅ Валидация Telegram WebApp данных
- ✅ CORS настройки
- ✅ Helmet для безопасности заголовков
- ✅ Валидация входящих данных
- ✅ Безопасная загрузка файлов
- ✅ Оптимизация изображений

## 📊 Мониторинг

### Логи
```bash
# Просмотр логов всех сервисов
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Статус сервисов
```bash
docker-compose ps
```

## 🔄 Обновление

```bash
# Остановка сервисов
docker-compose down

# Обновление кода
git pull origin main

# Пересборка и запуск
docker-compose up -d --build
```

## 🐛 Устранение неполадок

### Проблемы с подключением к MongoDB
```bash
# Проверка статуса MongoDB
docker-compose exec mongo mongosh --eval "db.adminCommand('ismaster')"
```

### Проблемы с S3
```bash
# Проверка доступности MinIO
curl http://localhost:9000/minio/health/live
```

### Проблемы с Nginx
```bash
# Проверка конфигурации
docker-compose exec nginx nginx -t

# Перезагрузка конфигурации
docker-compose exec nginx nginx -s reload
```

## 📜 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 🤝 Поддержка

Если у вас есть вопросы или предложения:

1. Создайте [Issue](https://github.com/fusserg007/tinder-miniapp-telegram/issues)
2. Отправьте [Pull Request](https://github.com/fusserg007/tinder-miniapp-telegram/pulls)
3. Напишите в Telegram: [@your_username](https://t.me/your_username)

---

🚀 **Готово к запуску!** Следуйте инструкциям выше для развертывания вашего собственного Tinder-like приложения в Telegram.