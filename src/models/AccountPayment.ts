import mongoose from 'mongoose';

const AccountPaymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  paymentId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled', 'failed'], default: 'pending' },
  method: { type: String, required: true },
  transactionId: { type: String },
  invoiceId: { type: String },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Subscription fields
  planType: { type: String, enum: ['free', 'supporter', 'allAccess'], default: 'free' },
  billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  renewalDate: { type: Date },
  isActive: { type: Boolean, default: true },
  autoRenew: { type: Boolean, default: true }
});

export default mongoose.models.AccountPayment || mongoose.model('AccountPayment', AccountPaymentSchema);