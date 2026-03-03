const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// 模拟 API Key 验证（TB4 - 外部伙伴）
const verifyAPIKey = (req) => req.headers['x-api-key'] === 'valid-partner-api-key';

// 模拟 mTLS（TB2）
const verifyMTLS = (req) => req.headers['x-internal-auth'] === 'internal-mtls-token';

// GET /analytics/rides-summary （伙伴专用）
app.get('/analytics/rides-summary', (req, res) => {
  if (!verifyAPIKey(req) && !verifyMTLS(req)) {
    return res.status(403).json({ code: 403, message: 'API Key 或 mTLS 验证失败' });
  }
  const { startDate, endDate } = req.query;
  res.json({
    totalRides: 1245,
    totalDurationMinutes: 45670,
    averageRideDistanceKm: 3.8,
    period: `${startDate} to ${endDate}`
  });
});

// GET /analytics/usage-stats （伙伴专用）
app.get('/analytics/usage-stats', (req, res) => {
  if (!verifyAPIKey(req) && !verifyMTLS(req)) {
    return res.status(403).json({ code: 403, message: 'API Key 或 mTLS 验证失败' });
  }
  res.json({
    activeBikes: 856,
    utilizationRate: 72.5,
    topDocks: [
      { dockId: 'dock_A1', usageCount: 234 },
      { dockId: 'dock_B3', usageCount: 189 }
    ]
  });
});

// POST /analytics/export （内部调用）
app.post('/analytics/export', (req, res) => {
  if (!verifyMTLS(req)) {
    return res.status(403).json({ code: 403, message: 'mTLS 认证失败' });
  }
  const { format, dateRange } = req.body;
  res.status(202).json({
    message: 'Export task created',
    taskId: 'export_' + Date.now(),
    format: format,
    dateRange: dateRange
  });
});

app.listen(PORT, () => {
  console.log(`Partner Analytics Service running on http://localhost:${PORT}`);
});