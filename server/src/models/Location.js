import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  isActive: {
    type: Boolean,
    default: true,
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

locationSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

locationSchema.index({ latitude: 1, longitude: 1 }, { unique: true });
locationSchema.index({ name: 1, country: 1 });

const Location = mongoose.model('Location', locationSchema);

export default Location;


