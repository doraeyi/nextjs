const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const bodyParser = require('body-parser');

const app = express();
const client = new OAuth2Client('YOUR_GOOGLE_CLIENT_ID'); // 替換為您的 Google 客戶端 ID

app.use(bodyParser.json());

// Google 登入驗證
app.post('/auth/google', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: 'YOUR_GOOGLE_CLIENT_ID', // 替換為您的 Google 客戶端 ID
    });
    const payload = ticket.getPayload();
    const userId = payload['sub'];
    // 使用 payload 中的資料進行後續操作（例如儲存用戶資料到資料庫）
    res.json({
      message: 'Login successful',
      userId: userId,
      name: payload['name'],
      email: payload['email'],
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
