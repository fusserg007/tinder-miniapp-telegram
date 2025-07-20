import { Router, Request, Response } from 'express';
import { User, Match } from '../models';
import { validateTelegramWebAppData } from '../middleware/auth';

const router = Router();

// Получить профиль пользователя
router.get('/profile/:telegramId', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.params;
    
    const user = await User.findOne({ telegramId: parseInt(telegramId) });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать или обновить профиль
router.post('/profile', validateTelegramWebAppData, async (req: Request, res: Response) => {
  try {
    const { telegramId, firstName, lastName, username, age, bio, photos, location, preferences } = req.body;
    
    // Проверяем обязательные поля
    if (!telegramId || !firstName || !age || !photos || photos.length === 0) {
      return res.status(400).json({ 
        error: 'Обязательные поля: telegramId, firstName, age, photos' 
      });
    }
    
    if (age < 18 || age > 100) {
      return res.status(400).json({ error: 'Возраст должен быть от 18 до 100 лет' });
    }
    
    const user = await User.findOneAndUpdate(
      { telegramId },
      {
        firstName,
        lastName,
        username,
        age,
        bio,
        photos,
        location,
        preferences,
        lastSeen: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json(user);
  } catch (error) {
    console.error('Ошибка сохранения профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить кандидатов для свайпа
router.get('/candidates/:telegramId', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.params;
    const { limit = 10 } = req.query;
    
    const currentUser = await User.findOne({ telegramId: parseInt(telegramId) });
    
    if (!currentUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Получаем ID пользователей, которых уже оценили
    const existingMatches = await Match.find({
      $or: [
        { user1: currentUser._id },
        { user2: currentUser._id }
      ]
    });
    
    const excludeIds = existingMatches.map(match => 
      match.user1.toString() === currentUser._id.toString() ? match.user2 : match.user1
    );
    excludeIds.push(currentUser._id);
    
    // Поиск кандидатов
    const query: any = {
      _id: { $nin: excludeIds },
      isActive: true,
      age: {
        $gte: currentUser.preferences.minAge,
        $lte: currentUser.preferences.maxAge
      }
    };
    
    // Если указана геолокация, ищем по расстоянию
    if (currentUser.location) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [currentUser.location.longitude, currentUser.location.latitude]
          },
          $maxDistance: currentUser.preferences.maxDistance * 1000 // км в метры
        }
      };
    }
    
    const candidates = await User.find(query)
      .limit(parseInt(limit as string))
      .select('-__v');
    
    res.json(candidates);
  } catch (error) {
    console.error('Ошибка получения кандидатов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить последнее посещение
router.put('/last-seen/:telegramId', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.params;
    
    await User.findOneAndUpdate(
      { telegramId: parseInt(telegramId) },
      { lastSeen: new Date() }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления last-seen:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;