import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  excerpt: string;
  richDescription: string;
  author: string;
  date: Date;
  category: string;
  categorySlug: string;
  image?: string; // Cloudinary URL (optional, uploaded separately)
  slug: string;
  featured?: boolean;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  views?: number;
  readTime?: number;
  projectId?: string; // Reference to associated project for download
}

const BlogPostSchema: Schema = new Schema({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  richDescription: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  categorySlug: { type: String, required: true },
  image: { type: String }, // Cloudinary URL (optional, uploaded separately)
  slug: { type: String, required: true, unique: true },
  featured: { type: Boolean, default: false },
  tags: [{ type: String }],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  views: { type: Number, default: 0 },
  readTime: { type: Number, default: 0 },
  projectId: { type: String }, // Reference to associated project for download
});

export default mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);