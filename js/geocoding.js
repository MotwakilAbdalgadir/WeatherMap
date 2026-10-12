/**
 * geocoding.js - Geographic Location Resolution
 * Uses the OpenStreetMap Nominatim Geocoding API to resolve location names into coordinates.
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Resolves a human-readable location name or address into geographic coordinates.
 *
 * @param {string} locationName - The place name, city, or address entered by the user.
 * @param {AbortSignal} [signal] - Optional AbortSignal to cancel pending requests.
 * @returns {Promise<{lat: number, lon: number, name: string}>} Resolved location object.
 * @throws {Error} Descriptive error on empty query, network failure, or not found.
 */
export async function getCoordinates(locationName, signal) {
  // Validate input
  if (!locationName || typeof locationName !== 'string') {
    throw new Error('Please enter a location name to search.');
  }

  const trimmedQuery = locationName.trim();
  if (trimmedQuery.length === 0) {
    throw new Error('Search input cannot be empty.');
  }

  // Proper URL encoding of user query
  const queryParams = new URLSearchParams({
    q: trimmedQuery,
    format: 'json',
    limit: '1',
    addressdetails: '1',
  });

  const requestUrl = `${NOMINATIM_BASE_URL}?${queryParams.toString()}`;

  let response;
  try {
    // Respect public Nominatim usage policy: custom headers and limit 1
    response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err; // Allow abort signal to propagate
    }
    console.error('Geocoding network error:', err);
    throw new Error('Network error: Unable to reach the geocoding service. Please check your internet connection.');
  }

  // Check HTTP response status
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Geocoding rate limit reached. Please wait a moment before trying again.');
    }
    throw new Error(`Geocoding service error (HTTP ${response.status}). Please try again later.`);
  }

  // Parse JSON response
  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    console.error('Geocoding JSON parse error:', parseError);
    throw new Error('Failed to parse geocoding response data.');
  }

  // Validate results array
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Location "${trimmedQuery}" was not found. Please check your spelling and try again.`);
  }

  const primaryResult = data[0];

  // Convert coordinate strings to numbers
  const lat = parseFloat(primaryResult.lat);
  const lon = parseFloat(primaryResult.lon);

  // Validate numeric validity and coordinate ranges
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new Error('Received invalid geographic coordinates from the geocoding provider.');
  }

  // Format readable location name
  const name = primaryResult.display_name || trimmedQuery;

  return {
    lat,
    lon,
    name,
  };
}
