import dbConnect from '@/lib/mongoose';
import Setting from '@/models/Setting';
import { requireSession, pickFields, sendError } from '@/lib/apiHelpers';

const SETTING_FIELDS = [
  'shopName',
  'phone',
  'address',
  'email',
  'currency',
  'lowStockThreshold',
];

export default async function handler(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;

  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const settings = await Setting.findOne({});
        res.status(200).json({ success: true, data: settings || {} });
      } catch (error) {
        sendError(res, error);
      }
      break;

    case 'PUT':
      try {
        const updates = pickFields(req.body, SETTING_FIELDS);

        if (updates.lowStockThreshold !== undefined) {
          const threshold = Number(updates.lowStockThreshold);
          if (!Number.isFinite(threshold) || threshold < 0) {
            return res.status(400).json({
              success: false,
              error: "Ogohlantirish miqdori 0 yoki undan katta son bo'lishi kerak",
            });
          }
          updates.lowStockThreshold = threshold;
        }

        // A single settings document per install — upsert keeps it that way.
        const settings = await Setting.findOneAndUpdate(
          {},
          { $set: updates },
          { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
        res.status(200).json({ success: true, data: settings });
      } catch (error) {
        sendError(res, error);
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).json({ success: false, error: `${req.method} usuli qo'llab-quvvatlanmaydi` });
  }
}
