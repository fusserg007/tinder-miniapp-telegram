import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  age: number;
  bio?: string;
  photos: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  preferences: {
    minAge: number;
    maxAge: number;
    maxDistance: number;
  };
  isActive: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  telegramId: {
    type: Number,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: String,
  username: String,
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  bio: {
    type: String,
    maxlength: 500
  },
  photos: [{
    type: String,
    required: true
  }],
  location: {
    latitude: Number,
    longitude: Number
  },
  preferences: {
    minAge: {
      type: Number,
      default: 18
    },
    maxAge: {
      type: Number,
      default: 50
    },
    maxDistance: {
      type: Number,
      default: 50
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Индексы для оптимизации поиска
userSchema.index({ telegramId: 1 });
userSchema.index({ location: '2dsphere' });
userSchema.index({ age: 1 });
userSchema.index({ isActive: 1 });

export const User = model<IUser>('User', userSchema);