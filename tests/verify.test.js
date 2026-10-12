const fs = require('fs');

console.log('--- Verifying WeatherMap Project Foundation ---');

const html = fs.readFileSync('index.html', 'utf8');
console.log('✓ index.html has id="map":', html.includes('id="map"'));
console.log('✓ index.html has id="search-form":', html.includes('id="search-form"'));
console.log('✓ index.html has module script:', html.includes('type="module" src="js/app.js"'));
console.log('✓ index.html has Leaflet CSS link:', html.includes('leaflet.css'));
console.log('✓ index.html has Leaflet JS script:', html.includes('leaflet.js'));

const css = fs.readFileSync('css/style.css', 'utf8');
console.log('✓ style.css has 70vh height requirement:', css.includes('70vh'));
console.log('✓ style.css has Roboto font:', css.includes('Roboto'));
console.log('✓ style.css has navy border:', css.includes('--color-navy-border'));

const mapJs = fs.readFileSync('js/map.js', 'utf8');
console.log('✓ map.js has Khartoum lat 15.5007:', mapJs.includes('15.5007'));
console.log('✓ map.js has Khartoum lon 32.5599:', mapJs.includes('32.5599'));
console.log('✓ map.js has initial zoom 6:', mapJs.includes('zoom: 6'));
console.log('✓ map.js has OpenStreetMap attribution:', mapJs.includes('OpenStreetMap'));

const geoJs = fs.readFileSync('js/geocoding.js', 'utf8');
console.log('✓ geocoding.js has getCoordinates():', geoJs.includes('getCoordinates'));
console.log('✓ geocoding.js handles Nominatim:', geoJs.includes('nominatim.openstreetmap.org'));

const weatherJs = fs.readFileSync('js/weather.js', 'utf8');
console.log('✓ weather.js has getWeather():', weatherJs.includes('getWeather'));
console.log('✓ weather.js has units=metric:', weatherJs.includes('metric'));

const favJs = fs.readFileSync('js/favorites.js', 'utf8');
console.log('✓ favorites.js has localStorage handling:', favJs.includes('localStorage'));

console.log('--- Verification Complete ---');
