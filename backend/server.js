require('dotenv').config();
const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Reading = require('./models/Reading');
const Threshold = require('./models/Threshold');
const authMiddleware = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ============================================================
// MongoDB connection
// ============================================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// ============================================================
// In-memory thresholds (loaded from DB on startup)
// ============================================================
let THRESHOLDS = {
  temperature: 45,
  mq2: 400,
  mq135: 400,
  fsrMin: 300
};

async function loadThresholds() {
  try {
    let doc = await Threshold.findOne({ key: 'default' });
    if (!doc) {
      doc = await Threshold.create({ key: 'default', ...THRESHOLDS });
      console.log('Default thresholds created in DB');
    }
    THRESHOLDS = {
      temperature: doc.temperature,
      mq2: doc.mq2,
      mq135: doc.mq135,
      fsrMin: doc.fsrMin
    };
    console.log('Thresholds loaded:', THRESHOLDS);
  } catch (err) {
    console.error('Error loading thresholds:', err);
  }
}
loadThresholds();

function evaluateRules(data) {
  const alerts = [];
  if (data.emergency) alerts.push('EMERGENCY');
  if (data.temp > THRESHOLDS.temperature) alerts.push('HIGH_TEMPERATURE');
  if (data.mq2 > THRESHOLDS.mq2) alerts.push('GAS_LEAK');
  if (data.mq135 > THRESHOLDS.mq135) alerts.push('POOR_AIR_QUALITY');
  
  const fsr1 = Number(data.fsr1 ?? 0);
  const fsr2 = Number(data.fsr2 ?? 0);
  const fsr3 = Number(data.fsr3 ?? 0);
  const avgFsr = (fsr1 + fsr2 + fsr3) / 3;
  
  const isOff = data.helmet === false && fsr1 < 50 && fsr2 < 50 && fsr3 < 50;
  const isLoose = !isOff && (data.helmet === false || fsr1 < THRESHOLDS.fsrMin || fsr2 < THRESHOLDS.fsrMin || fsr3 < THRESHOLDS.fsrMin);

  if (isOff) {
    alerts.push('HELMET_NOT_WORN');
  } else if (isLoose) {
    alerts.push('HELMET_NOT_WORN_PROPERLY');
  }
  return alerts;
}

// ============================================================
// Auth routes (public)
// ============================================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});


// ============================================================
// Location tracking (from mobile phone)
// ============================================================
const latestLocation = new Map();
const LOCATION_STALE_MS = 60000;

app.post('/api/location', (req, res) => {
  const { helmetId, lat, lng } = req.body;
  if (!helmetId || lat == null || lng == null) {
    return res.status(400).json({ error: 'helmetId, lat, lng required' });
  }
  const payload = { helmetId, lat, lng, updatedAt: Date.now(), locationStale: false };
  latestLocation.set(helmetId, payload);
  io.emit('location-update', payload);
  res.status(200).json(payload);
});

app.get('/api/location/latest', authMiddleware, (req, res) => {
  try {
    const items = Array.from(latestLocation.entries()).map(([helmetId, value]) => ({
      helmetId,
      lat: value.lat,
      lng: value.lng,
      updatedAt: value.updatedAt,
      locationStale: Date.now() - value.updatedAt > LOCATION_STALE_MS
    }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch latest locations.' });
  }
});

// ============================================================
// MQTT setup
// ============================================================
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883');
const lastSeen = new Map();
const latestData = new Map();

function normalizePayload(payload) {
  if (!payload || typeof payload !== 'object') return {};

  const normalized = {
    helmetId: payload.helmetId || payload.helmet_id || payload.id || payload.helmetID || payload.helmetid || 'H001',
    helmet: payload.helmet ?? payload.helmetWorn ?? true,
    fsr1: Number(payload.fsr1 ?? 0),
    fsr2: Number(payload.fsr2 ?? 0),
    fsr3: Number(payload.fsr3 ?? 0),
    mq2: Number(payload.mq2 ?? 0),
    mq135: Number(payload.mq135 ?? 0),
    temp: Number(payload.temp ?? 0),
    humidity: Number(payload.humidity ?? 0),
    emergency: !!(payload.emergency || false),
    lat: payload.lat ?? payload.latitude,
    lng: payload.lng ?? payload.longitude,
  };

  if (payload.temperature != null && normalized.temp === 0) {
    normalized.temp = Number(payload.temperature);
  }
  if (payload.hum != null && normalized.humidity === 0) {
    normalized.humidity = Number(payload.hum);
  }
  if (payload.gas != null && normalized.mq2 === 0) {
    normalized.mq2 = Number(payload.gas);
  }
  if (payload.airQuality != null && normalized.mq135 === 0) {
    normalized.mq135 = Number(payload.airQuality);
  }

  return normalized;
}

mqttClient.on('connect', () => {
  console.log('MQTT connected to HiveMQ');
  mqttClient.subscribe(process.env.MQTT_TOPIC || 'helmet/data');
  mqttClient.subscribe(process.env.MQTT_LOCATION_TOPIC || 'helmet/location');
});

mqttClient.on('error', (err) => {
  console.error('MQTT connection error:', err.message);
});

mqttClient.on('message', async (topic, message) => {
  try {
    const raw = message.toString();
    console.log(`[MQTT Message] Topic: ${topic}, Payload: ${raw}`);
    let parsed = {};

    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error('Invalid MQTT JSON:', raw);
      return;
    }

    // Filter out unrelated public MQTT payloads on 'helmet/data' that don't match our sensor structure
    if (topic === 'helmet/data') {
      const hasTemp = parsed.temp !== undefined || parsed.temperature !== undefined;
      const hasFsr = parsed.fsr1 !== undefined;
      if (!hasTemp || !hasFsr) {
        console.log(`[MQTT Filter] Ignored unrelated public message on topic ${topic}`);
        return;
      }
    }

    const payload = normalizePayload(parsed);
    const helmetId = payload.helmetId || 'H001';

    if (topic === (process.env.MQTT_LOCATION_TOPIC || 'helmet/location')) {
      if (payload.lat != null && payload.lng != null) {
        const locPayload = {
          helmetId,
          lat: Number(payload.lat),
          lng: Number(payload.lng),
          updatedAt: Date.now(),
          locationStale: false,
        };
        latestLocation.set(helmetId, locPayload);
        io.emit('location-update', locPayload);
      }
      return;
    }

    lastSeen.set(helmetId, Date.now());
    const alerts = evaluateRules(payload);

    const loc = latestLocation.get(helmetId);
    const location = loc ? { lat: loc.lat, lng: loc.lng } : null;
    const locationStale = loc ? (Date.now() - loc.updatedAt > LOCATION_STALE_MS) : true;

    const reading = new Reading({
      helmetId,
      helmetWorn: payload.helmet,
      fsr1: payload.fsr1,
      fsr2: payload.fsr2,
      fsr3: payload.fsr3,
      mq2: payload.mq2,
      mq135: payload.mq135,
      temperature: payload.temp,
      humidity: payload.humidity,
      location,
      locationStale,
      emergency: !!payload.emergency,
      alerts
    });
    await reading.save();

    const updatePayload = {
      helmetId,
      helmetWorn: payload.helmet,
      fsr1: payload.fsr1,
      fsr2: payload.fsr2,
      fsr3: payload.fsr3,
      mq2: payload.mq2,
      mq135: payload.mq135,
      temperature: payload.temp,
      humidity: payload.humidity,
      location,
      locationStale,
      emergency: !!payload.emergency,
      alerts,
      timestamp: reading.timestamp
    };

    latestData.set(helmetId, updatePayload);
    io.emit('helmet-update', updatePayload);
  } catch (err) {
    console.error('Error processing MQTT message:', err);
  }
});

// ============================================================
// Offline detection
// ============================================================
const OFFLINE_THRESHOLD_MS = 15000;

setInterval(() => {
  const now = Date.now();
  for (const [helmetId, ts] of lastSeen) {
    if (now - ts > OFFLINE_THRESHOLD_MS) {
      io.emit('helmet-offline', { helmetId });
    }
  }
}, 5000);

// ============================================================
// Protected REST endpoints
// ============================================================
app.get('/api/helmets/latest', authMiddleware, async (req, res) => {
  try {
    const latest = await Reading.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$helmetId', doc: { $first: '$$ROOT' } } }
    ]);
    res.json(latest.map(x => x.doc));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch latest readings.' });
  }
});

app.get('/api/helmets/stats', authMiddleware, async (req, res) => {
  try {
    const allHelmetIds = await Reading.distinct('helmetId');
    const now = Date.now();
    let onlineCount = 0;
    let alertCount = 0;
    for (const id of allHelmetIds) {
      const ts = lastSeen.get(id);
      if (ts && now - ts <= OFFLINE_THRESHOLD_MS) onlineCount++;
      const data = latestData.get(id);
      if (data && data.alerts && data.alerts.length > 0) alertCount++;
    }
    res.json({
      totalHelmets: allHelmetIds.length,
      onlineCount,
      alertCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

app.get('/api/helmets/:id/history', authMiddleware, async (req, res) => {
  try {
    const readings = await Reading.find({ helmetId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

app.get('/api/alerts/active', authMiddleware, async (req, res) => {
  try {
    const active = await Reading.aggregate([
      { $match: { 'alerts.0': { $exists: true } } },
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$helmetId', doc: { $first: '$$ROOT' } } }
    ]);
    res.json(active.map(x => x.doc));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch active alerts.' });
  }
});

app.get('/api/alerts/history', authMiddleware, async (req, res) => {
  try {
    const alerts = await Reading.find({ 'alerts.0': { $exists: true } })
      .sort({ timestamp: -1 })
      .limit(200);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alert history.' });
  }
});

app.get('/api/settings/thresholds', authMiddleware, async (req, res) => {
  try {
    const doc = await Threshold.findOne({ key: 'default' });
    res.json(doc || THRESHOLDS);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch thresholds.' });
  }
});

app.put('/api/settings/thresholds', authMiddleware, async (req, res) => {
  try {
    const { temperature, mq2, mq135, fsrMin } = req.body;
    const update = {};
    if (temperature != null) update.temperature = temperature;
    if (mq2 != null) update.mq2 = mq2;
    if (mq135 != null) update.mq135 = mq135;
    if (fsrMin != null) update.fsrMin = fsrMin;
    update.updatedAt = new Date();

    const doc = await Threshold.findOneAndUpdate(
      { key: 'default' },
      { $set: update },
      { new: true, upsert: true }
    );

    THRESHOLDS = {
      temperature: doc.temperature,
      mq2: doc.mq2,
      mq135: doc.mq135,
      fsrMin: doc.fsrMin
    };
    console.log('Thresholds updated:', THRESHOLDS);
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update thresholds.' });
  }
});

// ============================================================
// Start server
// ============================================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));