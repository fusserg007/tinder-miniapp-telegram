import { Schema, model, Document } from 'mongoose';

export interface IMatch extends Document {
  user1: Schema.Types.ObjectId;
  user2: Schema.Types.ObjectId;
  user1Liked: boolean;
  user2Liked: boolean;
  isMatched: boolean;
  matchedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema<IMatch>({
  user1: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user1Liked: {
    type: Boolean,
    default: false
  },
  user2Liked: {
    type: Boolean,
    default: false
  },
  isMatched: {
    type: Boolean,
    default: false
  },
  matchedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Обновляем isMatched и matchedAt при сохранении
matchSchema.pre('save', function(next) {
  if (this.user1Liked && this.user2Liked && !this.isMatched) {
    this.isMatched = true;
    this.matchedAt = new Date();
  }
  next();
});

// Индексы
matchSchema.index({ user1: 1, user2: 1 }, { unique: true });
matchSchema.index({ user1: 1 });
matchSchema.index({ user2: 1 });
matchSchema.index({ isMatched: 1 });

export const Match = model<IMatch>('Match', matchSchema);