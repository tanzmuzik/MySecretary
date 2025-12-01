// Weather Widget Logic

// OpenWeatherMap API configuration
// ユーザーは自分のAPIキーを取得して、ここに設定する必要があります
// Get your free API key from: https://openweathermap.org/api
const API_KEY = 'bc86fd25ca10ab90bb0542588169f481';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Get DOM elements
const locationInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const refreshBtn = document.getElementById('refresh-btn');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const forecastList = document.getElementById('forecast-list');
const lastUpdated = document.getElementById('last-updated');
const errorMessage = document.getElementById('error-message');

// Weather icon mapping (OpenWeatherMap icon codes to emojis)
const weatherIcons = {
  '01d': '☀️',  // clear sky day
  '01n': '🌙',  // clear sky night
  '02d': '⛅',  // few clouds day
  '02n': '☁️',  // few clouds night
  '03d': '☁️',  // scattered clouds
  '03n': '☁️',
  '04d': '☁️',  // broken clouds
  '04n': '☁️',
  '09d': '🌧️',  // shower rain
  '09n': '🌧️',
  '10d': '🌦️',  // rain day
  '10n': '🌧️',  // rain night
  '11d': '⛈️',  // thunderstorm
  '11n': '⛈️',
  '13d': '❄️',  // snow
  '13n': '❄️',
  '50d': '🌫️',  // mist
  '50n': '🌫️'
};

// Day names in Japanese
const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

// Get saved location or use default
let currentLocation = localStorage.getItem('selectedLocation') || 'Tokyo,JP';
locationInput.value = currentLocation;

// Function to show error
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 5000);
}

// Function to fetch current weather
async function fetchCurrentWeather(location) {
  try {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
      showError('APIキーが設定されていません。weather.jsファイルでAPIキーを設定してください。');
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/weather?q=${location}&appid=${API_KEY}&units=metric&lang=ja`
    );

    if (!response.ok) {
      throw new Error('天気情報の取得に失敗しました');
    }

    const data = await response.json();
    displayCurrentWeather(data);
  } catch (error) {
    console.error('Error fetching current weather:', error);
    showError(error.message);
  }
}

// Function to fetch forecast
async function fetchForecast(location) {
  try {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/forecast?q=${location}&appid=${API_KEY}&units=metric&lang=ja`
    );

    if (!response.ok) {
      throw new Error('予報情報の取得に失敗しました');
    }

    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    showError(error.message);
  }
}

// Function to display current weather
function displayCurrentWeather(data) {
  const iconCode = data.weather[0].icon;
  const icon = weatherIcons[iconCode] || '🌡️';

  weatherIcon.textContent = icon;
  temperature.textContent = `${Math.round(data.main.temp)}°C`;
  weatherDescription.textContent = data.weather[0].description;
  feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
  humidity.textContent = `${data.main.humidity}%`;
  windSpeed.textContent = `${data.wind.speed} m/s`;

  updateLastUpdatedTime();
}

// Function to display forecast
function displayForecast(data) {
  forecastList.innerHTML = '';

  // Group forecast data by day (get one forecast per day at noon)
  const dailyForecasts = {};

  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toDateString();
    const hour = date.getHours();

    // Get forecast closest to noon (12:00) for each day
    if (!dailyForecasts[dateKey] || Math.abs(hour - 12) < Math.abs(dailyForecasts[dateKey].hour - 12)) {
      dailyForecasts[dateKey] = {
        ...item,
        hour: hour,
        date: date
      };
    }
  });

  // Display up to 5 days
  Object.values(dailyForecasts).slice(0, 5).forEach(forecast => {
    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item';

    const date = forecast.date;
    const dayName = dayNames[date.getDay()];
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

    const iconCode = forecast.weather[0].icon;
    const icon = weatherIcons[iconCode] || '🌡️';

    forecastItem.innerHTML = `
      <div class="forecast-date">${dateStr}(${dayName})</div>
      <div class="forecast-icon">${icon}</div>
      <div class="forecast-temp">
        <span class="forecast-temp-max">${Math.round(forecast.main.temp_max)}°</span>
        <span class="forecast-temp-min">${Math.round(forecast.main.temp_min)}°</span>
      </div>
    `;

    forecastList.appendChild(forecastItem);
  });
}

// Function to update last updated time
function updateLastUpdatedTime() {
  const now = new Date();
  const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  lastUpdated.textContent = `最終更新: ${timeString}`;
}

// Function to update weather
async function updateWeather() {
  refreshBtn.style.transform = 'rotate(360deg)';
  setTimeout(() => {
    refreshBtn.style.transform = '';
  }, 600);

  await fetchCurrentWeather(currentLocation);
  await fetchForecast(currentLocation);
}

// Function to search weather for a new location
function searchLocation() {
  const newLocation = locationInput.value.trim();
  if (newLocation) {
    currentLocation = newLocation;
    localStorage.setItem('selectedLocation', currentLocation);
    updateWeather();
  }
}

// Event listeners
searchBtn.addEventListener('click', searchLocation);

locationInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchLocation();
  }
});

refreshBtn.addEventListener('click', () => {
  updateWeather();
});

// Theme switching
document.addEventListener('keydown', (event) => {
  if (event.key === 't' || event.key === 'T') {
    document.body.classList.toggle('light-theme');
  }
});

// Right-click to toggle theme
document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  document.body.classList.toggle('light-theme');
});

// Initial weather update
updateWeather();

// Auto-update every 10 minutes
setInterval(updateWeather, 10 * 60 * 1000);

// Log initialization
console.log('Weather Widget initialized');
console.log('To use this widget, you need to set your OpenWeatherMap API key in weather.js');
console.log('Get your free API key from: https://openweathermap.org/api');
