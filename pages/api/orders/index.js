import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireSession, pickFields, sendError } from '@/lib/apiHelpers';

const ORDER_FIELDS = [
  'customerName',
  'customerEmail',
  'customerPhone',
  'customerAddress',
  'items',
  'notes',
  'status',
];

export default async function handler(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;

  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
      } catch (error) {
        sendError(res, error);
      }
      break;

    case 'POST':
      try {
        const data = pickFields(req.body, ORDER_FIELDS);

        if (!Array.isArray(data.items) || data.items.length === 0) {
          return res.status(400).json({
            success: false,
            error: "Buyurtmada kamida bitta mahsulot bo'lishi kerak",
          });
        }

        // Price and title are taken from the database, not from the request, so a
        // tampered client cannot order a product at a price it never had.
        const productIds = data.items.map((item) => item.product);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map(products.map((p) => [String(p._id), p]));

        const items = [];
        // Several rows can reference the same product, so stock is checked
        // against the combined quantity rather than each row on its own.
        const requested = new Map();

        for (const item of data.items) {
          const product = productMap.get(String(item.product));
          if (!product) {
            return res.status(400).json({
              success: false,
              error: `Mahsulot topilmadi: ${item.title || item.product}`,
            });
          }
          const quantity = Math.max(1, Number(item.quantity) || 1);
          const key = String(product._id);
          requested.set(key, (requested.get(key) || 0) + quantity);

          items.push({
            product: product._id,
            title: product.title,
            price: product.price,
            quantity,
          });
        }

        // Stock is reserved before the order exists, and each decrement is
        // conditional on there still being enough. Two requests racing for the
        // last unit cannot both succeed, which a read-then-write check allows.
        const reserved = [];
        for (const [productId, quantity] of requested) {
          const product = productMap.get(productId);
          const result = await Product.updateOne(
            { _id: productId, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } }
          );

          if (result.modifiedCount === 0) {
            // Undo whatever was already reserved so a rejected order leaves no trace.
            await Promise.all(
              reserved.map((r) =>
                Product.updateOne({ _id: r.productId }, { $inc: { stock: r.quantity } })
              )
            );
            return res.status(409).json({
              success: false,
              error: `"${product.title}" omborda yetarli emas — ${product.stock || 0} dona bor, ${quantity} dona so'ralgan`,
            });
          }
          reserved.push({ productId, quantity });
        }

        data.items = items;
        data.totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

        let order;
        try {
          // Retry once: two orders created at the same moment can derive the
          // same order number and trip the unique index.
          try {
            order = await Order.create(data);
          } catch (error) {
            if (error?.code !== 11000) throw error;
            order = await Order.create(data);
          }
        } catch (error) {
          // The order failed after stock was taken — give it back.
          await Promise.all(
            reserved.map((r) =>
              Product.updateOne({ _id: r.productId }, { $inc: { stock: r.quantity } })
            )
          );
          throw error;
        }

        res.status(201).json({ success: true, data: order });
      } catch (error) {
        sendError(res, error);
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ success: false, error: `${req.method} usuli qo'llab-quvvatlanmaydi` });
  }
}
