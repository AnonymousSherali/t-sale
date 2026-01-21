import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Mahsulot nomi kiritilishi shart'],
      trim: true,
      maxlength: [200, 'Mahsulot nomi 200 belgidan oshmasligi kerak'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Tavsif 2000 belgidan oshmasligi kerak'],
    },
    price: {
      type: Number,
      required: [true, 'Narx kiritilishi shart'],
      min: [0, 'Narx 0 dan kichik bo\'lmasligi kerak'],
    },
    category: {
      type: String,
      trim: true,
      default: 'Boshqa',
    },
    images: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Miqdor 0 dan kichik bo\'lmasligi kerak'],
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allows null values but enforces uniqueness when set
    },
    properties: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Prevent model recompilation in development
export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
