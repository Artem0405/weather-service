/**
 * Генерирует стандартизированный ключ для кэша на основе названия города.
 * @param cityName Название города.
 * @returns Строка ключа, например, "weather:new-york".
 */
export function generateCacheKeyForCity(cityName: string): string {
  // 1. Убираем лишние пробелы по краям и приводим к нижнему регистру.
  //    Это гарантирует, что " Moscow " и "moscow" будут одним и тем же ключом.
  const sanitized = cityName.trim().toLowerCase()
    // 2. Заменяем пробелы (и другие whitespace символы) на дефис.
    //    Это делает ключ более читаемым и безопасным (например, для "New York").
    .replace(/\s+/g, '-');

  // 3. Добавляем префикс-пространство имен 'weather:'.
  //    Это хорошая практика в Redis, чтобы ключи разных сервисов не пересекались.
  return `weather:${sanitized}`;
}