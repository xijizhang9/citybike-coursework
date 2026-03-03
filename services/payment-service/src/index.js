const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// 模拟 mTLS 验证（TB2 - 内部服务专用）
const verifyMTLS = (req) => req.headers['x-internal-auth'] === 'internal-mtls-token';

// POST /payments/charge （Ride Service 调用）
app.post('/payments/charge', (req, res) => {
  if (!verifyMTLS(req)) {
    return res.status(403).json({ code: 403, message: 'mTLS 认证失败' });
  }
  const { rideId, userId, amount } = req.body;
  if (!rideId || !userId || !amount) {
    return res.status(400).json({ code: 400, message: 'Missing required fields' });
  }
  res.status(201).json({
    paymentId: 'pay_' + Date.now(),
    status: 'success',
    amount: amount,
    timestamp: new Date().toISOString()
  });
});

// POST /payments/refund
app.post('/payments/refund', (req, res) => {
  if (!verifyMTLS(req)) {
    return res.status(403).json({ code: 403, message: 'mTLS 认证失败' });
  }
  const { paymentId, reason } = req.body;
  if (!paymentId || !reason) {
    return res.status(400).json({ code: 400, message: 'Missing paymentId or reason' });
  }
  res.json({
    paymentId: paymentId,
    status: 'refunded',
    timestamp: new Date().toISOString()
  });
});

// GET /payments/{paymentId}
app.get('/payments/:paymentId', (req, res) => {
  if (!verifyMTLS(req)) {
    return res.status(403).json({ code: 403, message: 'mTLS 认证失败' });
  }
  res.json({
    paymentId: req.params.paymentId,
    rideId: 'ride_123',
    userId: 'user_456',
    amount: 15.5,
    status: 'success',
    transactionId: 'txn_' + Date.now()
  });
});

app.listen(PORT, () => {
  console.log(`Payment Service running on http://localhost:${PORT}`);
});