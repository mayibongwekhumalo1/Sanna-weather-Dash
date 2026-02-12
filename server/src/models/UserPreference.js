import mongoose from 'mongoose';

const userPreferenceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  preferredUnits: {
    temperature: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric',
    },
    windSpeed: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric',
    },
    pressure: {
      type: String,
      enum: ['hPa', 'inHg'],
      default: 'hPa',
    },
  },
  favoriteLocations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
  }],
  notifications: {
    enabled: {
      type: Boolean,
      default: false,
    },
    severeWeather: {
      type: Boolean,
      default: true,
    },
    dailyForecast: {
      type: Boolean,
      default: false,
    },
  },
  displaySettings: {
    language: {
      type: String,
      default: 'en',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userPreferenceSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);

export default UserPreference;
