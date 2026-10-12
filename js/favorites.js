/**
 * favorites.js - Favorite Locations Management
 * Persists favorite cities in localStorage with duplicate prevention,
 * graceful JSON error recovery, and safe DOM rendering.
 */

const STORAGE_KEY = 'weathermap_favorites';

/**
 * Loads favorite locations array safely from localStorage.
 * @returns {Array<Object>} List of favorite locations.
 */
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
    // Graceful recovery: reset corrupt data
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

/**
 * Persists favorites array to localStorage.
 * @param {Array<Object>} favoritesList - Array of favorite location objects.
 */
function persistFavorites(favoritesList) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesList));
  } catch (err) {
    console.error('Failed to write favorites to localStorage:', err);
  }
}

/**
 * Generates a stable unique identifier for a location based on normalized coordinates.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {string} ID string
 */
export function getFavoriteId(lat, lon) {
  return `${lat.toFixed(3)}_${lon.toFixed(3)}`;
}

/**
 * Checks if a location is already saved in favorites.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean}
 */
export function isFavorite(lat, lon) {
  const id = getFavoriteId(lat, lon);
  const list = getFavorites();
  return list.some(item => getFavoriteId(item.lat, item.lon) === id);
}

/**
 * Adds a location to favorites, preventing duplicates.
 * @param {Object} location - Location object { name, lat, lon }
 * @returns {boolean} True if added, false if already exists.
 */
export function addFavorite(location) {
  if (!location || typeof location.lat !== 'number' || typeof location.lon !== 'number') {
    return false;
  }

  const list = getFavorites();
  const id = getFavoriteId(location.lat, location.lon);

  if (list.some(item => getFavoriteId(item.lat, item.lon) === id)) {
    return false; // Already saved
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

/**
 * Removes a location from favorites by its ID.
 * @param {string} id - The favorite ID
 * @returns {boolean} True if removed.
 */
export function removeFavorite(id) {
  const list = getFavorites();
  const updated = list.filter(item => item.id !== id);
  if (updated.length !== list.length) {
    persistFavorites(updated);
    return true;
  }
  return false;
}

/**
 * Toggles a favorite location (adds if not present, removes if present).
 * @param {Object} location - Location object { name, lat, lon }
 * @returns {boolean} New favorite state (true = favorited, false = removed)
 */
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

/**
 * Safely renders the list of favorites in the UI using DOM methods (no innerHTML).
 *
 * @param {Function} onSelect - Callback when a favorite city is selected to view weather.
 * @param {Function} onRemove - Callback when a favorite city is removed.
 */
export function renderFavoritesUI(onSelect, onRemove) {
  const listContainer = document.getElementById('favorites-list');
  const emptyState = document.getElementById('favorites-empty');
  const countBadge = document.getElementById('favorites-count');

  if (!listContainer) return;

  const favorites = getFavorites();

  if (countBadge) {
    countBadge.textContent = `(${favorites.length})`;
  }

  // Clear existing items safely
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

    // Select Button
    const selectBtn = document.createElement('button');
    selectBtn.type = 'button';
    selectBtn.className = 'favorite-select-btn';
    selectBtn.textContent = fav.name;
    selectBtn.title = `Load weather for ${fav.name}`;
    selectBtn.addEventListener('click', () => {
      if (typeof onSelect === 'function') {
        onSelect(fav);
      }
    });

    // Remove Button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'favorite-remove-btn';
    removeBtn.textContent = '✕';
    removeBtn.title = `Remove ${fav.name} from favorites`;
    removeBtn.setAttribute('aria-label', `Remove ${fav.name} from favorites`);
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
