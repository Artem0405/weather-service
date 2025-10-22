// Типы для ответа API геокодинга
// Описываем только те поля, которые нам действительно нужны.
export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}

// Типы для ответа API прогноза погоды
export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  hourly: HourlyWeather;
}