import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { requireSession, pickFields, sendError } from '@/lib/apiHelpers';

const PRODUCT_FIELDS = ['title', 'description', 'price', 'category', 'images', 'stock', 'sku'];

export default async function handler(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;

  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: products });
      } catch (error) {
        sendError(res, error);
      }
      break;

    case 'POST':
      try {
        const product = await Product.create(pickFields(req.body, PRODUCT_FIELDS));
        res.status(201).json({ success: true, data: product });
      } catch (error) {
        sendError(res, error);
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ success: false, error: `${req.method} usuli qo'llab-quvvatlanmaydi` });
  }
}
