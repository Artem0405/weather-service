# --- Этап 1: Сборщик (Builder) ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Устанавливаем зависимости, необходимые для компиляции
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev
RUN npm install
COPY . .
RUN npm run build

# --- Этап 2: Финальный образ (Production) ---
FROM node:18-alpine
# Устанавливаем зависимости, необходимые для работы уже скомпилированного пакета
RUN apk add --no-cache cairo jpeg pango giflib ttf-dejavu
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .
EXPOSE 3000
CMD ["node", "dist/index.js"]