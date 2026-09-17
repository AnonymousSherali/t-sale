import ExcelJS from 'exceljs';
import formidable from 'formidable';
import fs from 'fs';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { requireSession, sendError } from '@/lib/apiHelpers';
import {
  buildImportReport,
  TEMPLATE_HEADERS,
  TEMPLATE_EXAMPLE_ROWS,
} from '@/lib/productImport';

export const config = {
  api: { bodyParser: false },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 2000;

/** Builds the blank sheet users download to see the expected columns. */
async function sendTemplate(res) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Mahsulotlar');

  sheet.addRow(TEMPLATE_HEADERS);
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5E7EB' },
  };

  TEMPLATE_EXAMPLE_ROWS.forEach((row) => sheet.addRow(row));

  sheet.columns = [
    { width: 32 }, { width: 14 }, { width: 22 },
    { width: 36 }, { width: 10 }, { width: 14 }, { width: 30 },
  ];

  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename="mahsulotlar-namuna.xlsx"');
  res.status(200).send(Buffer.from(buffer));
}

/** Parses the uploaded workbook into an array of raw cell rows. */
async function readRows(filepath, isCsv) {
  const workbook = new ExcelJS.Workbook();

  if (isCsv) {
    await workbook.csv.readFile(filepath);
  } else {
    await workbook.xlsx.readFile(filepath);
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const rows = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    // row.values is 1-based with a leading hole; drop it to get real indexes.
    const values = Array.isArray(row.values) ? row.values.slice(1) : [];
    rows.push(values);
  });

  return rows;
}

function parseForm(req) {
  const form = formidable({ maxFileSize: MAX_FILE_SIZE });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    try {
      return await sendTemplate(res);
    } catch (error) {
      return sendError(res, error, 500);
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res
      .status(405)
      .json({ success: false, error: `${req.method} usuli qo'llab-quvvatlanmaydi` });
  }

  let filepath;
  try {
    const { fields, files } = await parseForm(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'Fayl topilmadi' });
    }
    filepath = file.filepath;

    const name = (file.originalFilename || '').toLowerCase();
    const isCsv = name.endsWith('.csv');
    if (!isCsv && !name.endsWith('.xlsx')) {
      return res.status(400).json({
        success: false,
        error: 'Faqat .xlsx yoki .csv fayllar qabul qilinadi',
      });
    }

    // The client sends the same file twice: once to preview, once to confirm.
    const dryRunField = Array.isArray(fields.dryRun) ? fields.dryRun[0] : fields.dryRun;
    const dryRun = dryRunField === 'true';

    let rows;
    try {
      rows = await readRows(filepath, isCsv);
    } catch {
      return res.status(400).json({
        success: false,
        error: "Faylni o'qib bo'lmadi. U buzilgan yoki qo'llab-quvvatlanmaydigan formatda.",
      });
    }

    if (rows.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Faylda ma'lumot yo'q. Birinchi qator ustun nomlari, keyingilari mahsulotlar bo'lishi kerak.",
      });
    }

    if (rows.length - 1 > MAX_ROWS) {
      return res.status(400).json({
        success: false,
        error: `Bir faylda ${MAX_ROWS} tadan ortiq mahsulot bo'lmasligi kerak (${rows.length - 1} ta topildi)`,
      });
    }

    await dbConnect();

    const existing = await Product.find({ sku: { $exists: true, $ne: null } })
      .select('sku')
      .lean();
    const existingSkus = new Set(existing.map((p) => p.sku));

    const report = buildImportReport(rows, { existingSkus });

    if (report.fatal) {
      return res.status(400).json({ success: false, error: report.fatal });
    }

    const summary = {
      total: rows.length - 1,
      validCount: report.valid.length,
      invalid: report.invalid,
      warnings: report.warnings,
      unknownHeaders: report.unknownHeaders,
      preview: report.valid.slice(0, 5),
    };

    if (dryRun) {
      return res.status(200).json({ success: true, dryRun: true, data: summary });
    }

    if (report.valid.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Import qilinadigan yaroqli qator yo'q",
      });
    }

    // ordered:false keeps going past a row the database rejects, so one bad
    // record does not discard the rest of the file.
    let insertedCount = 0;
    try {
      const inserted = await Product.insertMany(report.valid, { ordered: false });
      insertedCount = inserted.length;
    } catch (error) {
      insertedCount = error?.insertedDocs?.length ?? 0;
      const writeErrors = error?.writeErrors || [];
      if (insertedCount === 0 && writeErrors.length === 0) throw error;

      return res.status(200).json({
        success: true,
        data: {
          ...summary,
          insertedCount,
          failedCount: writeErrors.length,
          message: `${insertedCount} ta mahsulot qo'shildi, ${writeErrors.length} tasi bazaga yozilmadi`,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...summary,
        insertedCount,
        failedCount: 0,
        message: `${insertedCount} ta mahsulot muvaffaqiyatli qo'shildi`,
      },
    });
  } catch (error) {
    if (error?.code === 'ETOOBIG' || /maxFileSize/i.test(error?.message || '')) {
      return res.status(400).json({ success: false, error: 'Fayl hajmi 5MB dan oshmasligi kerak' });
    }
    sendError(res, error);
  } finally {
    if (filepath) {
      fs.promises.unlink(filepath).catch(() => {});
    }
  }
}
