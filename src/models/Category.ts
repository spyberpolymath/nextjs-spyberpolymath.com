import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  id: string;
  name: string;
  slug: string;
  count: number;
}

const CategorySchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);