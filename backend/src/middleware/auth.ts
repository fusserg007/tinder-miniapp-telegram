import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Интерфейс для данных Telegram WebApp
interface TelegramWebAppData {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  auth_date: number;
  hash: string;
}

// Проверка подлинности данных Telegram WebApp
export const validateTelegramWebAppData = (req: Request, res: Response, next: NextFunction) => {
  try {
    // В режиме разработки пропускаем проверку
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    
    const initData = req.headers['x-telegram-init-data'] as string;
    
    if (!initData) {
      return res.status(401).json({ error: 'Отсутствуют данные аутентификации' });
    }
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      console.error('Отсутствует TELEGRAM_BOT_TOKEN');
      return res.status(500).json({ error: 'Ошибка конфигурации сервера' });
    }
    
    // Парсим данные
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    if (!hash) {
      return res.status(401).json({ error: 'Отсутствует хэш' });
    }
    
    // Создаем строку для проверки
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Создаем секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Вычисляем хэш
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Проверяем хэш
    if (calculatedHash !== hash) {
      return res.status(401).json({ error: 'Неверные данные аутентификации' });
    }
    
    // Проверяем время (не старше 24 часов)
    const authDate = parseInt(urlParams.get('auth_date') || '0');
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (currentTime - authDate > 86400) { // 24 часа
      return res.status(401).json({ error: 'Данные аутентификации устарели' });
    }
    
    // Добавляем данные пользователя в запрос
    const userData = urlParams.get('user');
    if (userData) {
      req.telegramUser = JSON.parse(userData);
    }
    
    next();
  } catch (error) {
    console.error('Ошибка валидации Telegram WebApp:', error);
    res.status(401).json({ error: 'Ошибка аутентификации' });
  }
};

// Мидлвар для проверки администратора
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const adminIds = process.env.ADMIN_TELEGRAM_IDS?.split(',').map(id => parseInt(id.trim())) || [];
  
  if (!req.telegramUser || !adminIds.includes(req.telegramUser.id)) {
    return res.status(403).json({ error: 'Нет прав администратора' });
  }
  
  next();
};

// Расширяем тип Request
declare global {
  namespace Express {
    interface Request {
      telegramUser?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
      };
    }
  }
}