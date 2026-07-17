const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  helmetId: { type: String, required: true, index: true },
  helmetWorn: Boolean,
  fsr1: Number,
  fsr2: Number,
  fsr3: Number,
  mq2: Number,
  mq135: Number,
  temperature: Number,
  humidity: Number,
  location: {
    lat: Number,
    lng: Number
  },
  locationStale: Boolean,
  emergency: Boolean,
  alerts: [String],
  timestamp: { type: Date, default: Date.now }
});

readingSchema.index({ timestamp: -1 });
readingSchema.index({ helmetId: 1, timestamp: -1 });

module.exports = mongoose.model('Reading', readingSchema);
