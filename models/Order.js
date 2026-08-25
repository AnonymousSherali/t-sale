import mongoose from 'mongoose';
import { ORDER_STATUSES, DEFAULT_STATUS } from '@/lib/orderStatus';

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Mijoz ismi kiritilishi shart'],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Telefon raqami kiritilishi shart'],
      trim: true,
    },
    customerAddress: {
      type: String,
      required: [true, 'Manzil kiritilishi shart'],
      trim: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'Buyurtmada kamida bitta mahsulot bo\'lishi kerak',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: DEFAULT_STATUS,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate order number.
// Runs on `validate` (not `save`) because Mongoose validates BEFORE pre('save'),
// so a number assigned in pre('save') would arrive too late for the schema.
// Derived from the highest existing number rather than a document count, so
// deleting an order never causes the next one to reuse its number.
// Mongoose 9 hooks are promise-based — they no longer receive a `next` callback.
OrderSchema.pre('validate', async function () {
  if (!this.isNew || this.orderNumber) return;

  const last = await mongoose
    .model('Order')
    .findOne({ orderNumber: { $regex: /^ORD-\d+$/ } })
    .sort({ orderNumber: -1 })
    .select('orderNumber')
    .lean();

  const lastNumber = last ? parseInt(last.orderNumber.replace('ORD-', ''), 10) : 0;
  this.orderNumber = `ORD-${String(lastNumber + 1).padStart(6, '0')}`;
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
