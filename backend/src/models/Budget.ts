import mongoose, { Document, Schema, Types } from 'mongoose';

export type BudgetType = 'overall' | 'category';

export interface IBudget extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: BudgetType;
  categoryId?: Types.ObjectId;
  amount: number;
  month: number; // 1-12
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['overall', 'category'], required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    amount: { type: Number, required: true, min: 0 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000 },
  },
  { timestamps: true }
);

// One overall budget per user per month, one category budget per user/category/month
budgetSchema.index(
  { userId: 1, type: 1, categoryId: 1, month: 1, year: 1 },
  { unique: true }
);

export default mongoose.model<IBudget>('Budget', budgetSchema);
