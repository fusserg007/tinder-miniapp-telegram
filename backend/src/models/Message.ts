import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  match: Schema.Types.ObjectId;
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'gif';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  match: {
    type: Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'gif'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Обновляем readAt при отметке как прочитанное
messageSchema.pre('save', function(next) {
  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Индексы
messageSchema.index({ match: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1 });
messageSchema.index({ isRead: 1 });

export const Message = model<IMessage>('Message', messageSchema);