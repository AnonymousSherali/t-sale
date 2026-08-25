import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Setting from '@/models/Setting';
import { requireSession, sendError } from '@/lib/apiHelpers';
import { CANCELLED_STATUS } from '@/lib/orderStatus';

export default async function handler(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: `${req.method} usuli qo'llab-quvvatlanmaydi` });
  }

  await dbConnect();

  try {
    const [products, orders, settings] = await Promise.all([
      Product.find({}).lean(),
      Order.find({}).lean(),
      Setting.findOne({}).lean(),
    ]);

    const lowStockThreshold = settings?.lowStockThreshold ?? 10;
    const currency = settings?.currency ?? "so'm";

    // `|| 0` guards against products saved before a field existed, which would
    // otherwise turn the whole sum into NaN.
    const totalValue = products.reduce(
      (sum, p) => sum + (p.price || 0) * (p.stock || 0),
      0
    );
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const lowStockProducts = products.filter(
      (p) => (p.stock || 0) < lowStockThreshold
    ).length;
    const outOfStockProducts = products.filter((p) => (p.stock || 0) <= 0).length;

    const activeOrders = orders.filter((o) => o.status !== CANCELLED_STATUS);
    const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const ordersByStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    const recentProducts = [...products]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(({ _id, title, price, createdAt }) => ({ _id, title, price, createdAt }));

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(({ _id, orderNumber, customerName, totalAmount, status, createdAt }) => ({
        _id, orderNumber, customerName, totalAmount, status, createdAt,
      }));

    const categoriesMap = {};
    for (const product of products) {
      const cat = product.category || 'Boshqa';
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    }
    const categories = Object.entries(categoriesMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.status(200).json({
      success: true,
      data: {
        totalProducts: products.length,
        totalValue,
        totalStock,
        lowStockProducts,
        outOfStockProducts,
        lowStockThreshold,
        currency,
        totalOrders: orders.length,
        totalRevenue,
        ordersByStatus,
        recentProducts,
        recentOrders,
        categories,
      },
    });
  } catch (error) {
    sendError(res, error);
  }
}
