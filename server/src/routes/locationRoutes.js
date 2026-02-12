import express from 'express';
import locationController from '../controllers/locationController.js';

const router = express.Router();

// Async handler wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/', asyncHandler(locationController.getAllLocations));
router.get('/search', asyncHandler(locationController.searchLocations));
router.get('/:id', asyncHandler(locationController.getLocationById));
router.get('/:id/weather', asyncHandler(locationController.getLocationWeather));
router.get('/:id/weather/history', asyncHandler(locationController.getWeatherHistory));
router.post('/:id/weather/refresh', asyncHandler(locationController.refreshLocationWeather));
router.post('/', asyncHandler(locationController.createLocation));
router.put('/:id', asyncHandler(locationController.updateLocation));
router.delete('/:id', asyncHandler(locationController.deleteLocation));

export default router;
