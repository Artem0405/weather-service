// Базовый класс для всех наших операционных ошибок, чтобы мы могли их отличать от системных.
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    // Устанавливаем имя ошибки равным имени класса. Полезно для отладки.
    this.name = this.constructor.name;
  }
}

// Ошибка, когда API геокодинга не может найти указанный город.
export class CityNotFoundError extends AppError {
  constructor(city: string) {
    super(`City not found: ${city}`);
  }
}

// Ошибка, когда внешнее API (погоды или геокодинга) недоступно или вернуло ошибку.
export class ExternalApiError extends AppError {
  constructor(message: string = 'External API is unavailable') {
    super(message);
  }
}

// Ошибка, когда наш сервис кэширования (Redis) недоступен.
export class CacheError extends AppError {
  constructor(message: string = 'Cache service is unavailable') {
    super(message);
  }
}