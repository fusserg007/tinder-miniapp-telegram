FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Компилируем TypeScript
RUN npm run build

# Открываем порт
EXPOSE 4000

# Запускаем приложение
CMD ["npm", "start"]