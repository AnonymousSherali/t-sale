import dbConnect from '@/lib/mongoose';
import Setting from '@/models/Setting';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Tizimga kirish talab qilinadi' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Always return the single settings document (or empty defaults)
      const settings = await Setting.findOne({});
      res.status(200).json({ success: true, data: settings || {} });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const settings = await Setting.findOneAndUpdate(
        {},
        req.body,
        { new: true, upsert: true, runValidators: true }
      );
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
