const key = '7c3734382baaf153d9e200d500c74220';
const url = `https://api.openweathermap.org/data/2.5/weather?lat=15.5007&lon=32.5599&appid=${key}&units=metric`;

console.log('📡 Testing live OpenWeatherMap API key activation...');
console.log(`Key: ${key}`);

fetch(url)
  .then(async res => {
    const data = await res.json();
    if (res.status === 200) {
      console.log('\n✅ KEY IS ACTIVE AND WORKING!');
      console.log(`Location: ${data.name}`);
      console.log(`Temperature: ${data.main.temp}°C`);
      console.log(`Weather: ${data.weather[0].main} (${data.weather[0].description})`);
    } else if (res.status === 401) {
      console.log('\n⏳ HTTP 401: Key not yet activated on OpenWeatherMap edge servers.');
      console.log('Note: OpenWeatherMap free keys typically take between 10 to 60 minutes after registration to propagate.');
      console.log('Also ensure your account email has been confirmed at openweathermap.org.');
    } else {
      console.log(`\n⚠️ Received HTTP ${res.status}:`, data);
    }
  })
  .catch(err => {
    console.error('Network connection error:', err.message);
  });
