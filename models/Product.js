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
      sparse: true, // Only indexes documents where sku is set
      // The form submits '' for a blank SKU. An empty string is a real value as
      // far as the unique index is concerned, so a second SKU-less product would
      // collide. Normalising '' to undefined keeps those documents out of the index.
      set: (v) => (v === '' || v === null ? undefined : v),
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
