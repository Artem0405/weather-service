# --- Этап 1: Сборщик (Builder) ---
# Используем легковесный образ Node.js. Называем этот этап 'builder'.
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию внутри образа.
WORKDIR /app

# Копируем сначала package.json. Docker кэширует этот слой.
# Если зависимости не менялись, 'npm install' не будет запускаться повторно.
COPY package*.json ./

# Устанавливаем зависимости.
RUN npm install

# Копируем остальной код проекта.
COPY . .

# Собираем TypeScript в JavaScript.
RUN npm run build

# --- Этап 2: Финальный образ (Production) ---
# Начинаем с чистого такого же образа.
FROM node:18-alpine

WORKDIR /app

# Копируем ТОЛЬКО необходимые для запуска файлы из этапа 'builder'.
# Не копируем исходники на TypeScript и dev-зависимости.
# Это делает финальный образ меньше и безопаснее.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .

# Сообщаем Docker, что приложение будет слушать порт 3000.
EXPOSE 3000

# Команда, которая будет выполнена при запуске контейнера.
CMD ["node", "dist/index.js"]