/**
 * ui.js - User Interface Updates and Safe DOM Rendering
 * Manages loading indicators, error banners, and builds secure DOM elements.
 */

// Cache DOM elements
const searchBtn = document.getElementById('search-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const errorBanner = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

/**
 * Displays the visible loading indicator and disables the search button.
 */
export function showLoading() {
  if (loadingIndicator) {
    loadingIndicator.classList.remove('hidden');
  }
  if (searchBtn) {
    searchBtn.disabled = true;
    const btnText = searchBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'Searching...';
  }
}

/**
 * Hides the loading indicator and re-enables the search button.
 */
export function hideLoading() {
  if (loadingIndicator) {
    loadingIndicator.classList.add('hidden');
  }
  if (searchBtn) {
    searchBtn.disabled = false;
    const btnText = searchBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'Get Weather';
  }
}

/**
 * Renders an accessible user-friendly error message.
 * @param {string} message - Descriptive error text to show to the user.
 */
export function showError(message) {
  if (errorBanner && errorText) {
    errorText.textContent = message;
    errorBanner.classList.remove('hidden');
  }
}

/**
 * Clears and hides any active error banner.
 */
export function clearError() {
  if (errorBanner && errorText) {
    errorText.textContent = '';
    errorBanner.classList.add('hidden');
  }
}

/**
 * Safely builds the Weather Popup DOM element using safe DOM methods
 * (createElement, textContent) to prevent XSS injection from external API strings.
 *
 * @param {Object} weather - Structured weather data.
 * @param {Function} onShareClick - Callback when Share button is clicked.
 * @param {Function} onFavoriteClick - Callback when Favorite button is clicked.
 * @param {boolean} isFavorite - Whether the location is currently favorited.
 * @returns {HTMLElement} The constructed popup DOM card.
 */
export function buildWeatherPopupElement(weather, onShareClick, onFavoriteClick, isFavorite = false) {
  const card = document.createElement('div');
  card.className = 'weather-popup-card';

  // --- Header ---
  const header = document.createElement('div');
  header.className = 'popup-header';

  const title = document.createElement('h3');
  title.className = 'popup-location-name';
  title.textContent = weather.name;

  const conditionBadge = document.createElement('span');
  conditionBadge.className = 'popup-condition-badge';
  conditionBadge.textContent = weather.description;

  header.appendChild(title);
  header.appendChild(conditionBadge);
  card.appendChild(header);

  // --- Temperature & Icon Row ---
  const tempRow = document.createElement('div');
  tempRow.className = 'popup-temp-row';

  const tempVal = document.createElement('div');
  tempVal.className = 'popup-temp-val';
  tempVal.textContent = `${weather.temp}°C`;

  const iconImg = document.createElement('img');
  iconImg.className = 'popup-weather-icon';
  iconImg.src = weather.iconUrl;
  iconImg.alt = `${weather.description} icon`;
  iconImg.width = 64;
  iconImg.height = 64;

  tempRow.appendChild(tempVal);
  tempRow.appendChild(iconImg);
  card.appendChild(tempRow);

  // --- Details Grid (Humidity, Wind, Clouds) ---
  const detailsGrid = document.createElement('div');
  detailsGrid.className = 'popup-details-grid';

  const details = [
    { label: 'Humidity', value: `${weather.humidity}%` },
    { label: 'Wind Speed', value: `${weather.windSpeed} m/s` },
    { label: 'Cloudiness', value: `${weather.cloudiness}%` },
    { label: 'Condition', value: weather.condition },
  ];

  details.forEach(({ label, value }) => {
    const item = document.createElement('div');
    item.className = 'popup-detail-item';

    const lbl = document.createElement('span');
    lbl.className = 'detail-label';
    lbl.textContent = label;

    const val = document.createElement('span');
    val.className = 'detail-value';
    val.textContent = value;

    item.appendChild(lbl);
    item.appendChild(val);
    detailsGrid.appendChild(item);
  });
  card.appendChild(detailsGrid);

  // --- Action Buttons (Share & Favorite) ---
  const actionsRow = document.createElement('div');
  actionsRow.className = 'popup-actions-row';

  // Share button
  const shareBtn = document.createElement('button');
  shareBtn.type = 'button';
  shareBtn.className = 'popup-btn popup-btn-share';
  shareBtn.textContent = '🔗 Share Weather';
  if (typeof onShareClick === 'function') {
    shareBtn.addEventListener('click', () => onShareClick(weather));
  }

  // Favorite button
  const favBtn = document.createElement('button');
  favBtn.type = 'button';
  favBtn.className = `popup-btn popup-btn-fav ${isFavorite ? 'active' : ''}`;
  favBtn.textContent = isFavorite ? '★ Favorited' : '☆ Save Favorite';
  if (typeof onFavoriteClick === 'function') {
    favBtn.addEventListener('click', () => {
      const newStatus = onFavoriteClick(weather);
      favBtn.classList.toggle('active', newStatus);
      favBtn.textContent = newStatus ? '★ Favorited' : '☆ Save Favorite';
    });
  }

  actionsRow.appendChild(shareBtn);
  actionsRow.appendChild(favBtn);
  card.appendChild(actionsRow);

  return card;
}
