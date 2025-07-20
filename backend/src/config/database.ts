import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://mongo:27017/tinder-miniapp';
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB подключена');
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

// Обработка отключения
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📴 MongoDB отключена');
  process.exit(0);
});