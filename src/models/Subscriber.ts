import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ISubscriber extends Document {
  name: string;
  email: string;
  phone?: string;
  interest: string;
  whatsappEnabled: boolean;
  source: 'newsletter' | 'accounts';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  subscribedAt: Date;
  status: 'active' | 'inactive' | 'unsubscribed';
  lastEmailSent?: Date;
}

const SubscriberSchema = new Schema<ISubscriber>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  interest: { type: String, required: true },
  source: { type: String, enum: ['newsletter', 'accounts'], default: 'newsletter' },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly'], default: 'weekly' },
  subscribedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'unsubscribed'], default: 'active' },
  lastEmailSent: { type: Date },
});

// Create indexes for better query performance
SubscriberSchema.index({ status: 1 });
SubscriberSchema.index({ interest: 1 });
SubscriberSchema.index({ subscribedAt: -1 });

export default models.Subscriber || model<ISubscriber>('Subscriber', SubscriberSchema);