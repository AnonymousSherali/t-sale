import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const { method } = req;

  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Tizimga kirish talab qilinadi' });
  }

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const orders = await Order.find({})
          .sort({ createdAt: -1 })
          .populate('items.product');
        res.status(200).json({ success: true, data: orders });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const order = await Order.create(req.body);
        res.status(201).json({ success: true, data: order });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false, error: 'Invalid method' });
      break;
  }
}
