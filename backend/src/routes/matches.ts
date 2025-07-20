import { Router, Request, Response } from 'express';
import { User, Match } from '../models';
import { validateTelegramWebAppData } from '../middleware/auth';

const router = Router();

// Лайк или дизлайк
router.post('/swipe', validateTelegramWebAppData, async (req: Request, res: Response) => {
  try {
    const { userTelegramId, targetUserId, liked } = req.body;
    
    if (!userTelegramId || !targetUserId || typeof liked !== 'boolean') {
      return res.status(400).json({ 
        error: 'Обязательные поля: userTelegramId, targetUserId, liked' 
      });
    }
    
    const user = await User.findOne({ telegramId: userTelegramId });
    const targetUser = await User.findById(targetUserId);
    
    if (!user || !targetUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Проверяем, есть ли уже матч
    let match = await Match.findOne({
      $or: [
        { user1: user._id, user2: targetUser._id },
        { user1: targetUser._id, user2: user._id }
      ]
    });
    
    if (match) {
      return res.status(400).json({ error: 'Матч уже существует' });
    }
    
    if (!liked) {
      // Дизлайк - просто создаем запись
      match = new Match({
        user1: user._id,
        user2: targetUser._id,
        user1Liked: false,
        user2Liked: false
      });
      
      await match.save();
      return res.json({ matched: false });
    }
    
    // Лайк - проверяем, лайкнул ли нас целевой пользователь
    const reverseMatch = await Match.findOne({
      user1: targetUser._id,
      user2: user._id,
      user1Liked: true
    });
    
    if (reverseMatch) {
      // Взаимный лайк - создаем матч
      reverseMatch.user2Liked = true;
      reverseMatch.isMatched = true;
      reverseMatch.matchedAt = new Date();
      await reverseMatch.save();
      
      return res.json({ 
        matched: true, 
        matchId: reverseMatch._id,
        message: 'Поздравляем! У вас новый матч!' 
      });
    } else {
      // Односторонний лайк
      match = new Match({
        user1: user._id,
        user2: targetUser._id,
        user1Liked: true,
        user2Liked: false
      });
      
      await match.save();
      return res.json({ matched: false });
    }
  } catch (error) {
    console.error('Ошибка свайпа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить список матчей
router.get('/list/:telegramId', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.params;
    
    const user = await User.findOne({ telegramId: parseInt(telegramId) });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const matches = await Match.find({
      $or: [
        { user1: user._id },
        { user2: user._id }
      ],
      isMatched: true
    })
    .populate('user1', 'firstName lastName photos age')
    .populate('user2', 'firstName lastName photos age')
    .sort({ matchedAt: -1 });
    
    // Форматируем ответ
    const formattedMatches = matches.map(match => {
      const otherUser = match.user1._id.toString() === user._id.toString() 
        ? match.user2 
        : match.user1;
      
      return {
        matchId: match._id,
        user: otherUser,
        matchedAt: match.matchedAt
      };
    });
    
    res.json(formattedMatches);
  } catch (error) {
    console.error('Ошибка получения матчей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;