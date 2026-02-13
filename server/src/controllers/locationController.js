import Location from '../models/Location.js';
import weatherService from '../services/weatherService.js';
import syncService from '../sync/syncService.js';

const locationController = {
  async getAllLocations(req, res) {
    try {
      const { isActive } = req.query;
      const query = isActive !== undefined ? { isActive: isActive === 'true' } : {};
      
      const locations = await Location.find(query).sort({ name: 1 });
      res.json({ success: true, data: locations, count: locations.length });
    } catch (error) {
      console.error('Error getting locations:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getLocationById(req, res) {
    try {
      const location = await Location.findById(req.params.id);
      if (!location) {
        return res.status(404).json({ success: false, error: 'Location not found' });
      }
      res.json({ success: true, data: location });
    } catch (error) {
      console.error('Error getting location:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createLocation(req, res) {
    try {
      console.log('[DEBUG] === CREATE LOCATION REQUEST ===');
      console.log('[DEBUG] Content-Type:', req.headers['content-type']);
      console.log('[DEBUG] Raw request body:', JSON.stringify(req.body));
      
      let { name, country, latitude, longitude, timezone } = req.body;

      console.log('[DEBUG] Extracted fields:', { name, country, latitude, longitude, timezone });

      // If name is provided but no coordinates, validate and get coordinates from API
      if (name && (latitude === undefined || longitude === undefined)) {
        console.log('[DEBUG] Attempting geocoding for:', name, country);
        try {
          const geoData = await weatherService.geocodeCity(name, country || '');
          console.log('[DEBUG] Geocoding API response:', JSON.stringify(geoData));
          latitude = geoData.latitude;
          longitude = geoData.longitude;
          name = geoData.name; // Use the normalized name from API
          country = geoData.country;
          console.log('[DEBUG] After geocoding:', { name, country, latitude, longitude });
        } catch (geoError) {
          if (geoError.type === 'not_found') {
            return res.status(404).json({
              success: false,
              error: `City '${name}' not found. Please check the spelling or try a different city.`,
            });
          }
          throw geoError;
        }
      }

      // Validate required fields
      if (!name || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Name, latitude, and longitude are required',
        });
      }

      // Additional validation: country must not be empty
      if (!country || country.trim() === '') {
        console.error('[DEBUG] Country is missing or empty:', country);
        return res.status(400).json({
          success: false,
          error: 'Country is required',
        });
      }

      console.log('[DEBUG] Final validated fields:', { name, country, latitude, longitude });

      // Validate coordinate ranges
      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({
          success: false,
          error: 'Latitude must be between -90 and 90',
        });
      }
      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          error: 'Longitude must be between -180 and 180',
        });
      }

      const existingLocation = await Location.findOne({
        latitude,
        longitude,
      });

      if (existingLocation) {
        return res.status(400).json({
          success: false,
          error: 'A location with these coordinates already exists',
        });
      }

      const location = new Location({
        name,
        country,
        latitude,
        longitude,
        timezone: timezone || 'UTC',
      });

      await location.save();
      console.log('[DEBUG] Location saved successfully:', location._id);
      res.status(201).json({ success: true, data: location });
    } catch (error) {
      console.error('=== CREATE LOCATION ERROR ===');
      console.error('Error name:', error.name);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async updateLocation(req, res) {
    try {
      const { name, country, latitude, longitude, timezone, isActive } = req.body;

      const location = await Location.findByIdAndUpdate(
        req.params.id,
        {
          name,
          country,
          latitude,
          longitude,
          timezone,
          isActive,
        },
        { new: true, runValidators: true }
      );

      if (!location) {
        return res.status(404).json({ success: false, error: 'Location not found' });
      }

      res.json({ success: true, data: location });
    } catch (error) {
      console.error('Error updating location:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async deleteLocation(req, res) {
    try {
      const location = await Location.findByIdAndDelete(req.params.id);
      if (!location) {
        return res.status(404).json({ success: false, error: 'Location not found' });
      }
      res.json({ success: true, message: 'Location deleted successfully' });
    } catch (error) {
      console.error('Error deleting location:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getLocationWeather(req, res) {
    try {
      const location = await Location.findById(req.params.id);
      if (!location) {
        return res.status(404).json({ success: false, error: 'Location not found' });
      }

      const snapshot = await weatherService.getLatestSnapshot(req.params.id);
      res.json({ success: true, data: { location, weather: snapshot } });
    } catch (error) {
      console.error('Error getting location weather:', error.message);
      res.status(error.statusCode || 500).json({ success: false, error: error.message, type: error.type });
    }
  },

  async refreshLocationWeather(req, res) {
    try {
      const result = await syncService.syncSingleLocation(req.params.id);
      if (result.success) {
        res.json({ success: true, data: result.snapshot });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('Error refreshing weather:', error.message);
      res.status(error.statusCode || 500).json({ success: false, error: error.message, type: error.type });
    }
  },

  /**
   * Fetch current weather by city name (no location ID required)
   */
  async getWeatherByCity(req, res) {
    try {
      const { city, country } = req.query;
      
      if (!city) {
        return res.status(400).json({ 
          success: false, 
          error: 'City parameter is required' 
        });
      }

      const weatherData = await weatherService.fetchCurrentWeatherByCity(city, country || '');
      res.json({ 
        success: true, 
        data: { 
          city: city + (country ? `,${country}` : ''),
          weather: weatherData 
        } 
      });
    } catch (error) {
      console.error('Error fetching weather by city:', error.message);
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: error.message, 
        type: error.type 
      });
    }
  },

  /**
   * Fetch 5-day forecast by city name
   */
  async getForecastByCity(req, res) {
    try {
      const { city, country } = req.query;
      
      if (!city) {
        return res.status(400).json({ 
          success: false, 
          error: 'City parameter is required' 
        });
      }

      const forecastData = await weatherService.fetchForecastByCity(city, country || '');
      res.json({ 
        success: true, 
        data: forecastData 
      });
    } catch (error) {
      console.error('Error fetching forecast by city:', error.message);
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: error.message, 
        type: error.type 
      });
    }
  },

  /**
   * Fetch 5-day forecast by location ID
   */
  async getLocationForecast(req, res) {
    try {
      const location = await Location.findById(req.params.id);
      if (!location) {
        return res.status(404).json({ success: false, error: 'Location not found' });
      }

      const forecastData = await weatherService.fetchForecastByCoords(
        location.latitude,
        location.longitude
      );
      
      res.json({ 
        success: true, 
        data: { location, forecast: forecastData } 
      });
    } catch (error) {
      console.error('Error getting location forecast:', error.message);
      res.status(error.statusCode || 500).json({ 
        success: false, 
        error: error.message, 
        type: error.type 
      });
    }
  },

  async getWeatherHistory(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'startDate and endDate are required',
        });
      }

      const history = await weatherService.getSnapshotHistory(
        req.params.id,
        new Date(startDate),
        new Date(endDate)
      );

      res.json({ success: true, data: history, count: history.length });
    } catch (error) {
      console.error('Error getting weather history:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async searchLocations(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, error: 'Search query is required' });
      }

      const locations = await Location.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { country: { $regex: q, $options: 'i' } },
        ],
      }).limit(20);

      res.json({ success: true, data: locations, count: locations.length });
    } catch (error) {
      console.error('Error searching locations:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

export default locationController;
