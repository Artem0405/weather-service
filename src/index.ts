import { config } from './config';
import { OpenMeteoAPIService } from './api/openMeteo.service';
import { CacheService } from './cache/redis.service';
import { GraphService } from './graphics/graph.service';
import { WeatherController } from './weather/weather.controller';
import { WeatherService } from './weather/weather.service';
import { createServer } from './core/server';

// --- Этап 1: Сборка приложения (Dependency Injection) ---
// Создаем экземпляры "исполнителей", у которых нет зависимостей.
const apiService = new OpenMeteoAPIService();
const cacheService = new CacheService();
const graphService = new GraphService();

// Создаем "дирижера", передавая ему нужных исполнителей.
const weatherService = new WeatherService(apiService, cacheService);

// Создаем "менеджера", передавая ему дирижера и других исполнителей.
const weatherController = new WeatherController(weatherService, graphService);

// --- Этап 2: Создание и запуск сервера ---
// Создаем экземпляр сервера, передавая ему полностью собранный контроллер.
const server = createServer(weatherController);

// Запускаем сервер на порту, указанном в конфигурации.
server.listen(config.server.port, () => {
  console.log(`🚀 Server is listening on http://localhost:${config.server.port}`);
});