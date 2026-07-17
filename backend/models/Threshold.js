const mongoose = require('mongoose');

const thresholdSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  temperature: { type: Number, default: 45 },
  mq2: { type: Number, default: 400 },
  mq135: { type: Number, default: 400 },
  fsrMin: { type: Number, default: 300 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Threshold', thresholdSchema);
