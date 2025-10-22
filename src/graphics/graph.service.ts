import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';

export class GraphService {
  // Создаем экземпляр рендерера один раз в конструкторе.
  // Это эффективнее, чем создавать его при каждом запросе.
  private readonly chartJSNodeCanvas: ChartJSNodeCanvas;

  constructor() {
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: 800,       // Ширина картинки
      height: 400,      // Высота картинки
      backgroundColour: '#ffffff', // Белый фон
    });
  }

  /**
   * Генерирует PNG-изображение графика температуры.
   * @param labels Массив меток для оси X (например, время).
   * @param data Массив числовых значений для оси Y (температура).
   * @returns Promise, который разрешается в Buffer с PNG-изображением.
   */
  public async generateTemperatureChart(labels: string[], data: number[]): Promise<Buffer> {
    // Это стандартный объект конфигурации для библиотеки Chart.js.
    // Мы описываем, как должен выглядеть наш график.
    const configuration: ChartConfiguration = {
      type: 'line', // Тип графика - линия
      data: {
        labels: labels,
        datasets: [{
          label: `Temperature (°C) for the next 24h`, // Легенда графика
          data: data,
          borderColor: 'rgb(75, 192, 192)', // Цвет линии
          tension: 0.1, // Немного сглаживаем линию
        }],
      },
      options: {
        // Дополнительные опции, например, для настройки осей
        scales: {
          y: {
            // Можно добавить отступы или настроить начальное значение
          },
        },
      },
    };

    // Рендерим график в буфер в памяти
    return this.chartJSNodeCanvas.renderToBuffer(configuration);
  }
}