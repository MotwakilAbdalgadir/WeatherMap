/**
 * weather.js - OpenWeatherMap Integration
 * Fetches current meteorological data using coordinates from the OpenWeatherMap Current Weather API.
 */

// ============================================================================
// CONFIGURATION NOTE:
// Replace this placeholder with your free OpenWeatherMap API key.
// Client-side architectural reminder:
// Any API key embedded directly in browser JavaScript is inherently visible
// to users via Network DevTools or page source inspection. In production,
// sensitive keys are protected via a backend proxy/gateway.
// ============================================================================
export const OPENWEATHER_API_KEY = '7c3734382baaf153d9e200d500c74220';

const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Retrieves the effective API key (from constant, or optional localStorage override for testing).
 * @returns {string} Active API key string.
 */
export function getApiKey() {
  const customKey = localStorage.getItem('owm_custom_api_key');
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }
  return OPENWEATHER_API_KEY;
}

/**
 * Fetches current weather data for given latitude and longitude coordinates.
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} [customName] - Optional resolved location name from geocoding
 * @param {AbortSignal} [signal] - Optional AbortSignal
 * @returns {Promise<Object>} Formatted weather data object
 */
export async function getWeather(lat, lon, customName, signal) {
  // Validate coordinates
  if (typeof lat !== 'number' || typeof lon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error('Invalid coordinates provided to weather service.');
  }

  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'YOUR_OPENWEATHERMAP_API_KEY_HERE') {
    throw new Error(
      'OpenWeatherMap API key is missing. Please configure your API key in js/weather.js (or store it in localStorage under "owm_custom_api_key").'
    );
  }

  const queryParams = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    appid: apiKey,
    units: 'metric', // Metric units for Celsius and meters/sec
  });

  const requestUrl = `${WEATHER_BASE_URL}?${queryParams.toString()}`;

  let response;
  try {
    response = await fetch(requestUrl, { signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    console.error('Weather API network error:', err);
    throw new Error('Network error: Unable to connect to OpenWeatherMap. Please check your network.');
  }

  // Handle HTTP status codes
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid OpenWeatherMap API key (HTTP 401). Please check your API key configuration.');
    }
    if (response.status === 404) {
      throw new Error('Weather data not found for the requested coordinates (HTTP 404).');
    }
    if (response.status === 429) {
      throw new Error('OpenWeatherMap rate limit exceeded (HTTP 429). Please try again shortly.');
    }
    throw new Error(`Weather service responded with error code HTTP ${response.status}.`);
  }

  // Parse JSON
  let data;
  try {
    data = await response.json();
  } catch (jsonErr) {
    console.error('Weather response JSON parse error:', jsonErr);
    throw new Error('Failed to parse weather service response.');
  }

  // Validate required payload fields
  if (
    !data.main ||
    typeof data.main.temp === 'undefined' ||
    typeof data.main.humidity === 'undefined' ||
    !Array.isArray(data.weather) ||
    data.weather.length === 0
  ) {
    throw new Error('Received unexpected or incomplete weather response structure.');
  }

  const weatherItem = data.weather[0];
  const iconCode = weatherItem.icon || '01d';
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  return {
    name: customName || data.name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    temp: Math.round(data.main.temp),
    condition: weatherItem.main || 'Unknown',
    description: weatherItem.description || 'Unknown conditions',
    iconUrl,
    iconCode,
    humidity: data.main.humidity,
    windSpeed: data.wind && typeof data.wind.speed !== 'undefined' ? data.wind.speed : 0,
    cloudiness: data.clouds && typeof data.clouds.all !== 'undefined' ? data.clouds.all : 0,
    lat,
    lon,
  };
}
