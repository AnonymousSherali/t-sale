import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireSession, pickFields, sendError } from '@/lib/apiHelpers';
import { ORDER_STATUSES, CANCELLED_STATUS } from '@/lib/orderStatus';

const EDITABLE_FIELDS = [
  'customerName',
  'customerEmail',
  'customerPhone',
  'customerAddress',
  'notes',
  'status',
];

/** Puts the ordered quantities back into stock. */
function restoreStock(items) {
  return Promise.all(
    items.map((item) =>
      Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
    )
  );
}

export default async function handler(req, res) {
  const { id } = req.query;

  const session = await requireSession(req, res);
  if (!session) return;

  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const order = await Order.findById(id);
        if (!order) {
          return res.status(404).json({ success: false, error: 'Buyurtma topilmadi' });
        }
        res.status(200).json({ success: true, data: order });
      } catch (error) {
        sendError(res, error);
      }
      break;

    case 'PUT':
      try {
        const updates = pickFields(req.body, EDITABLE_FIELDS);

        if (updates.status && !ORDER_STATUSES.includes(updates.status)) {
          return res.status(400).json({
            success: false,
            error: `Noma'lum status: ${updates.status}`,
          });
        }

        const existing = await Order.findById(id);
        if (!existing) {
          return res.status(404).json({ success: false, error: 'Buyurtma topilmadi' });
        }

        const wasCancelled = existing.status === CANCELLED_STATUS;
        const isCancelled = updates.status === CANCELLED_STATUS;
        const reactivating = wasCancelled && updates.status && !isCancelled;

        // Re-reserving happens before the status changes, so an order cannot be
        // reactivated when the stock it needs is no longer there.
        if (reactivating) {
          const taken = [];
          for (const item of existing.items) {
            const result = await Product.updateOne(
              { _id: item.product, stock: { $gte: item.quantity } },
              { $inc: { stock: -item.quantity } }
            );

            if (result.modifiedCount === 0) {
              await restoreStock(taken);
              return res.status(409).json({
                success: false,
                error: `"${item.title}" omborda yetarli emas (${item.quantity} dona kerak). Buyurtmani qayta faollashtirib bo'lmaydi.`,
              });
            }
            taken.push(item);
          }
        }

        const order = await Order.findByIdAndUpdate(
          id,
          { $set: updates },
          { new: true, runValidators: true }
        );

        // Cancelling frees the stock that was reserved when the order was placed.
        if (!wasCancelled && isCancelled) {
          await restoreStock(order.items);
        }

        res.status(200).json({ success: true, data: order });
      } catch (error) {
        sendError(res, error);
      }
      break;

    case 'DELETE':
      try {
        const deleted = await Order.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({ success: false, error: 'Buyurtma topilmadi' });
        }

        // Stock was only reserved while the order was active.
        if (deleted.status !== CANCELLED_STATUS) {
          await restoreStock(deleted.items);
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
