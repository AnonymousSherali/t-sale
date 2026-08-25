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
        for (const item of data.items) {
          const product = productMap.get(String(item.product));
          if (!product) {
            return res.status(400).json({
              success: false,
              error: `Mahsulot topilmadi: ${item.title || item.product}`,
            });
          }
          const quantity = Math.max(1, Number(item.quantity) || 1);
          items.push({
            product: product._id,
            title: product.title,
            price: product.price,
            quantity,
          });
        }

        data.items = items;
        data.totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

        // Retry once: two orders created at the same moment can derive the same
        // order number and trip the unique index.
        let order;
        try {
          order = await Order.create(data);
        } catch (error) {
          if (error?.code === 11000) {
            order = await Order.create(data);
          } else {
            throw error;
          }
        }

        // Reserve the ordered quantity so stock reflects committed orders.
        await Promise.all(
          items.map((item) =>
            Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } })
          )
        );

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
