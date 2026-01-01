import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IProject extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  image?: string; // Cloudinary URL
  github?: string;
  demo?: string;
  kaggle?: string;
  linkedin?: string;
  demo2?: string;
  published: boolean;
  created_at: Date;
  updated_at: Date;
  richDescription?: string; // New optional field
  price?: number; // Payment options
  currency?: string; // Currency for payment (default: INR)
  isPaid?: boolean; // Whether project is paid or free (default: false)
  zipUrl?: string; // URL or file path for zip file download
  downloadLimit?: number; // Limit of free downloads before converting to paid (default: 5)
  downloadCount?: number; // Current count of downloads (default: 0)
  isPaidAfterLimit?: boolean; // Whether project became paid after reaching download limit (default: false)
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  image: { type: String }, // Cloudinary URL
  github: { type: String },
  demo: { type: String },
  kaggle: { type: String },
  linkedin: { type: String },
  demo2: { type: String },
  published: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  richDescription: { type: String }, // Ensure richDescription is optional
  price: { type: Number, default: 0 }, // Price for paid projects
  currency: { type: String, default: 'INR' }, // Currency code
  isPaid: { type: Boolean, default: false }, // Whether project is paid
  zipUrl: { type: String }, // URL or file path for zip file download
  downloadLimit: { type: Number, default: 5 }, // Limit of free downloads before converting to paid
  downloadCount: { type: Number, default: 0 }, // Current count of downloads
  isPaidAfterLimit: { type: Boolean, default: false }, // Whether project became paid after reaching download limit
});

// Add index on created_at for faster sorting
ProjectSchema.index({ created_at: -1 });

export default models.Project || model<IProject>('Project', ProjectSchema);
