import http from 'http';
import { URL } from 'url';
import { WeatherController } from '../weather/weather.controller';

/**
 * Создает и конфигурирует экземпляр HTTP-сервера.
 * @param weatherController Экземпляр контроллера, который будет обрабатывать запросы.
 * @returns Готовый к запуску экземпляр http.Server.
 */
export function createServer(weatherController: WeatherController) {
  // http.createServer принимает функцию-обработчик, которая будет вызываться на каждый запрос.
  return http.createServer((req, res) => {
    const requestUrl = new URL(req.url || '', `http://${req.headers.host}`);

    // Оборачиваем роутинг в async функцию, чтобы ловить любые неожиданные ошибки
    const routeHandler = async () => {
      if (req.method === 'GET' && requestUrl.pathname === '/weather') {
        // Если URL совпал, передаем управление соответствующему методу контроллера.
        await weatherController.getWeatherPage(req, res);

      } else if (req.method === 'GET' && requestUrl.pathname === '/weather/graph') {
        await weatherController.getWeatherGraph(req, res);

      } else {
        // Если ни один маршрут не подошел, отдаем 404 Not Found.
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }));
      }
    };

    // Запускаем обработчик и ловим любые "непойманные" ошибки, чтобы сервер не упал.
    routeHandler().catch(err => {
      console.error("Unhandled error during request processing:", err);
      // Важно! Если заголовки еще не были отправлены, отправляем 500.
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal Server Error' }));
      }
    });
  });
}