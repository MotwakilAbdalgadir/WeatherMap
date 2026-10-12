/**
 * map.js - Interactive Leaflet Map Management
 * Responsible for map initialization, tile layers, marker lifecycle, and popup binding.
 */

// Initial coordinates: Khartoum, Sudan as required by specification
export const INITIAL_COORDINATES = {
  lat: 15.5007,
  lon: 32.5599,
  zoom: 6,
};

// Module-level map and marker references
let mapInstance = null;
let currentMarker = null;

/**
 * Initializes the Leaflet map centered on Khartoum, Sudan.
 * @param {string} containerId - The HTML element ID of the map container.
 * @returns {L.Map} The initialized Leaflet map instance.
 */
export function initMap(containerId = 'map') {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Map container with ID "${containerId}" was not found in the DOM.`);
  }

  // Initialize Leaflet map
  mapInstance = L.map(containerId, {
    center: [INITIAL_COORDINATES.lat, INITIAL_COORDINATES.lon],
    zoom: INITIAL_COORDINATES.zoom,
    zoomControl: true,
  });

  // OpenStreetMap Tile Layer with mandatory attribution
  const osmTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

  L.tileLayer(osmTileUrl, {
    maxZoom: 19,
    attribution: osmAttribution,
  }).addTo(mapInstance);

  return mapInstance;
}

/**
 * Smoothly navigates the map to the specified coordinates.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} [zoom=10] - Target zoom level
 */
export function flyToLocation(lat, lon, zoom = 10) {
  if (!mapInstance) {
    console.error('Cannot pan: Map instance is not initialized.');
    return;
  }
  mapInstance.flyTo([lat, lon], zoom, {
    duration: 1.5,
    easeLinearity: 0.25,
  });
}

/**
 * Places or updates a single marker on the map with an attached popup.
 * Prevents marker duplication by removing or updating existing marker.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {HTMLElement|string} popupContent - DOM element or content to bind to the popup
 * @returns {L.Marker}
 */
export function setWeatherMarker(lat, lon, popupContent) {
  if (!mapInstance) {
    console.error('Cannot set marker: Map instance is not initialized.');
    return null;
  }

  // Remove existing marker if present to avoid marker duplication
  if (currentMarker) {
    mapInstance.removeLayer(currentMarker);
    currentMarker = null;
  }

  // Create new marker at specified coordinates
  currentMarker = L.marker([lat, lon]).addTo(mapInstance);

  // Bind popup and open it automatically
  if (popupContent) {
    currentMarker.bindPopup(popupContent, {
      maxWidth: 320,
      minWidth: 260,
      className: 'custom-weather-popup',
    }).openPopup();
  }

  return currentMarker;
}

/**
 * Retrieves the active Leaflet map instance.
 * @returns {L.Map|null}
 */
export function getMap() {
  return mapInstance;
}
