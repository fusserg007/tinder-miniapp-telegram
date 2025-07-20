import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
let db: any;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dating_app';

MongoClient.connect(MONGODB_URI)
  .then(client => {
    console.log('✅ Connected to MongoDB');
    db = client.db();
  })
  .catch(error => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Базовые маршруты
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'backend', timestamp: new Date().toISOString() });
});

// Webhook для Telegram бота
app.post('/webhook', (req, res) => {
  console.log('Telegram webhook received:', req.body);
  res.status(200).send('OK');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});