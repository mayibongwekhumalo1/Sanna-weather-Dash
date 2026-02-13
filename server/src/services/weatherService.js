import axios from 'axios';
import WeatherSnapshot from '../models/WeatherSnapshot.js';
import Location from '../models/Location.js';

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = process.env.WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5';
    this.forecastUrl = process.env.WEATHER_API_FORECAST_URL || 'https://api.openweathermap.org/data/2.5';
    this.geocodingUrl = process.env.WEATHER_API_GEOCODING_URL || 'https://api.openweathermap.org/geo/1.0';
  }

  /**
   * Geocoding: Get coordinates for a city name
   */
  async geocodeCity(cityName, countryCode = '') {
    try {
      let query = cityName;
      if (countryCode) {
        query = `${cityName},${countryCode}`;
      }

      const response = await axios.get(`${this.geocodingUrl}/direct`, {
        params: {
          q: query,
          limit: 1,
          appid: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data.length === 0) {
        const error = new Error(`City '${cityName}' not found`);
        error.type = 'not_found';
        error.statusCode = 404;
        throw error;
      }

      const location = response.data[0];
      console.log('[DEBUG] Geocoding raw response:', JSON.stringify(location));
      const result = {
        name: location.name,
        country: location.country,
        latitude: location.lat,
        longitude: location.lon,
        state: location.state || null,
      };
      console.log('[DEBUG] Geocoding parsed result:', JSON.stringify(result));
      return result;
    } catch (error) {
      if (error.type) {
        throw error;
      }
      const categorizedError = this.categorizeApiError(error, cityName);
      console.error(`Error geocoding city (${cityName}):`, categorizedError.message);
      const apiError = new Error(categorizedError.message);
      apiError.type = categorizedError.type;
      apiError.statusCode = error.response?.status || 500;
      throw apiError;
    }
  }

  /**
   * Categorize API errors for better handling
   */
  categorizeApiError(error, cityName) {
    const errorMessage = error.message?.toLowerCase() || '';
    const statusCode = error.response?.status;

    if (statusCode === 401) {
      return { type: 'auth', message: 'Invalid API key' };
    }
    if (statusCode === 404) {
      return { type: 'not_found', message: `City '${cityName}' not found` };
    }
    if (statusCode === 429) {
      return { type: 'rate_limit', message: 'API rate limit exceeded. Please try again later.' };
    }
    if (error.code === 'ECONNABORTED' || errorMessage.includes('timeout')) {
      return { type: 'timeout', message: 'Request timed out. Please try again.' };
    }
    if (errorMessage.includes('network') || errorMessage.includes('econnreset')) {
      return { type: 'network', message: 'Network error. Please check your connection.' };
    }
    return { type: 'unknown', message: errorMessage || 'An unexpected error occurred' };
  }

  /**
   * Fetch current weather by coordinates
   */
  async fetchCurrentWeatherByCoords(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
        },
        timeout: 10000, // 10 second timeout
      });

      return this.transformApiResponse(response.data);
    } catch (error) {
      const categorizedError = this.categorizeApiError(error, `${lat},${lon}`);
      console.error(`Error fetching weather for coordinates (${lat}, ${lon}):`, categorizedError.message);
      const apiError = new Error(categorizedError.message);
      apiError.type = categorizedError.type;
      apiError.statusCode = error.response?.status || 500;
      throw apiError;
    }
  }

  /**
   * Fetch current weather by city name
   */
  async fetchCurrentWeatherByCity(cityName, countryCode = '') {
    try {
      let query = cityName;
      if (countryCode) {
        query = `${cityName},${countryCode}`;
      }

      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: query,
          appid: this.apiKey,
          units: 'metric',
        },
        timeout: 10000, // 10 second timeout
      });

      return this.transformApiResponse(response.data);
    } catch (error) {
      const categorizedError = this.categorizeApiError(error, cityName);
      console.error(`Error fetching weather for city (${cityName}):`, categorizedError.message);
      const apiError = new Error(categorizedError.message);
      apiError.type = categorizedError.type;
      apiError.statusCode = error.response?.status || 500;
      throw apiError;
    }
  }

  /**
   * Fetch 5-day forecast by city name
   */
  async fetchForecastByCity(cityName, countryCode = '') {
    try {
      let query = cityName;
      if (countryCode) {
        query = `${cityName},${countryCode}`;
      }

      const response = await axios.get(`${this.forecastUrl}/forecast`, {
        params: {
          q: query,
          appid: this.apiKey,
          units: 'metric',
        },
        timeout: 10000, // 10 second timeout
      });

      return this.transformForecastResponse(response.data);
    } catch (error) {
      const categorizedError = this.categorizeApiError(error, cityName);
      console.error(`Error fetching forecast for city (${cityName}):`, categorizedError.message);
      const apiError = new Error(categorizedError.message);
      apiError.type = categorizedError.type;
      apiError.statusCode = error.response?.status || 500;
      throw apiError;
    }
  }

  /**
   * Fetch 5-day forecast by coordinates
   */
  async fetchForecastByCoords(lat, lon) {
    try {
      const response = await axios.get(`${this.forecastUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
        },
        timeout: 10000, // 10 second timeout
      });

      return this.transformForecastResponse(response.data);
    } catch (error) {
      const categorizedError = this.categorizeApiError(error, `${lat},${lon}`);
      console.error(`Error fetching forecast for coordinates (${lat}, ${lon}):`, categorizedError.message);
      const apiError = new Error(categorizedError.message);
      apiError.type = categorizedError.type;
      apiError.statusCode = error.response?.status || 500;
      throw apiError;
    }
  }

  /**
   * Transform forecast API response to internal format
   */
  transformForecastResponse(data) {
    // Group forecasts by day (take one reading per day at noon)
    const dailyForecasts = {};
    
    data.list.forEach(forecast => {
      const date = new Date(forecast.dt * 1000).toISOString().split('T')[0];
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date,
          temp: { min: Infinity, max: -Infinity },
          weather: [],
          humidity: [],
          wind: [],
        };
      }

      dailyForecasts[date].temp.min = Math.min(dailyForecasts[date].temp.min, forecast.main.temp_min);
      dailyForecasts[date].temp.max = Math.max(dailyForecasts[date].temp.max, forecast.main.temp_max);
      dailyForecasts[date].humidity.push(forecast.main.humidity);
      dailyForecasts[date].wind.push(forecast.wind.speed);
      
      // Add weather info (use most frequent)
      dailyForecasts[date].weather.push({
        main: forecast.weather[0].main,
        description: forecast.weather[0].description,
        icon: forecast.weather[0].icon,
      });
    });

    // Convert to array and limit to 5 days
    const forecastDays = Object.values(dailyForecasts)
      .slice(0, 5)
      .map(day => ({
        date: day.date,
        temperature: {
          min: Math.round(day.temp.min),
          max: Math.round(day.temp.max),
        },
        weather: day.weather[Math.floor(day.weather.length / 2)], // Midday weather
        humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
        wind: {
          speed: Math.round((day.wind.reduce((a, b) => a + b, 0) / day.wind.length) * 10) / 10,
        },
      }));

    return {
      city: {
        name: data.city.name,
        country: data.city.country,
        sunrise: new Date(data.city.sunrise * 1000),
        sunset: new Date(data.city.sunset * 1000),
      },
      forecast: forecastDays,
      fetchedAt: new Date(),
      apiSource: 'openweathermap',
    };
  }

  transformApiResponse(data) {
    return {
      temperature: {
        current: data.main.temp,
        feelsLike: data.main.feels_like,
        min: data.main.temp_min,
        max: data.main.temp_max,
      },
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind: {
        speed: data.wind.speed,
        direction: data.wind.deg,
        gust: data.wind.gust || null,
      },
      visibility: data.visibility,
      clouds: data.clouds.all,
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      },
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      fetchedAt: new Date(),
      apiSource: 'openweathermap',
    };
  }

  async saveWeatherSnapshot(locationId, weatherData) {
    try {
      const snapshot = new WeatherSnapshot({
        location: locationId,
        ...weatherData,
      });

      return await snapshot.save();
    } catch (error) {
      console.error('Error saving weather snapshot:', error.message);
      throw error;
    }
  }

  async getLatestSnapshot(locationId) {
    try {
      return await WeatherSnapshot.findOne({ location: locationId })
        .sort({ fetchedAt: -1 })
        .populate('location');
    } catch (error) {
      console.error('Error getting latest snapshot:', error.message);
      throw error;
    }
  }

  async getSnapshotHistory(locationId, startDate, endDate) {
    try {
      const query = {
        location: locationId,
        fetchedAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      return await WeatherSnapshot.find(query)
        .sort({ fetchedAt: -1 })
        .limit(100);
    } catch (error) {
      console.error('Error getting snapshot history:', error.message);
      throw error;
    }
  }

  async fetchAndSaveForLocation(locationId) {
    try {
      const location = await Location.findById(locationId);
      if (!location) {
        throw new Error(`Location not found: ${locationId}`);
      }

      const weatherData = await this.fetchCurrentWeatherByCoords(
        location.latitude,
        location.longitude
      );

      const snapshot = await this.saveWeatherSnapshot(locationId, weatherData);

      return snapshot;
    } catch (error) {
      console.error(`Error fetching and saving for location (${locationId}):`, error.message);
      throw error;
    }
  }
}

const weatherService = new WeatherService();
export default weatherService;
