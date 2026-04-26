const API_KEY = 'open-meteo';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

let isDarkTheme = true;
document.getElementById('search-btn').addEventListener('click', searchWeather);
document.getElementById('city-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather();
});
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

async function searchWeather() {
    const city = document.getElementById('city-input').value.trim();
    if (!city) {
        alert('Please enter a city name');
        return;
    }
    try {
        const geoResponse = await fetch(`${GEOCODING_API}?name=${city}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            document.getElementById('weather-info').innerHTML = '<p>City not found. Please try again.</p>';
            return;
        }
        const { latitude, longitude, name, country } = geoData.results[0];
        const weatherResponse = await fetch(`${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,humidity,pressure_msl,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`);
        const weatherData = await weatherResponse.json();
        displayWeather(weatherData, name, country);
        displayForecast(weatherData);
    } catch (error) {
        console.error('Error fetching weather:', error);
        document.getElementById('weather-info').innerHTML = '<p>Error fetching weather data. Please try again.</p>';
    }
}

function displayWeather(data, city, country) {
    const current = data.current;
    const temp = Math.round(current.temperature_2m);
    const feelsLike = Math.round(current.apparent_temperature);
    const condition = getWeatherDescription(current.weather_code);
    const humidity = current.humidity;
    const windSpeed = Math.round(current.wind_speed_10m);
    const pressure = Math.round(current.pressure_msl);

    const weatherHTML = `<div class='weather-header'>\n    <h2>${city}, ${country}</h2>\n    <p class='temperature'>${temp}°C</p>\n    <p class='condition'>${condition}</p>\n    <p class='feels-like'>Feels like: ${feelsLike}°C</p>\n</div><div class='weather-details'>\n    <div class='detail'><span>Humidity</span><span>${humidity}%</span></div>\n    <div class='detail'><span>Wind Speed</span><span>${windSpeed} km/h</span></div>\n    <div class='detail'><span>Pressure</span><span>${pressure} hPa</span></div>\n</div>`;

    document.getElementById('weather-info').innerHTML = weatherHTML;
}

function displayForecast(data) {
    const daily = data.daily;
    let forecastHTML = '';
    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
        const date = new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const condition = getWeatherDescription(daily.weather_code[i]);
        forecastHTML += `<div class='forecast-day'><p><strong>${date}</strong></p><p>${condition}</p><p>${maxTemp}° / ${minTemp}°</p></div>`;
    }
    document.getElementById('forecast').innerHTML = forecastHTML;
}

function getWeatherDescription(code) {
    const weatherCodes = { 0: '☀️ Clear', 1: '🌤️ Mostly Clear', 2: '⛅ Partly Cloudy', 3: '☁️ Overcast', 45: '🌫️ Foggy', 48: '🌫️ Depositing Rime Fog', 51: '🌧️ Light Drizzle', 53: '🌧️ Moderate Drizzle', 55: '🌧️ Dense Drizzle', 61: '🌧️ Slight Rain', 63: '🌧️ Moderate Rain', 65: '🌧️ Heavy Rain', 71: '❄️ Slight Snow', 73: '❄️ Moderate Snow', 75: '❄️ Heavy Snow', 80: '🌧️ Slight Rain Showers', 81: '🌧️ Moderate Rain Showers', 82: '🌧️ Violent Rain Showers', 85: '❄️ Slight Snow Showers', 86: '❄️ Heavy Snow Showers', 95: '⛈️ Thunderstorm', 96: '⛈️ Thunderstorm with Hail', 99: '⛈️ Thunderstorm with Heavy Hail' };
    return weatherCodes[code] || 'Unknown';
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
}

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        isDarkTheme = false;
        document.body.classList.add('light-theme');
    }
});