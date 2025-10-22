import Redis from 'ioredis';
import { config } from '../config';
import { CacheError } from '../errors/custom.errors';

export class CacheService {
  private client: Redis;
  private readonly ttl = config.cache.ttlSeconds; // Получаем TTL из конфига

  constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      // Важная настройка: если Redis недоступен, не пытаться переподключаться бесконечно.
      // Лучше быстро "упасть" с ошибкой, чтобы WeatherService мог пойти в API.
      maxRetriesPerRequest: 1,
    });

    // Логируем ошибки подключения к Redis, чтобы видеть их в консоли.
    this.client.on('error', (err) => console.error('Redis Client Error', err));
  }

  /**
   * Получает значение из кэша по ключу.
   * @param key Ключ.
   * @returns Распарсенные данные или null, если ключ не найден.
   * @throws {CacheError} если прочитать из кэша не удалось.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      // Redis хранит все как строки, поэтому после получения нам нужно распарсить JSON.
      return data ? (JSON.parse(data) as T) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      throw new CacheError('Failed to read from cache');
    }
  }

  /**
   * Сохраняет значение в кэш с установленным временем жизни (TTL).
   * @param key Ключ.
   * @param value Значение (будет сериализовано в JSON).
   * @throws {CacheError} если записать в кэш не удалось.
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      // Перед записью в Redis мы должны превратить наш объект в строку JSON.
      // 'EX' означает, что следующий аргумент — это время жизни в секундах.
      await this.client.set(key, JSON.stringify(value), 'EX', this.ttl);
    } catch (error) {
      console.error('Redis SET error:', error);
      throw new CacheError('Failed to write to cache');
    }
  }
}