import { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { WeatherService } from './weather.service';
import { GraphService } from '../graphics/graph.service';
import { CityNotFoundError, ExternalApiError, CacheError } from '../errors/custom.errors';

export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly graphService: GraphService
  ) {}

  // --- Публичные методы-обработчики ---

  /**
   * Обрабатывает запрос на получение HTML-страницы.
   */
  public async getWeatherPage(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const requestUrl = new URL(req.url!, `http://${req.headers.host}`);
    const city = this.getValidatedCity(requestUrl);

    if (!city) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h1>400 Bad Request: "city" query parameter is required.</h1>');
      return;
    }

    // Просто рендерим HTML, который содержит ссылку на эндпоинт с графиком.
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(this.renderHtml(city));
  }

  /**
   * Обрабатывает запрос на получение PNG-изображения графика.
   */
  public async getWeatherGraph(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const requestUrl = new URL(req.url!, `http://${req.headers.host}`);
    const city = this.getValidatedCity(requestUrl);

    if (!city) {
      this.sendJsonError(res, 400, 'City parameter is required');
      return;
    }

    try {
      // Здесь происходит вся магия: вызываем наш главный сервис.
      const forecast = await this.weatherService.getForecastByCity(city);

      // Готовим данные для графика (берем только первые 24 часа).
      const hours = forecast.hourly.time.slice(0, 24).map(t => new Date(t).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
      const temps = forecast.hourly.temperature_2m.slice(0, 24);

      // Генерируем изображение.
      const chartBuffer = await this.graphService.generateTemperatureChart(hours, temps);

      // Отдаем бинарные данные картинки.
      res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': chartBuffer.length });
      res.end(chartBuffer);

    } catch (error) {
      // Это самый важный блок: централизованная обработка ошибок.
      console.error(`[Error] for city "${city}":`, error);

      if (error instanceof CityNotFoundError) {
        this.sendJsonError(res, 404, error.message);
      } else if (error instanceof ExternalApiError || error instanceof CacheError) {
        this.sendJsonError(res, 503, 'A required external service is currently unavailable.');
      } else {
        this.sendJsonError(res, 500, 'Internal Server Error');
      }
    }
  }

  // --- Приватные методы-помощники ---

  /**
   * Извлекает, валидирует и нормализует параметр 'city' из URL.
   */
  private getValidatedCity(requestUrl: URL): string | null {
    const city = requestUrl.searchParams.get('city');
    if (!city || city.trim() === '') {
      return null;
    }
    // Сразу приводим к нижнему регистру и убираем пробелы.
    return city.trim().toLowerCase();
  }

  /**
   * Генерирует HTML-разметку для страницы.
   */
  private renderHtml(city: string): string {
    const encodedCity = encodeURIComponent(city);
    // Для красивого отображения делаем первую букву заглавной.
    const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Weather in ${capitalizedCity}</title>
          <style> body { font-family: sans-serif; text-align: center; margin-top: 50px; } </style>
      </head>
      <body>
          <h1>Weather forecast for ${capitalizedCity}</h1>
          <img src="/weather/graph?city=${encodedCity}" alt="Temperature chart for ${city}">
      </body>
      </html>
    `;
  }

  /**
   * Отправляет JSON-ответ с ошибкой.
   */
  private sendJsonError(res: ServerResponse, statusCode: number, message: string) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message }));
  }
}