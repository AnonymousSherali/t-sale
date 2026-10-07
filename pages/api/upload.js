import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';
import { requireSession, sendError } from '@/lib/apiHelpers';

export const config = {
  api: { bodyParser: false },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function parseForm(req) {
  const form = formidable({ maxFileSize: MAX_FILE_SIZE });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}

export default async function handler(req, res) {
  const session = await requireSession(req, res);
  if (!session) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `${req.method} usuli qo'llab-quvvatlanmaydi` });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({
      success: false,
      error:
        'Cloudinary sozlanmagan. .env faylida CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY va CLOUDINARY_API_SECRET ni kiriting.',
    });
  }

  let filepath;
  try {
    // Awaited so the handler doesn't return before the response is written —
    // the callback form left Next.js reporting "API resolved without sending a response".
    const { files } = await parseForm(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'Fayl topilmadi' });
    }
    filepath = file.filepath;

    // The dropzone filters by type in the browser; this is the check that
    // actually holds, since the endpoint can be called directly.
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Faqat JPG, PNG, GIF yoki WEBP rasmlar qabul qilinadi',
      });
    }

    const result = await cloudinary.uploader.upload(filepath, {
      folder: 'ecommerce-products',
      resource_type: 'image',
    });

    res.status(200).json({ success: true, url: result.secure_url });
  } catch (error) {
    if (error?.httpCode === 413) {
      return res.status(400).json({ success: false, error: 'Rasm hajmi 5MB dan oshmasligi kerak' });
    }
    sendError(res, error, 500);
  } finally {
    // Removed on every path, including errors — the old code leaked the temp
    // file whenever the Cloudinary upload failed.
    if (filepath) fs.promises.unlink(filepath).catch(() => {});
  }
}
