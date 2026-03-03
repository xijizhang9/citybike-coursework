const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// 模拟 JWT 验证（TB1）
const verifyJWT = (req) => {
  const auth = req.headers.authorization;
  return auth && auth.startsWith('Bearer ');
};

// 模拟 mTLS（TB2）
const verifyMTLS = (req) => {
  return req.headers['x-internal-auth'] === 'internal-mtls-token';
};

// POST /register
app.post('/register', (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ code: 400, message: 'Missing required fields' });
  }
  res.status(201).json({
    token: 'fake-jwt-token-' + Date.now(),
    userId: 'user_' + Date.now(),
    expiresIn: 3600
  });
});

// POST /login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ code: 400, message: 'Missing credentials' });
  }
  res.status(200).json({
    token: 'fake-jwt-token-' + Date.now(),
    userId: 'user_' + Date.now(),
    expiresIn: 3600
  });
});

// GET /profile （需要 JWT 或 mTLS）
app.get('/profile', (req, res) => {
  if (!verifyJWT(req) && !verifyMTLS(req)) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }
  res.json({
    userId: 'user_123',
    email: 'test@example.com',
    fullName: '测试用户',
    createdAt: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`User Service running on http://localhost:${PORT}`);
});