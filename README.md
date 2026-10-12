# WeatherMap SPA — Interactive Weather Dashboard

An interactive Single Page Application (SPA) built with pure Vanilla JavaScript (ES6+), Semantic HTML5, CSS3, and Leaflet.js. WeatherMap allows users to search any geographic location worldwide, resolve its coordinates dynamically, display the location on an interactive map, and view real-time meteorological conditions inside an interactive map popup.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Prerequisites](#prerequisites)
6. [Obtaining an OpenWeatherMap API Key](#obtaining-an-openweathermap-api-key)
7. [API Key Configuration & Security](#api-key-configuration--security)
8. [How to Run Locally](#how-to-run-locally)
9. [Architecture & Asynchronous Dataflow](#architecture--asynchronous-dataflow)
   - [Geocoding Flow](#geocoding-flow)
   - [Weather API Flow](#weather-api-flow)
   - [Leaflet Map Lifecycle](#leaflet-map-lifecycle)
10. [Error Handling Strategy](#error-handling-strategy)
11. [Bonus Features](#bonus-features)
12. [Known Limitations & Public API Considerations](#known-limitations--public-api-considerations)
13. [GitHub Pages Deployment Guide](#github-pages-deployment-guide)
14. [Repository & Demo Links](#repository--demo-links)

---

## 🌟 Project Overview
WeatherMap delivers a seamless meteorological experience without any full page reloads. Users enter a location query (city, address, or region), which is resolved to high-precision geographic coordinates using OpenStreetMap Nominatim. Weather data is retrieved from the OpenWeatherMap Current Weather API, and Leaflet.js pans smoothly (`flyTo`) to the destination, placing a marker with a customized, XSS-safe weather popup.

---

## ✨ Key Features
- **Zero Full Page Reloads:** 100% Single Page Application architecture.
- **Initial Focus on Khartoum:** Starts centered on Khartoum, Sudan (`15.5007° N, 32.5599° E`) at zoom level 6.
- **Strict 70vh Map Canvas:** Exactly sized map container with charcoal/navy border and subtle drop shadow.
- **Interactive Leaflet Map:** Pan, zoom, and smooth transitions powered by OpenStreetMap tiles.
- **Marker Lifecycle Management:** Automatically reuses or replaces markers to prevent marker clutter.
- **Safe DOM Rendering:** Avoids `innerHTML` for dynamic external content, eliminating XSS vulnerabilities.
- **Comprehensive Error Handling:** User-friendly alerts for empty queries, unknown places, network issues, and invalid API keys.
- **Loading Indicators:** Visible loading spinner while requests are pending, with button debounce.
- **Bonus — Weather Sharing:** Uses the modern Web Share API (`navigator.share`), with automatic fallback to Clipboard API (`navigator.clipboard.writeText`).
- **Bonus — Favorite Locations:** Save, display, select, and remove favorite cities stored persistently in `localStorage`.

---

## 🛠️ Technology Stack
- **Semantic HTML5:** Accessible layout (`<header>`, `<main>`, `<section>`, `<footer>`, ARIA attributes).
- **Pure Vanilla CSS3:** Custom properties (CSS variables), responsive Grid/Flexbox layouts, Google Fonts (Roboto), no third-party CSS frameworks.
- **Pure Vanilla JavaScript (ES6+ Modules):** Native ES Modules (`import`/`export`), `async/await`, Fetch API, DOM APIs.
- **Leaflet.js (v1.9.4):** Open-source interactive map library (explicitly permitted).
- **OpenStreetMap Tiles:** Free geographical tile mapping layer.
- **Nominatim API:** OpenStreetMap Geocoding API for coordinate resolution.
- **OpenWeatherMap Current Weather API:** Global real-time meteorological metrics.
- **Web Storage & Capabilities API:** `localStorage`, Web Share API, Clipboard API.

> **Strict Compliance Note:** No forbidden frameworks or libraries (No React, Vue, Angular, Svelte, jQuery, D3.js) are used.

---

## 📁 Folder Structure
```text
weathermap/
├── index.html              # Semantic HTML5 document structure
├── css/
│   └── style.css           # Responsive styling, layout, and UI components
├── js/
│   ├── app.js              # Application entry point, event wiring & orchestration
│   ├── geocoding.js        # Nominatim location lookup and coordinate parsing
│   ├── weather.js          # OpenWeatherMap API integration and data transformation
│   ├── map.js              # Leaflet initialization, markers, and transitions
│   ├── ui.js               # Loading spinners, error banners, and safe DOM popup generator
│   └── favorites.js        # LocalStorage persistence and favorites UI management
├── assets/
│   └── icons/              # Local icons and graphical assets
├── README.md               # Complete project documentation
├── LICENSE                 # Open-source MIT license
└── .gitignore              # Git ignore rules for OS and local override files
```

---

## ⚙️ Prerequisites
- A modern web browser supporting ES6 Modules and Fetch API (Chrome, Firefox, Safari, Edge).
- A local HTTP server (such as Node.js `npx serve`, Python `http.server`, or the VS Code Live Server extension).
- A free API key from [OpenWeatherMap](https://openweathermap.org/api).

---

## 🔑 Obtaining an OpenWeatherMap API Key
1. Visit [OpenWeatherMap Sign Up](https://home.openweathermap.org/users/sign_up) and create a free account.
2. Confirm your email address.
3. Navigate to **API Keys** in your user dashboard.
4. Copy the default key or generate a new key named `WeatherMap`.
> *Note: Newly created OpenWeatherMap keys typically require 10–30 minutes to activate globally across OpenWeatherMap's edge servers.*

---

## 🔒 API Key Configuration & Security

### 1. Configuration Options
You can configure your API key in either of two ways:

#### Option A: In `js/weather.js`
Open `js/weather.js` and replace the placeholder:
```javascript
export const OPENWEATHER_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

#### Option B: Via Browser LocalStorage (Zero Code Changes)
Open your browser's Developer Console (`F12`) and run:
```javascript
localStorage.setItem('owm_custom_api_key', 'YOUR_ACTUAL_API_KEY_HERE');
```
The application checks `localStorage` first before falling back to the configured constant.

### 2. Client-Side Security Architectural Note
> ⚠️ **Important Security Notice:**  
> In pure client-side applications (SPA without a backend server), **any API key embedded in JavaScript or environment files sent to the browser is inherently visible** to end-users via browser Developer Tools (Network tab and Source tab). Placing a key in a `.env` file does not protect it in a static frontend because client builds expose environment variables in bundled code.  
> For production enterprise software, the recommended architecture is to route requests through a secure backend proxy server (e.g., Node.js / Express / AWS Lambda) that holds the private key in server-side environment variables and sets rate limits and CORS origins. For the scope of this assignment, client-side configuration is used in accordance with the specification.

---

## 🚀 How to Run Locally

Because WeatherMap uses native **ES6 Modules** (`import` and `export`), browsers enforce CORS security policies that block loading modules directly via the `file://` protocol. You must serve the files through a local HTTP server.

### Method 1: Using Node.js (Recommended)
From the project directory, run:
```bash
npx serve .
```
Or start a minimal one-liner HTTP server:
```bash
node -e "const http=require('http'),fs=require('fs'),path=require('path');http.createServer((req,res)=>{let f=path.join('.',req.url==='/'?'index.html':req.url);fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end('Not Found')}else{let ext=path.extname(f);let t={'css':'text/css','js':'text/javascript','html':'text/html'}[ext.slice(1)]||'text/plain';res.writeHead(200,{'Content-Type':t});res.end(d)}})}).listen(3000,()=>console.log('Serving at http://localhost:3000'));"
```
Then navigate to: `http://localhost:3000`

### Method 2: Using VS Code Live Server
1. Open the `WeatherMap` folder in Visual Studio Code.
2. Install the **Live Server** extension by Ritwick Dey.
3. Right-click `index.html` and choose **"Open with Live Server"**.

---

## 🔄 Architecture & Asynchronous Dataflow

### Geocoding Flow (`js/geocoding.js`)
```text
User Input ("Khartoum")
   │
   ▼
encodeURIComponent() & URLSearchParams
   │
   ▼
Fetch https://nominatim.openstreetmap.org/search?q=...&format=json&limit=1
   │
   ├─► Network Error ────► Throw "Network error: Unable to reach geocoding service"
   ├─► Empty Array   ────► Throw "Location '...' was not found"
   └─► Success       ────► Parse lat, lon (floats) & display_name
```

### Weather API Flow (`js/weather.js`)
```text
Coordinates ({ lat: 15.50, lon: 32.55 })
   │
   ▼
Fetch https://api.openweathermap.org/data/2.5/weather?lat=...&lon=...&units=metric&appid=...
   │
   ├─► HTTP 401 ────► Throw "Invalid OpenWeatherMap API key"
   ├─► HTTP 429 ────► Throw "Rate limit exceeded"
   └─► HTTP 200 ────► Validate fields & construct structured weather object:
                      { temp (°C), condition, description, iconUrl, humidity, windSpeed, cloudiness }
```

### Leaflet Map Lifecycle (`js/map.js`)
1. **Bootstrap:** `L.map('map')` centered on `[15.5007, 32.5599]` with zoom `6`.
2. **Transition:** When search completes, `map.flyTo([lat, lon], 10, { duration: 1.5 })`.
3. **Marker Reuse:** Existing marker layer is safely removed before new marker creation to eliminate duplication.
4. **Safe Popup:** Constructed dynamically using `document.createElement()` and `textContent` to prevent HTML injection attacks.

---

## 🛡️ Error Handling Strategy
- **Empty Query:** Validated before making any network requests; user is prompted to enter a city name.
- **Location Not Found:** Clear alert showing that the query yielded no geographical results.
- **Missing / Invalid API Key:** Explicit alert informing the developer/user to insert a valid OpenWeatherMap key.
- **Network Outage:** Catches fetch failures and reports connectivity issues.
- **Stale / Overlapping Requests:** Uses `AbortController` to cancel pending HTTP operations when a new search starts.
- **UI Reset:** `try / catch / finally` guarantees loading states are cleared and buttons re-enabled on either success or failure.

---

## 🎁 Bonus Features
1. **Weather Sharing:**
   - Detects `navigator.share()` for mobile / supported desktop native share dialogues.
   - Falls back gracefully to `navigator.clipboard.writeText()` with user notification.
2. **Favorite Cities Management:**
   - Saves locations to `localStorage` under `weathermap_favorites`.
   - Prevents duplicate favorites using normalized coordinate IDs (`lat.toFixed(3)_lon.toFixed(3)`).
   - One-click loading of saved cities directly on the map.
   - Removable favorites with instant DOM updates.

---

## ⚠️ Known Limitations & Public API Considerations
- **Nominatim Usage Policy:** OpenStreetMap Nominatim is a free community service. Its usage policy requires reasonable request volumes (no rapid autocomplete-as-you-type, max 1 request/sec). WeatherMap complies by only requesting coordinates upon explicit form submission.
- **OpenWeatherMap Free Tier:** The free tier permits up to 60 calls/minute and 1,000,000 calls/month.

---

## 🌐 GitHub Pages Deployment Guide
1. Create a new GitHub repository named `WeatherMap`.
2. In your local project directory, add your GitHub repository as remote:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/WeatherMap.git
   git branch -M main
   git push -u origin main
   ```
3. In GitHub, go to **Settings** > **Pages**.
4. Under **Branch**, select `main` and root `/`, then click **Save**.
5. Your live app will be published at:  
   `https://<YOUR_USERNAME>.github.io/WeatherMap/`

---

## 🔗 Repository & Demo Links
- **GitHub Repository:** `[Insert Repository URL]`
- **Live GitHub Pages Demo:** `[Insert Live Demo URL]`
- **License:** MIT
