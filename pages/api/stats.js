import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  const { method } = req;

  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Tizimga kirish talab qilinadi' });
  }

  await dbConnect();

  if (method === 'GET') {
    try {
      const products = await Product.find({});

      // Calculate statistics
      const totalProducts = products.length;
      const totalValue = products.reduce((sum, product) => sum + ((product.price || 0) * (product.stock || 0)), 0);
      const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
      const lowStockProducts = products.filter(product => (product.stock || 0) < 10).length;

      // Get recent products (last 5)
      const recentProducts = await Product.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title price createdAt');

      // Categories count
      const categoriesMap = {};
      products.forEach(product => {
        const cat = product.category || 'Boshqa';
        categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
      });

      const categories = Object.entries(categoriesMap).map(([name, count]) => ({
        name,
        count
      }));

      res.status(200).json({
        success: true,
        data: {
          totalProducts,
          totalValue,
          totalStock,
          lowStockProducts,
          recentProducts,
          categories
        }
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(400).json({ success: false, error: 'Invalid method' });
  }
}
