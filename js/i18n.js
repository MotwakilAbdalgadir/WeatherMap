/**
 * i18n.js - Internationalization Module (English & Arabic)
 * Handles language switching, directionality (LTR/RTL), translation dictionaries,
 * and persistence in localStorage.
 */

const STORAGE_LANG_KEY = 'weathermap_lang';

export const translations = {
  en: {
    appTitle: 'WeatherMap',
    appSubtitle: 'Search any location worldwide to view real-time meteorological conditions',
    searchHeading: 'Location Search and Controls',
    searchLabel: 'Search Location',
    searchPlaceholder: 'e.g. Khartoum, London, Tokyo...',
    searchBtn: 'Get Weather',
    searchingBtn: 'Searching...',
    loadingText: 'Fetching location and weather data...',
    favoritesHeading: 'Saved Locations',
    favoritesEmpty: 'No saved locations yet. Search for a city to pin it here.',
    favoritesTitleAttr: 'Load weather for',
    favoritesRemoveAttr: 'Remove from favorites',
    humidity: 'Humidity',
    windSpeed: 'Wind Speed',
    cloudiness: 'Cloudiness',
    condition: 'Condition',
    shareWeather: '🔗 Share Weather',
    saveFavorite: '☆ Save Favorite',
    favorited: '★ Favorited',
    shareSummaryPrefix: 'Weather in',
    shareClipboardAlert: 'Weather summary copied to clipboard:\n\n',
    emptyInputError: 'Please enter a location name before searching.',
    locationNotFound: 'Location was not found. Please check spelling.',
    langToggle: 'العربية',
    footerText: 'WeatherMap SPA • Data provided by OpenWeatherMap & OpenStreetMap',
    unitsWind: 'm/s',
  },
  ar: {
    appTitle: 'خريطة الطقس (WeatherMap)',
    appSubtitle: 'ابحث عن أي موقع حول العالم لعرض الأحوال الجوية اللحظية على الخريطة',
    searchHeading: 'البحث عن الموقع والتحكم',
    searchLabel: 'البحث عن موقع أو مدينة',
    searchPlaceholder: 'مثال: الخرطوم، مكة، لندن، طوكيو...',
    searchBtn: 'عرض الطقس',
    searchingBtn: 'جاري البحث...',
    loadingText: 'جاري جلب بيانات الموقع وحالة الطقس...',
    favoritesHeading: 'الأماكن المحفوظة',
    favoritesEmpty: 'لا توجد أماكن محفوظة بعد. ابحث عن أي مدينة لحفظها هنا.',
    favoritesTitleAttr: 'عرض الطقس لـ',
    favoritesRemoveAttr: 'حذف من المفضلة',
    humidity: 'الرطوبة',
    windSpeed: 'سرعة الرياح',
    cloudiness: 'نسبة الغيوم',
    condition: 'الحالة',
    shareWeather: '🔗 مشاركة الطقس',
    saveFavorite: '☆ حفظ بالمفضلة',
    favorited: '★ تم الحفظ',
    shareSummaryPrefix: 'حالة الطقس في',
    shareClipboardAlert: 'تم نسخ ملخص الطقس إلى الحافظة بنجاح:\n\n',
    emptyInputError: 'يرجى إدخال اسم المدينة أو الموقع قبل البحث.',
    locationNotFound: 'تعذر العثور على الموقع المطلوب. يرجى التحقق من صحة الاسم.',
    langToggle: 'English',
    footerText: 'تطبيق خريطة الطقس • البيانات مقدمة من OpenWeatherMap و OpenStreetMap',
    unitsWind: 'م/ث',
  },
};

/**
 * Retrieves the currently active language code ('en' or 'ar').
 * @returns {string} Language code
 */
export function getCurrentLanguage() {
  const stored = localStorage.getItem(STORAGE_LANG_KEY);
  if (stored === 'ar' || stored === 'en') {
    return stored;
  }
  return 'ar'; // Default language: Arabic
}

/**
 * Returns the translated string for a given key.
 * @param {string} key - Translation key
 * @returns {string}
 */
export function t(key) {
  const lang = getCurrentLanguage();
  if (translations[lang] && typeof translations[lang][key] !== 'undefined') {
    return translations[lang][key];
  }
  // Fallback to Arabic, then English
  return (translations.ar && translations.ar[key]) || translations.en[key] || key;
}

/**
 * Sets the active language, updates HTML attributes (lang and dir),
 * updates all DOM elements containing [data-i18n] and [data-i18n-placeholder],
 * and persists the selection in localStorage.
 *
 * @param {'en'|'ar'} lang - Target language
 */
export function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'ar') {
    lang = 'ar';
  }

  localStorage.setItem(STORAGE_LANG_KEY, lang);

  // Update HTML document direction and language attribute
  const htmlEl = document.documentElement;
  htmlEl.setAttribute('lang', lang);
  htmlEl.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  // Translate all text elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Translate all input placeholders with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && translations[lang][key]) {
      el.setAttribute('placeholder', translations[lang][key]);
    }
  });

  // Update language toggle button label
  const toggleBtn = document.getElementById('lang-toggle-btn');
  if (toggleBtn) {
    toggleBtn.textContent = translations[lang].langToggle;
  }
}

/**
 * Toggles language between 'en' and 'ar'.
 * @returns {string} The newly selected language code.
 */
export function toggleLanguage() {
  const current = getCurrentLanguage();
  const next = current === 'en' ? 'ar' : 'en';
  setLanguage(next);
  return next;
}
