import fetch from 'node-fetch';
import { GeocodingResponse, WeatherResponse } from '../types';
import { CityNotFoundError, ExternalApiError } from '../errors/custom.errors';
import { config } from '../config';

export class OpenMeteoAPIService {

  /**
   * Получает координаты для указанного города.
   * @param city Название города.
   * @returns Объект с широтой, долготой и точным названием города.
   * @throws {CityNotFoundError} если город не найден.
   * @throws {ExternalApiError} при других ошибках API.
   */
  public async getCoordinates(city: string) {
    // Кодируем название города, чтобы оно было безопасным для использования в URL.
    // Это защищает от ошибок с городами вроде "San Francisco".
    const encodedCity = encodeURIComponent(city);
    try {
      const response = await fetch(`${config.api.geocoding}?name=${encodedCity}&count=1`);
      // Приводим ответ к нашему типу, чтобы TypeScript помогал нам.
      const data = (await response.json()) as GeocodingResponse;

      // API может вернуть статус 200, но с пустым массивом results, если город не найден.
      // Мы должны обработать этот случай как ошибку.
      if (!response.ok || !data.results || data.results.length === 0) {
        throw new CityNotFoundError(city);
      }

      const { latitude, longitude, name } = data.results[0];
      return { latitude, longitude, name };

    } catch (error) {
      // Если это уже наша "ожидаемая" ошибка, просто пробрасываем ее дальше.
      if (error instanceof CityNotFoundError) throw error;

      // Логируем настоящую ошибку для себя (например, проблемы с сетью).
      console.error('Geocoding API error:', error);
      // А наружу отдаем нашу стандартизированную ошибку.
      throw new ExternalApiError('Failed to fetch geocoding data');
    }
  }

  /**
   * Получает почасовой прогноз погоды по координатам.
   * @param latitude Широта.
   * @param longitude Долгота.
   * @returns Объект с данными о погоде.
   * @throws {ExternalApiError} при ошибках API.
   */
  public async getHourlyForecast(latitude: number, longitude: number): Promise<WeatherResponse> {
    const url = `${config.api.weather}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        // Если ответ не успешный (не 2xx статус), генерируем ошибку.
        throw new Error(`API returned status ${response.status}`);
      }
      return (await response.json()) as WeatherResponse;
    } catch (error) {
      console.error('Weather API error:', error);
      throw new ExternalApiError('Failed to fetch weather data');
    }
  }
}