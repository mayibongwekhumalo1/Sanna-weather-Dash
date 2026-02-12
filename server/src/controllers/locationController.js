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
      const { name, country, latitude, longitude, timezone } = req.body;

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
      res.status(201).json({ success: true, data: location });
    } catch (error) {
      console.error('Error creating location:', error.message);
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
      res.status(500).json({ success: false, error: error.message });
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
      res.status(500).json({ success: false, error: error.message });
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
