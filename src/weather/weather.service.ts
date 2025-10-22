import { OpenMeteoAPIService } from '../api/openMeteo.service';
import { CacheService } from '../cache/redis.service';
import { WeatherResponse } from '../types';
import { generateCacheKeyForCity } from '../utils/cache';

export class WeatherService {
  // Через конструктор мы получаем экземпляры других сервисов.
  // Это называется Dependency Injection (внедрение зависимостей).
  constructor(
    private readonly apiService: OpenMeteoAPIService,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Основной метод, реализующий бизнес-логику получения прогноза погоды.
   * @param city Название города (уже нормализованное).
   * @returns Данные о прогнозе погоды.
   */
  public async getForecastByCity(city: string): Promise<WeatherResponse> {
    // 1. Генерируем ключ для кэша с помощью нашей утилиты.
    const cacheKey = generateCacheKeyForCity(city);

    // 2. Пытаемся получить данные из кэша.
    // Оборачиваем в try-catch на случай, если Redis недоступен.
    try {
      const cachedData = await this.cacheService.get<WeatherResponse>(cacheKey);
      if (cachedData) {
        console.log(`[Cache] HIT for city: ${city}`);
        return cachedData;
      }
    } catch (error) {
      // Если кэш недоступен, мы не падаем, а просто логируем ошибку
      // и продолжаем работу, как будто это cache miss.
      // Это делает сервис более отказоустойчивым.
      console.error('Cache read failed, proceeding to fetch from API:', error);
    }

    // 3. Если мы здесь, значит, это Cache Miss (или кэш упал).
    console.log(`[Cache] MISS for city: ${city}. Fetching from API.`);
    // Сначала получаем координаты...
    const coordinates = await this.apiService.getCoordinates(city);
    // ...а затем по ним получаем прогноз.
    const forecast = await this.apiService.getHourlyForecast(coordinates.latitude, coordinates.longitude);

    // 4. Сохраняем свежие данные в кэш для следующих запросов.
    // Оборачиваем в try-catch, чтобы ошибка записи в кэш не сломала ответ пользователю.
    try {
      await this.cacheService.set(cacheKey, forecast);
    } catch (error) {
      // Пользователь все равно получит данные, просто они не закэшируются.
      console.error('Cache write failed:', error);
    }

    // 5. Возвращаем данные.
    return forecast;
  }
}