import { t } from './i18n.js';

const STORAGE_KEY = 'weathermap_favorites';

export function getFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(item => item && item.name && typeof item.lat === 'number' && typeof item.lon === 'number');
    }
    return [];
  } catch (err) {
    console.error('Failed to parse favorites from localStorage:', err);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function persistFavorites(favoritesList) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesList));
  } catch (err) {
    console.error('Failed to write favorites to localStorage:', err);
  }
}

export function getFavoriteId(lat, lon) {
  return `${lat.toFixed(3)}_${lon.toFixed(3)}`;
}

export function isFavorite(lat, lon) {
  const id = getFavoriteId(lat, lon);
  const list = getFavorites();
  return list.some(item => getFavoriteId(item.lat, item.lon) === id);
}

export function addFavorite(location) {
  if (!location || typeof location.lat !== 'number' || typeof location.lon !== 'number') {
    return false;
  }

  const list = getFavorites();
  const id = getFavoriteId(location.lat, location.lon);

  if (list.some(item => getFavoriteId(item.lat, item.lon) === id)) {
    return false;
  }

  const newItem = {
    id,
    name: location.name,
    lat: location.lat,
    lon: location.lon,
    addedAt: new Date().toISOString(),
  };

  list.unshift(newItem);
  persistFavorites(list);
  return true;
}

export function removeFavorite(id) {
  const list = getFavorites();
  const updated = list.filter(item => item.id !== id);
  if (updated.length !== list.length) {
    persistFavorites(updated);
    return true;
  }
  return false;
}

export function toggleFavorite(location) {
  const id = getFavoriteId(location.lat, location.lon);
  if (isFavorite(location.lat, location.lon)) {
    removeFavorite(id);
    return false;
  } else {
    addFavorite(location);
    return true;
  }
}

export function renderFavoritesUI(onSelect, onRemove) {
  const listContainer = document.getElementById('favorites-list');
  const emptyState = document.getElementById('favorites-empty');
  const countBadge = document.getElementById('favorites-count');

  if (!listContainer) return;

  const favorites = getFavorites();

  if (countBadge) {
    countBadge.textContent = `(${favorites.length})`;
  }

  while (listContainer.firstChild) {
    listContainer.removeChild(listContainer.firstChild);
  }

  if (favorites.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    listContainer.classList.add('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  listContainer.classList.remove('hidden');

  favorites.forEach(fav => {
    const li = document.createElement('li');
    li.className = 'favorite-item';

    const selectBtn = document.createElement('button');
    selectBtn.type = 'button';
    selectBtn.className = 'favorite-select-btn';
    selectBtn.textContent = fav.name;
    selectBtn.title = `${t('favoritesTitleAttr')} ${fav.name}`;
    selectBtn.addEventListener('click', () => {
      if (typeof onSelect === 'function') {
        onSelect(fav);
      }
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'favorite-remove-btn';
    removeBtn.textContent = '✕';
    removeBtn.title = `${t('favoritesRemoveAttr')} (${fav.name})`;
    removeBtn.setAttribute('aria-label', `${t('favoritesRemoveAttr')} (${fav.name})`);
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFavorite(fav.id);
      renderFavoritesUI(onSelect, onRemove);
      if (typeof onRemove === 'function') {
        onRemove(fav);
      }
    });

    li.appendChild(selectBtn);
    li.appendChild(removeBtn);
    listContainer.appendChild(li);
  });
}
