import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  joinedDate: Date;
  lastLogin: Date;
  role?: string;
  phone?: string;
  dateOfBirth?: Date;
  status?: string;
  address?: {
    street: string;
    addressLine2?: string;
    city: string;
    stateProvince?: string;
    country: string;
    postalCode: string;
  };
  password: string;
  emailOtpEnabled: boolean;
  emailOtpCode?: string;
  emailOtpExpires?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  uid: string;
  pid: string;
  activeSubscription?: {
    planType: 'free' | 'supporter' | 'allAccess';
    billingCycle: 'monthly' | 'quarterly' | 'yearly';
    startDate: Date;
    endDate: Date;
    renewalDate: Date;
    isActive: boolean;
  };
  loginHistory: Array<{
    ip: string;
    userAgent: string;
    location?: string;
    device?: string;
    timestamp: Date;
    success: boolean;
    loggedOut?: boolean;
  }>;
  paymentHistory: Array<{
    paymentId: string;
    amount: number;
    currency: string;
    description: string;
    date: Date;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    method: string;
    transactionId: string;
    invoiceId: string;
    refundAmount?: number;
    refundDate?: Date;
  }>;
  emailPreferences?: {
    twoFANotifications: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    };
    accountChanges: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    };
    loginNotifications: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    };
    newsletter: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    };
  };
}

const UserSchema: Schema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  joinedDate: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  role: { type: String, default: 'user' },
  phone: { type: String },
  dateOfBirth: { type: Date },
  status: { type: String, default: 'active' },
  address: {
    street: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    stateProvince: { type: String },
    country: { type: String },
    postalCode: { type: String }
  },
  password: { type: String, required: true },
  emailOtpEnabled: { type: Boolean, default: false },
  emailOtpCode: { type: String },
  emailOtpExpires: { type: Date },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  uid: { type: String, unique: true, sparse: true },
  pid: { type: String, unique: true, sparse: true },
  activeSubscription: {
    planType: { type: String, enum: ['free', 'supporter', 'allAccess'], default: 'free' },
    billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
    startDate: { type: Date },
    endDate: { type: Date },
    renewalDate: { type: Date },
    isActive: { type: Boolean, default: false }
  },
  loginHistory: [{
    ip: { type: String, default: 'unknown' },
    userAgent: { type: String, default: 'unknown' },
    location: { type: String },
    device: { type: String },
    timestamp: { type: Date, default: Date.now },
    success: { type: Boolean, default: false },
    loggedOut: { type: Boolean, default: false }
  }],
  paymentHistory: [{
    paymentId: { type: String },
    amount: { type: Number },
    currency: { type: String, default: 'USD' },
    description: { type: String },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['completed', 'pending', 'failed', 'refunded'], default: 'pending' },
    method: { type: String },
    transactionId: { type: String },
    invoiceId: { type: String },
    refundAmount: { type: Number },
    refundDate: { type: Date }
  }],
  emailPreferences: {
    twoFANotifications: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly'], default: 'weekly' }
    },
    accountChanges: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly'], default: 'weekly' }
    },
    loginNotifications: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly'], default: 'weekly' }
    },
    newsletter: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly'], default: 'weekly' }
    }
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
