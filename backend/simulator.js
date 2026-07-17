const mqtt = require('mqtt');

const BROKER = 'mqtt://localhost:1883';
const TOPIC = 'helmet/data';

const client = mqtt.connect(BROKER);

const helmets = [
  { id: 'H001', name: 'Worker A' },
  { id: 'H002', name: 'Worker B' },
  { id: 'H003', name: 'Worker C' }
];

function rand(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let tick = 0;

function publish() {
  tick++;
  for (const helmet of helmets) {
    // Simulate occasional anomalies
    const isAnomalous = Math.random() < 0.1;
    const isEmergency = Math.random() < 0.02;
    const helmetOff = Math.random() < 0.08;

    const payload = {
      helmet_id: helmet.id,
      helmet: !helmetOff,
      fsr1: helmetOff ? randInt(50, 200) : randInt(400, 900),
      fsr2: helmetOff ? randInt(30, 180) : randInt(380, 850),
      fsr3: helmetOff ? randInt(40, 190) : randInt(350, 880),
      mq2: isAnomalous ? randInt(420, 800) : randInt(100, 350),
      mq135: isAnomalous ? randInt(430, 700) : randInt(80, 380),
      temp: isAnomalous ? rand(46, 60) : rand(22, 42),
      humidity: rand(30, 85),
      emergency: isEmergency
    };

    client.publish(TOPIC, JSON.stringify(payload));
    console.log(`[${new Date().toLocaleTimeString()}] Published ${helmet.id}:`,
      `temp=${payload.temp}°C`,
      `mq2=${payload.mq2}`,
      `mq135=${payload.mq135}`,
      `helmet=${payload.helmet}`,
      payload.emergency ? '🚨 EMERGENCY' : ''
    );
  }
}

client.on('connect', () => {
  console.log(`Simulator connected to ${BROKER}`);
  console.log(`Publishing to topic: ${TOPIC}`);
  console.log(`Simulating ${helmets.length} helmets every 3 seconds...\n`);
  publish();
  setInterval(publish, 3000);
});

client.on('error', (err) => {
  console.error('MQTT Error:', err.message);
  console.error('Make sure Mosquitto is running on localhost:1883');
  process.exit(1);
});
