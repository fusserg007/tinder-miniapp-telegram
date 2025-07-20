import { Router, Request, Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { validateTelegramWebAppData } from '../middleware/auth';

const router = Router();

// Настройка S3
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!
  },
  forcePathStyle: true
});

// Настройка multer для загрузки файлов
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только изображения'));
    }
  }
});

// Загрузка фото профиля
router.post('/photo', validateTelegramWebAppData, upload.single('photo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не предоставлен' });
    }
    
    const { telegramId } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId обязателен' });
    }
    
    // Оптимизируем изображение
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(800, 800, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    const fileName = `photos/${telegramId}/${uuidv4()}.jpg`;
    
    // Загружаем в S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: fileName,
      Body: optimizedBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    });
    
    await s3Client.send(uploadCommand);
    
    const photoUrl = `${process.env.S3_PUBLIC_URL}/${fileName}`;
    
    res.json({ 
      success: true, 
      photoUrl,
      message: 'Фото успешно загружено' 
    });
  } catch (error) {
    console.error('Ошибка загрузки фото:', error);
    res.status(500).json({ error: 'Ошибка загрузки файла' });
  }
});

// Загрузка нескольких фото
router.post('/photos', validateTelegramWebAppData, upload.array('photos', 6), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Файлы не предоставлены' });
    }
    
    const { telegramId } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId обязателен' });
    }
    
    const uploadPromises = files.map(async (file) => {
      // Оптимизируем изображение
      const optimizedBuffer = await sharp(file.buffer)
        .resize(800, 800, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      const fileName = `photos/${telegramId}/${uuidv4()}.jpg`;
      
      // Загружаем в S3
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: fileName,
        Body: optimizedBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      });
      
      await s3Client.send(uploadCommand);
      
      return `${process.env.S3_PUBLIC_URL}/${fileName}`;
    });
    
    const photoUrls = await Promise.all(uploadPromises);
    
    res.json({ 
      success: true, 
      photoUrls,
      message: `${photoUrls.length} фото успешно загружено` 
    });
  } catch (error) {
    console.error('Ошибка загрузки фото:', error);
    res.status(500).json({ error: 'Ошибка загрузки файлов' });
  }
});

export default router;