import mongoose from 'mongoose';

const ProjectPaymentSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
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
  // Contact form fields
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  countryRegion: { type: String, required: true },
  stateProvince: { type: String, required: true },
  postalCode: { type: String, required: true },
  vatGstId: { type: String },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.ProjectPayment || mongoose.model('ProjectPayment', ProjectPaymentSchema);