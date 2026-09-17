import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import Setting from '@/models/Setting';
import { requireSession, sendError } from '@/lib/apiHelpers';
import { ORDER_STATUSES } from '@/lib/orderStatus';
import { ExcelJS, buildSheet, sendWorkbook, datedFilename } from '@/lib/excelExport';

export default async function handler(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res
      .status(405)
      .json({ success: false, error: `${req.method} usuli qo'llab-quvvatlanmaydi` });
  }

  try {
    await dbConnect();

    const { status } = req.query;
    const query = status && ORDER_STATUSES.includes(status) ? { status } : {};

    const [orders, settings] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).lean(),
      Setting.findOne({}).lean(),
    ]);

    const currency = settings?.currency || "so'm";

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'E-commerce Admin';
    workbook.created = new Date();

    buildSheet(
      workbook,
      'Buyurtmalar',
      [
        { header: 'Raqami', key: 'orderNumber', width: 14 },
        { header: 'Sana', key: 'createdAt', width: 18, numFmt: 'dd.mm.yyyy hh:mm' },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'Mijoz', key: 'customerName', width: 26 },
        { header: 'Telefon', key: 'customerPhone', width: 18 },
        { header: 'Email', key: 'customerEmail', width: 26 },
        { header: 'Manzil', key: 'customerAddress', width: 40 },
        { header: 'Mahsulot turi', key: 'itemCount', width: 14, numFmt: '#,##0' },
        { header: 'Jami dona', key: 'unitCount', width: 12, numFmt: '#,##0' },
        { header: `Summa (${currency})`, key: 'totalAmount', width: 18, numFmt: '#,##0' },
        { header: 'Izoh', key: 'notes', width: 36 },
      ],
      orders.map((order) => ({
        orderNumber: order.orderNumber || '',
        createdAt: order.createdAt ? new Date(order.createdAt) : null,
        status: order.status || '',
        customerName: order.customerName || '',
        customerPhone: order.customerPhone || '',
        customerEmail: order.customerEmail || '',
        customerAddress: order.customerAddress || '',
        itemCount: order.items?.length || 0,
        unitCount: (order.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0),
        totalAmount: order.totalAmount || 0,
        notes: order.notes || '',
      }))
    );

    // One row per ordered product, so the file can be pivoted by product —
    // the summary sheet alone cannot answer "how many of X did we sell".
    const itemRows = [];
    for (const order of orders) {
      for (const item of order.items || []) {
        itemRows.push({
          orderNumber: order.orderNumber || '',
          createdAt: order.createdAt ? new Date(order.createdAt) : null,
          status: order.status || '',
          customerName: order.customerName || '',
          title: item.title || '',
          price: item.price || 0,
          quantity: item.quantity || 0,
          lineTotal: (item.price || 0) * (item.quantity || 0),
        });
      }
    }

    buildSheet(
      workbook,
      'Mahsulotlar tafsiloti',
      [
        { header: 'Buyurtma raqami', key: 'orderNumber', width: 18 },
        { header: 'Sana', key: 'createdAt', width: 18, numFmt: 'dd.mm.yyyy hh:mm' },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'Mijoz', key: 'customerName', width: 26 },
        { header: 'Mahsulot', key: 'title', width: 34 },
        { header: `Narxi (${currency})`, key: 'price', width: 16, numFmt: '#,##0' },
        { header: 'Soni', key: 'quantity', width: 10, numFmt: '#,##0' },
        { header: `Summa (${currency})`, key: 'lineTotal', width: 18, numFmt: '#,##0' },
      ],
      itemRows
    );

    await sendWorkbook(res, workbook, datedFilename('buyurtmalar'));
  } catch (error) {
    sendError(res, error, 500);
  }
}
