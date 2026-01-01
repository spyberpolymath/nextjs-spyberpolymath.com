import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: Date;
  repliedAt?: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new' },
  createdAt: { type: Date, default: Date.now },
  repliedAt: { type: Date },
});

export default models.ContactMessage || model<IContactMessage>('ContactMessage', ContactMessageSchema);
