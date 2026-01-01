import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogVisit extends Document {
  userId: string;
  blogId: string;
  visitedAt: Date;
}

const BlogVisitSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  blogId: { type: String, required: true, index: true },
  visitedAt: { type: Date, default: Date.now, index: true }
});

// Compound index to prevent duplicate visits in a short time, but allow multiple
BlogVisitSchema.index({ userId: 1, blogId: 1, visitedAt: -1 });

export default mongoose.models.BlogVisit || mongoose.model<IBlogVisit>('BlogVisit', BlogVisitSchema);