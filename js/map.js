export const INITIAL_COORDINATES = {
  lat: 15.5007,
  lon: 32.5599,
  zoom: 6,
};

let mapInstance = null;
let currentMarker = null;

export function initMap(containerId = 'map') {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Map container with ID "${containerId}" was not found in the DOM.`);
  }

  mapInstance = L.map(containerId, {
    center: [INITIAL_COORDINATES.lat, INITIAL_COORDINATES.lon],
    zoom: INITIAL_COORDINATES.zoom,
    zoomControl: true,
  });

  const osmTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

  L.tileLayer(osmTileUrl, {
    maxZoom: 19,
    attribution: osmAttribution,
  }).addTo(mapInstance);

  return mapInstance;
}

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

export function setWeatherMarker(lat, lon, popupContent) {
  if (!mapInstance) {
    console.error('Cannot set marker: Map instance is not initialized.');
    return null;
  }

  if (currentMarker) {
    mapInstance.removeLayer(currentMarker);
    currentMarker = null;
  }

  currentMarker = L.marker([lat, lon]).addTo(mapInstance);

  if (popupContent) {
    currentMarker.bindPopup(popupContent, {
      maxWidth: 320,
      minWidth: 260,
      className: 'custom-weather-popup',
    }).openPopup();
  }

  return currentMarker;
}

export function getMap() {
  return mapInstance;
}
