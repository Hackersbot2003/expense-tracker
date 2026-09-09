import bcrypt from 'bcryptjs';
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPrivacySettings {
  showTotalExpenses: boolean;
  showIncome: boolean;
  showCategorySpending: boolean;
  showCharts: boolean;
  showMonthlyTrends: boolean;
  showIndividualTransactions: boolean;
  showAccountBalances: boolean;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  username: string;
  email: string;
  password: string;
  profileImage?: string;
  privacySettings: IPrivacySettings;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

// Default is privacy-friendly: only aggregate expense-side info is visible,
// income, individual transactions, and account balances are hidden by default.
const defaultPrivacySettings: IPrivacySettings = {
  showTotalExpenses: true,
  showIncome: false,
  showCategorySpending: true,
  showCharts: true,
  showMonthlyTrends: true,
  showIndividualTransactions: false,
  showAccountBalances: false,
};

const privacySettingsSchema = new Schema<IPrivacySettings>(
  {
    showTotalExpenses: { type: Boolean, default: true },
    showIncome: { type: Boolean, default: false },
    showCategorySpending: { type: Boolean, default: true },
    showCharts: { type: Boolean, default: true },
    showMonthlyTrends: { type: Boolean, default: true },
    showIndividualTransactions: { type: Boolean, default: false },
    showAccountBalances: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    profileImage: { type: String, default: null },
    privacySettings: { type: privacySettingsSchema, default: () => defaultPrivacySettings },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
