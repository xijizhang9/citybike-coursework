const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// 模拟 HMAC 验证（TB3 - IoT 设备）
const verifyHMAC = (req) => req.headers['x-hmac-signature'] === 'valid-hmac-signature-from-device';

// 模拟 mTLS（TB2）
const verifyMTLS = (req) => req.headers['x-internal-auth'] === 'internal-mtls-token';

// POST /inventory/update （IoT 设备专用）
app.post('/inventory/update', (req, res) => {
  if (!verifyHMAC(req) && !verifyMTLS(req)) {
    return res.status(401).json({ code: 401, message: 'HMAC 或 mTLS 验证失败' });
  }
  const { deviceId, bikeId, status } = req.body;
  if (!deviceId || !bikeId || !status) {
    return res.status(400).json({ code: 400, message: 'Missing required fields' });
  }
  res.json({
    success: true,
    message: 'Inventory updated successfully',
    inventoryUpdatedAt: new Date().toISOString()
  });
});

// GET /bikes/available （内部调用）
app.get('/bikes/available', (req, res) => {
  if (!verifyMTLS(req)) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }
  res.json({
    bikes: [
      { bikeId: 'bike_001', status: 'available', dockId: 'dock_A1' },
      { bikeId: 'bike_002', status: 'available', dockId: 'dock_A2' }
    ]
  });
});

// GET /docks/status （内部调用）
app.get('/docks/status', (req, res) => {
  if (!verifyMTLS(req)) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }
  res.json({
    docks: [
      { dockId: 'dock_A1', availableSlots: 8, status: 'normal' },
      { dockId: 'dock_A2', availableSlots: 3, status: 'normal' }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Bike Inventory Service running on http://localhost:${PORT}`);
});