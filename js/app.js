import { initMap, flyToLocation, setWeatherMarker } from './map.js';
import { getCoordinates } from './geocoding.js';
import { getWeather } from './weather.js';
import { showLoading, hideLoading, showError, clearError, buildWeatherPopupElement } from './ui.js';
import { renderFavoritesUI, toggleFavorite, isFavorite } from './favorites.js';
import { getCurrentLanguage, setLanguage, toggleLanguage, t } from './i18n.js';

const searchForm = document.getElementById('search-form');
const locationInput = document.getElementById('location-input');
const langToggleBtn = document.getElementById('lang-toggle-btn');

let activeAbortController = null;
let isSubmitting = false;

let lastCoords = null;
let lastWeather = null;

export async function performLocationSearch(query, cachedCoords = null) {
  if (isSubmitting) {
    return;
  }

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

    if (!coords) {
      coords = await getCoordinates(query, currentSignal);
    }

    lastCoords = coords;

    const weatherData = await getWeather(coords.lat, coords.lon, coords.name, currentSignal);
    lastWeather = weatherData;

    flyToLocation(coords.lat, coords.lon, 10);

    const favStatus = isFavorite(coords.lat, coords.lon);

    const popupElement = buildWeatherPopupElement(
      weatherData,
      handleShareWeather,
      handleToggleFavorite,
      favStatus
    );

    setWeatherMarker(coords.lat, coords.lon, popupElement);

    if (locationInput) {
      locationInput.value = '';
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return;
    }
    console.error('Weather search operation failed:', err);
    showError(err.message || 'An unexpected error occurred while retrieving weather data.');
  } finally {
    isSubmitting = false;
    hideLoading();
  }
}

export async function handleShareWeather(weather) {
  const shareText = `${t('shareSummaryPrefix')} ${weather.name}: ${weather.temp}°C, ${weather.description}. ${t('humidity')}: ${weather.humidity}%, ${t('windSpeed')}: ${weather.windSpeed} ${t('unitsWind')}, ${t('cloudiness')}: ${weather.cloudiness}%.`;
  const shareData = {
    title: `WeatherMap — ${weather.name}`,
    text: shareText,
    url: window.location.href,
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Web Share API failed, falling back to clipboard:', err);
      } else {
        return;
      }
    }
  }

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(shareText);
      alert(t('shareClipboardAlert') + shareText);
      return;
    } catch (clipErr) {
      console.warn('Clipboard write failed:', clipErr);
    }
  }

  alert(t('shareSummaryPrefix') + ':\n\n' + shareText);
}

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

function handleSelectFavorite(favorite) {
  performLocationSearch(favorite.name, {
    lat: favorite.lat,
    lon: favorite.lon,
    name: favorite.name,
  });
}

async function refreshCurrentWeatherOnLangChange() {
  if (!lastCoords) return;
  try {
    const weatherData = await getWeather(lastCoords.lat, lastCoords.lon, lastCoords.name);
    lastWeather = weatherData;
    const favStatus = isFavorite(lastCoords.lat, lastCoords.lon);
    const popupElement = buildWeatherPopupElement(
      weatherData,
      handleShareWeather,
      handleToggleFavorite,
      favStatus
    );
    setWeatherMarker(lastCoords.lat, lastCoords.lon, popupElement);
  } catch (err) {
    console.warn('Could not refresh weather on language change:', err);
  }
}

function initApplication() {
  const currentLang = getCurrentLanguage();
  setLanguage(currentLang);

  try {
    initMap('map');
  } catch (mapInitError) {
    console.error('Failed to initialize Leaflet map:', mapInitError);
    showError('Unable to initialize the interactive map. Please reload the page.');
  }

  renderFavoritesUI(handleSelectFavorite, () => {});

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      toggleLanguage();
      renderFavoritesUI(handleSelectFavorite, () => {});
      refreshCurrentWeatherOnLangChange();
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const inputVal = locationInput ? locationInput.value.trim() : '';

      if (!inputVal) {
        showError(t('emptyInputError'));
        if (locationInput) locationInput.focus();
        return;
      }

      performLocationSearch(inputVal);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApplication);
} else {
  initApplication();
}
