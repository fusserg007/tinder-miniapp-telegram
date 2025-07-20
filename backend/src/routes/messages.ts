import { Router, Request, Response } from 'express';
import { Message, Match, User } from '../models';
import { validateTelegramWebAppData } from '../middleware/auth';

const router = Router();

// Отправить сообщение
router.post('/send', validateTelegramWebAppData, async (req: Request, res: Response) => {
  try {
    const { senderTelegramId, matchId, content, type = 'text' } = req.body;
    
    if (!senderTelegramId || !matchId || !content) {
      return res.status(400).json({ 
        error: 'Обязательные поля: senderTelegramId, matchId, content' 
      });
    }
    
    const sender = await User.findOne({ telegramId: senderTelegramId });
    
    if (!sender) {
      return res.status(404).json({ error: 'Отправитель не найден' });
    }
    
    const match = await Match.findById(matchId);
    
    if (!match || !match.isMatched) {
      return res.status(404).json({ error: 'Матч не найден или не подтвержден' });
    }
    
    // Определяем получателя
    const receiverId = match.user1.toString() === sender._id.toString() 
      ? match.user2 
      : match.user1;
    
    const message = new Message({
      match: matchId,
      sender: sender._id,
      receiver: receiverId,
      content,
      type
    });
    
    await message.save();
    
    // Популяция для ответа
    await message.populate('sender', 'firstName lastName photos');
    
    res.json(message);
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить сообщения в чате
router.get('/chat/:matchId/:telegramId', async (req: Request, res: Response) => {
  try {
    const { matchId, telegramId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const user = await User.findOne({ telegramId: parseInt(telegramId) });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const match = await Match.findById(matchId);
    
    if (!match || !match.isMatched) {
      return res.status(404).json({ error: 'Матч не найден' });
    }
    
    // Проверяем, что пользователь участвует в матче
    if (match.user1.toString() !== user._id.toString() && 
        match.user2.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Нет доступа к этому чату' });
    }
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const messages = await Message.find({ match: matchId })
      .populate('sender', 'firstName lastName photos')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));
    
    // Отмечаем сообщения как прочитанные
    await Message.updateMany(
      { 
        match: matchId, 
        receiver: user._id, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
    
    res.json(messages.reverse()); // Возвращаем в хронологическом порядке
  } catch (error) {
    console.error('Ошибка получения сообщений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Отметить сообщение как прочитанное
router.put('/read/:messageId', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { telegramId } = req.body;
    
    const user = await User.findOne({ telegramId });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const message = await Message.findOneAndUpdate(
      { 
        _id: messageId, 
        receiver: user._id 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка отметки сообщения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить количество непрочитанных сообщений
router.get('/unread/:telegramId', async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.params;
    
    const user = await User.findOne({ telegramId: parseInt(telegramId) });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const unreadCount = await Message.countDocuments({
      receiver: user._id,
      isRead: false
    });
    
    res.json({ unreadCount });
  } catch (error) {
    console.error('Ошибка получения непрочитанных:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;