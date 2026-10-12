/**
 * app.js - Main Application Orchestrator
 * Coordinates search form events, geocoding, weather retrieval,
 * map updates, weather popup lifecycle, favorites, and sharing.
 */

import { initMap, flyToLocation, setWeatherMarker } from './map.js';
import { getCoordinates } from './geocoding.js';
import { getWeather } from './weather.js';
import { showLoading, hideLoading, showError, clearError, buildWeatherPopupElement } from './ui.js';
import { renderFavoritesUI, toggleFavorite, isFavorite } from './favorites.js';

// DOM Elements
const searchForm = document.getElementById('search-form');
const locationInput = document.getElementById('location-input');

// Request state tracking to prevent race conditions and stale responses
let activeAbortController = null;
let isSubmitting = false;

/**
 * Executes the complete weather lookup and map presentation pipeline.
 *
 * @param {string} query - Location search term.
 * @param {Object} [cachedCoords] - Optional predefined coordinates (e.g., from favorites).
 */
export async function performLocationSearch(query, cachedCoords = null) {
  if (isSubmitting) {
    return; // Prevent overlapping duplicate submissions
  }

  // Cancel any prior active request
  if (activeAbortController) {
    activeAbortController.abort();
  }
  activeAbortController = new AbortController();
  const currentSignal = activeAbortController.signal;

  clearError();
  showLoading();
  isSubmitting = true;

  try {
    let coords = cachedCoords;

    // Stage 1: Geocoding (if coordinates not already supplied)
    if (!coords) {
      coords = await getCoordinates(query, currentSignal);
    }

    // Stage 2: Fetch Current Weather
    const weatherData = await getWeather(coords.lat, coords.lon, coords.name, currentSignal);

    // Stage 3: Smooth Map Movement
    flyToLocation(coords.lat, coords.lon, 10);

    // Stage 4: Construct Safe DOM Popup and Marker
    const favStatus = isFavorite(coords.lat, coords.lon);

    const popupElement = buildWeatherPopupElement(
      weatherData,
      handleShareWeather,
      handleToggleFavorite,
      favStatus
    );

    // Stage 5: Bind and Open Marker Popup
    setWeatherMarker(coords.lat, coords.lon, popupElement);

    // Clear input on successful search
    if (locationInput) {
      locationInput.value = '';
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Search request was aborted by newer request.');
      return;
    }
    console.error('Weather search operation failed:', err);
    showError(err.message || 'An unexpected error occurred while retrieving weather data.');
  } finally {
    isSubmitting = false;
    hideLoading();
  }
}

/**
 * Handles Web Share API or Clipboard fallback for weather sharing.
 * @param {Object} weather - Structured weather data.
 */
export async function handleShareWeather(weather) {
  const shareText = `Weather in ${weather.name}: ${weather.temp}°C, ${weather.description}. Humidity: ${weather.humidity}%, Wind: ${weather.windSpeed} m/s, Clouds: ${weather.cloudiness}%.`;
  const shareData = {
    title: `WeatherMap — ${weather.name}`,
    text: shareText,
    url: window.location.href,
  };

  // 1. Try modern Web Share API
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Web Share API failed, falling back to clipboard:', err);
      } else {
        return; // User canceled native share sheet
      }
    }
  }

  // 2. Fallback to Clipboard API
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(shareText);
      alert('Weather summary copied to clipboard:\n\n' + shareText);
      return;
    } catch (clipErr) {
      console.warn('Clipboard write failed:', clipErr);
    }
  }

  // 3. Graceful degradation alert
  alert('Weather Summary:\n\n' + shareText);
}

/**
 * Toggles favorite state and refreshes the favorites list UI.
 * @param {Object} weather - Weather object.
 * @returns {boolean} New favorited state.
 */
function handleToggleFavorite(weather) {
  const locationObj = {
    name: weather.name,
    lat: weather.lat,
    lon: weather.lon,
  };
  const newStatus = toggleFavorite(locationObj);
  renderFavoritesUI(handleSelectFavorite, () => {});
  return newStatus;
}

/**
 * Handles selection of a saved favorite city.
 * @param {Object} favorite - Saved favorite location.
 */
function handleSelectFavorite(favorite) {
  performLocationSearch(favorite.name, {
    lat: favorite.lat,
    lon: favorite.lon,
    name: favorite.name,
  });
}

/**
 * Initializes the application on DOM ready.
 */
function initApplication() {
  try {
    // 1. Initialize interactive Leaflet map (centered on Khartoum, Sudan)
    initMap('map');
  } catch (mapInitError) {
    console.error('Failed to initialize Leaflet map:', mapInitError);
    showError('Unable to initialize the interactive map. Please reload the page.');
  }

  // 2. Render initial saved favorites from localStorage
  renderFavoritesUI(handleSelectFavorite, () => {});

  // 3. Wire up search form submission programmatically
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const inputVal = locationInput ? locationInput.value.trim() : '';

      if (!inputVal) {
        showError('Please enter a location name before searching.');
        if (locationInput) locationInput.focus();
        return;
      }

      performLocationSearch(inputVal);
    });
  }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApplication);
} else {
  initApplication();
}
