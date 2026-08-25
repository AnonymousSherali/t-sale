import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { requireSession, pickFields, sendError } from '@/lib/apiHelpers';

const PRODUCT_FIELDS = ['title', 'description', 'price', 'category', 'images', 'stock', 'sku'];

export default async function handler(req, res) {
  const { id } = req.query;

  const session = await requireSession(req, res);
  if (!session) return;

  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const product = await Product.findById(id);
        if (!product) {
          return res.status(404).json({ success: false, error: 'Mahsulot topilmadi' });
        }
        res.status(200).json({ success: true, data: product });
      } catch (error) {
        sendError(res, error);
      }
      break;

    case 'PUT':
      try {
        const updates = pickFields(req.body, PRODUCT_FIELDS);

        // A blank SKU must be removed rather than stored as '', otherwise the
        // unique index treats every SKU-less product as the same value.
        const update = { $set: updates };
        if (updates.sku === '' || updates.sku === null) {
          delete updates.sku;
          update.$unset = { sku: 1 };
        }

        const product = await Product.findByIdAndUpdate(id, update, {
          new: true,
          runValidators: true,
        });
        if (!product) {
          return res.status(404).json({ success: false, error: 'Mahsulot topilmadi' });
        }
        res.status(200).json({ success: true, data: product });
      } catch (error) {
        sendError(res, error);
      }
      break;

    case 'DELETE':
      try {
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({ success: false, error: 'Mahsulot topilmadi' });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        sendError(res, error);
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ success: false, error: `${req.method} usuli qo'llab-quvvatlanmaydi` });
  }
}
