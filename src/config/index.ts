import * as dotenv from 'dotenv';
// Эта строчка — магия. Она ищет файл .env в корне проекта и загружает его содержимое.
dotenv.config();

// Создаем и экспортируем объект с типизированными и обработанными настройками.
export const config = {
  server: {
    // Читаем порт из окружения, если его нет — используем 3000 по умолчанию.
    // parseInt нужен, т.к. process.env всегда хранит строки.
    port: parseInt(process.env.PORT || '3000', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  cache: {
    // Время жизни кэша в секундах. По умолчанию 900с = 15 минут.
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '900', 10),
  },
  api: {
    // Выносим URL'ы внешних API сюда, чтобы их было легко поменять.
    geocoding: 'https://geocoding-api.open-meteo.com/v1/search',
    weather: 'https://api.open-meteo.com/v1/forecast',
  }
};