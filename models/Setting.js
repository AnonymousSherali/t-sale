import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
  {
    shopName: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    currency: { type: String, default: "so'm" },
    lowStockThreshold: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
