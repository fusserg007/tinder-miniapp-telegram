# Многоэтапная сборка

# Этап 1: Сборка приложения
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Переменные окружения для сборки
ARG VITE_BACKEND_URL
ARG VITE_BOT_USERNAME
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_BOT_USERNAME=$VITE_BOT_USERNAME

# Собираем приложение
RUN npm run build

# Этап 2: Продакшен образ
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 5173

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]