import axios from 'axios';
import WeatherSnapshot from '../models/WeatherSnapshot.js';
import Location from '../models/Location.js';

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = process.env.WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5';
  }

  async fetchCurrentWeatherByCoords(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
        },
      });

      return this.transformApiResponse(response.data);
    } catch (error) {
      console.error(`Error fetching weather for coordinates (${lat}, ${lon}):`, error.message);
      throw error;
    }
  }

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
      });

      return this.transformApiResponse(response.data);
    } catch (error) {
      console.error(`Error fetching weather for city (${cityName}):`, error.message);
      throw error;
    }
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
