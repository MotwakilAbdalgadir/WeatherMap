import { t } from './i18n.js';

const searchBtn = document.getElementById('search-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const errorBanner = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

export function showLoading() {
  if (loadingIndicator) {
    loadingIndicator.classList.remove('hidden');
  }
  if (searchBtn) {
    searchBtn.disabled = true;
    const btnText = searchBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = t('searchingBtn');
  }
}

export function hideLoading() {
  if (loadingIndicator) {
    loadingIndicator.classList.add('hidden');
  }
  if (searchBtn) {
    searchBtn.disabled = false;
    const btnText = searchBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = t('searchBtn');
  }
}

export function showError(message) {
  if (errorBanner && errorText) {
    errorText.textContent = message;
    errorBanner.classList.remove('hidden');
  }
}

export function clearError() {
  if (errorBanner && errorText) {
    errorText.textContent = '';
    errorBanner.classList.add('hidden');
  }
}

export function buildWeatherPopupElement(weather, onShareClick, onFavoriteClick, isFavorite = false) {
  const card = document.createElement('div');
  card.className = 'weather-popup-card';

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

  const detailsGrid = document.createElement('div');
  detailsGrid.className = 'popup-details-grid';

  const details = [
    { label: t('humidity'), value: `${weather.humidity}%` },
    { label: t('windSpeed'), value: `${weather.windSpeed} ${t('unitsWind')}` },
    { label: t('cloudiness'), value: `${weather.cloudiness}%` },
    { label: t('condition'), value: weather.condition },
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

  const actionsRow = document.createElement('div');
  actionsRow.className = 'popup-actions-row';

  const shareBtn = document.createElement('button');
  shareBtn.type = 'button';
  shareBtn.className = 'popup-btn popup-btn-share';
  shareBtn.textContent = t('shareWeather');
  if (typeof onShareClick === 'function') {
    shareBtn.addEventListener('click', () => onShareClick(weather));
  }

  const favBtn = document.createElement('button');
  favBtn.type = 'button';
  favBtn.className = `popup-btn popup-btn-fav ${isFavorite ? 'active' : ''}`;
  favBtn.textContent = isFavorite ? t('favorited') : t('saveFavorite');
  if (typeof onFavoriteClick === 'function') {
    favBtn.addEventListener('click', () => {
      const newStatus = onFavoriteClick(weather);
      favBtn.classList.toggle('active', newStatus);
      favBtn.textContent = newStatus ? t('favorited') : t('saveFavorite');
    });
  }

  actionsRow.appendChild(shareBtn);
  actionsRow.appendChild(favBtn);
  card.appendChild(actionsRow);

  return card;
}
