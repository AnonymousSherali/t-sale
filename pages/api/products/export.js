import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import Setting from '@/models/Setting';
import { requireSession, sendError } from '@/lib/apiHelpers';
import { filterAndSortProducts } from '@/lib/productFilters';
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

    const [products, settings] = await Promise.all([
      Product.find({}).lean(),
      Setting.findOne({}).lean(),
    ]);

    const currency = settings?.currency || "so'm";

    // The same filters the products page applies, so the file matches the table
    // the user was looking at when they pressed Export.
    const { search = '', category = '', sortBy = 'newest' } = req.query;
    const rows = filterAndSortProducts(products, { search, category, sortBy });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'E-commerce Admin';
    workbook.created = new Date();

    buildSheet(
      workbook,
      'Mahsulotlar',
      [
        { header: 'Nomi', key: 'title', width: 34 },
        { header: 'Kategoriya', key: 'category', width: 22 },
        { header: `Narxi (${currency})`, key: 'price', width: 16, numFmt: '#,##0' },
        { header: 'Miqdor', key: 'stock', width: 10, numFmt: '#,##0' },
        { header: `Umumiy qiymat (${currency})`, key: 'total', width: 20, numFmt: '#,##0' },
        { header: 'SKU', key: 'sku', width: 16 },
        { header: 'Tavsif', key: 'description', width: 44 },
        { header: 'Rasmlar', key: 'images', width: 40 },
        { header: "Qo'shilgan sana", key: 'createdAt', width: 18, numFmt: 'dd.mm.yyyy hh:mm' },
      ],
      rows.map((p) => ({
        title: p.title || '',
        category: p.category || '',
        price: p.price || 0,
        stock: p.stock || 0,
        total: (p.price || 0) * (p.stock || 0),
        sku: p.sku || '',
        description: p.description || '',
        images: (p.images || []).join(', '),
        // A real Date lets Excel sort and format it; a string would not.
        createdAt: p.createdAt ? new Date(p.createdAt) : null,
      }))
    );

    await sendWorkbook(res, workbook, datedFilename('mahsulotlar'));
  } catch (error) {
    sendError(res, error, 500);
  }
}
