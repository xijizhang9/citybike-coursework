const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// 模拟 JWT 验证（TB1）
const verifyJWT = (req) => req.headers.authorization && req.headers.authorization.startsWith('Bearer ');

// 模拟 mTLS（TB2）
const verifyMTLS = (req) => req.headers['x-internal-auth'] === 'internal-mtls-token';

// POST /rides/start
app.post('/rides/start', (req, res) => {
  if (!verifyJWT(req) && !verifyMTLS(req)) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }
  const { bikeId, dockId } = req.body;
  if (!bikeId || !dockId) {
    return res.status(400).json({ code: 400, message: 'Missing bikeId or dockId' });
  }
  res.status(201).json({
    rideId: 'ride_' + Date.now(),
    status: 'started',
    startTime: new Date().toISOString(),
    message: 'Ride started successfully'
  });
});

// POST /rides/{rideId}/end
app.post('/rides/:rideId/end', (req, res) => {
  if (!verifyJWT(req) && !verifyMTLS(req)) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }
  const { dockId } = req.body;
  if (!dockId) {
    return res.status(400).json({ code: 400, message: 'Missing dockId' });
  }
  res.json({
    rideId: req.params.rideId,
    status: 'ended',
    endTime: new Date().toISOString(),
    message: 'Ride ended successfully'
  });
});

// GET /rides/{rideId} （内部调用）
app.get('/rides/:rideId', (req, res) => {
  if (!verifyMTLS(req)) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }
  res.json({
    rideId: req.params.rideId,
    userId: 'user_123',
    bikeId: 'bike_456',
    startTime: new Date(Date.now() - 1800000).toISOString(),
    endTime: new Date().toISOString(),
    durationMinutes: 30,
    cost: 15.5
  });
});

app.listen(PORT, () => {
  console.log(`Ride Service running on http://localhost:${PORT}`);
});