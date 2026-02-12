import mongoose from 'mongoose';

const weatherSnapshotSchema = new mongoose.Schema({
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  temperature: {
    current: Number,
    feelsLike: Number,
    min: Number,
    max: Number,
  },
  humidity: {
    type: Number,
    min: 0,
    max: 100,
  },
  pressure: {
    type: Number,
  },
  wind: {
    speed: Number,
    direction: Number,
    gust: Number,
  },
  visibility: {
    type: Number,
  },
  clouds: {
    type: Number,
    min: 0,
    max: 100,
  },
  weather: {
    main: String,
    description: String,
    icon: String,
  },
  sunrise: Date,
  sunset: Date,
  fetchedAt: {
    type: Date,
    default: Date.now,
  },
  apiSource: {
    type: String,
    default: 'openweathermap',
  },
});

weatherSnapshotSchema.index({ location: 1, fetchedAt: -1 });
weatherSnapshotSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const WeatherSnapshot = mongoose.model('WeatherSnapshot', weatherSnapshotSchema);

export default WeatherSnapshot;
