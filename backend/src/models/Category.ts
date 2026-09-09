import mongoose, { Document, Schema, Types } from 'mongoose';

export type CategoryType = 'income' | 'expense';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  icon: string;
  type: CategoryType;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    icon: { type: String, required: true, default: '📁' },
    type: { type: String, enum: ['income', 'expense'], required: true },
  },
  { timestamps: true }
);

// A user cannot have two categories with the same name + type
categorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

export default mongoose.model<ICategory>('Category', categorySchema);
