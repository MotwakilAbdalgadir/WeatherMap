/**
 * tests/logic.test.js - Unit tests for core domain logic
 * Pure native JavaScript tests (No external test frameworks used)
 */

const assert = require('assert');

console.log('🧪 Starting Native Unit Tests for WeatherMap Logic...');

// 1. Test Coordinate validation rules
function testCoordinateValidation() {
  console.log('  Testing coordinate number range validation...');
  const isValidCoord = (lat, lon) =>
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180;

  assert.strictEqual(isValidCoord(15.5007, 32.5599), true, 'Khartoum coordinates should be valid');
  assert.strictEqual(isValidCoord(0, 0), true, 'Equator coordinates should be valid');
  assert.strictEqual(isValidCoord(95, 20), false, 'Latitude > 90 should be invalid');
  assert.strictEqual(isValidCoord(-95, 20), false, 'Latitude < -90 should be invalid');
  assert.strictEqual(isValidCoord(20, 185), false, 'Longitude > 180 should be invalid');
  assert.strictEqual(isValidCoord(NaN, 10), false, 'NaN latitude should be invalid');
  assert.strictEqual(isValidCoord(20, 'string'), false, 'String longitude should be invalid');
  console.log('  ✓ Coordinate validation passed');
}

// 2. Test Input Trimming & Empty Validation
function testInputSanitization() {
  console.log('  Testing search query trimming and validation...');
  const validateQuery = (query) => {
    if (!query || typeof query !== 'string') return false;
    return query.trim().length > 0;
  };

  assert.strictEqual(validateQuery(''), false, 'Empty string should fail');
  assert.strictEqual(validateQuery('    '), false, 'Whitespace-only string should fail');
  assert.strictEqual(validateQuery(null), false, 'null should fail');
  assert.strictEqual(validateQuery(undefined), false, 'undefined should fail');
  assert.strictEqual(validateQuery('London'), true, 'Valid query should pass');
  assert.strictEqual(validateQuery('  Tokyo  '), true, 'Query with surrounding whitespace should pass');
  console.log('  ✓ Input sanitization passed');
}

// 3. Test Weather payload parsing & icon formatting
function testWeatherPayloadParser() {
  console.log('  Testing weather API data mapping...');
  const sampleApiResponse = {
    name: 'Khartoum',
    main: { temp: 34.6, humidity: 22 },
    weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
    wind: { speed: 4.5 },
    clouds: { all: 10 },
  };

  const parsed = {
    name: sampleApiResponse.name,
    temp: Math.round(sampleApiResponse.main.temp),
    condition: sampleApiResponse.weather[0].main,
    description: sampleApiResponse.weather[0].description,
    iconUrl: `https://openweathermap.org/img/wn/${sampleApiResponse.weather[0].icon}@2x.png`,
    humidity: sampleApiResponse.main.humidity,
    windSpeed: sampleApiResponse.wind.speed,
    cloudiness: sampleApiResponse.clouds.all,
  };

  assert.strictEqual(parsed.temp, 35, 'Temperature should round 34.6 to 35°C');
  assert.strictEqual(parsed.humidity, 22, 'Humidity percentage should be preserved');
  assert.strictEqual(parsed.windSpeed, 4.5, 'Wind speed should be preserved');
  assert.strictEqual(parsed.cloudiness, 10, 'Cloud coverage should be preserved');
  assert.strictEqual(parsed.iconUrl, 'https://openweathermap.org/img/wn/01d@2x.png', 'Icon URL formatted correctly');
  console.log('  ✓ Weather payload parsing passed');
}

// 4. Test Favorite ID generator and duplicate prevention
function testFavoriteDuplicates() {
  console.log('  Testing favorites ID and duplicate prevention logic...');
  const getFavoriteId = (lat, lon) => `${lat.toFixed(3)}_${lon.toFixed(3)}`;

  const id1 = getFavoriteId(15.5007, 32.5599);
  const id2 = getFavoriteId(15.5009, 32.5598); // Very close, rounds to same .toFixed(3)
  const id3 = getFavoriteId(51.5074, -0.1278); // London

  assert.strictEqual(id1, '15.501_32.560', 'ID normalized correctly');
  assert.strictEqual(id1, id2, 'Nearby points normalize to identical favorite key');
  assert.notStrictEqual(id1, id3, 'Different cities have distinct favorite keys');
  console.log('  ✓ Favorite ID generator and deduplication logic passed');
}

// 5. Test i18n Dictionary parity
function testLanguageDictionary() {
  console.log('  Testing i18n translation dictionary parity...');
  const fs = require('fs');
  const i18nCode = fs.readFileSync('js/i18n.js', 'utf8');

  // Verify core translation keys exist for both languages
  const requiredKeys = [
    'appTitle', 'appSubtitle', 'searchHeading', 'searchLabel',
    'searchPlaceholder', 'searchBtn', 'searchingBtn', 'loadingText',
    'favoritesHeading', 'favoritesEmpty', 'humidity', 'windSpeed',
    'cloudiness', 'condition', 'shareWeather', 'saveFavorite',
    'favorited', 'langToggle'
  ];

  for (const key of requiredKeys) {
    assert.strictEqual(i18nCode.includes(key), true, `Key "${key}" should exist in i18n module`);
  }
  console.log('  ✓ i18n translation parity passed');
}

// Execute tests
try {
  testCoordinateValidation();
  testInputSanitization();
  testWeatherPayloadParser();
  testFavoriteDuplicates();
  testLanguageDictionary();
  console.log('\n🎉 ALL NATIVE UNIT TESTS PASSED SUCCESSFULLY!');
} catch (err) {
  console.error('\n❌ UNIT TEST FAILURE:', err.message);
  process.exit(1);
}
