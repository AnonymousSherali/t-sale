import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: { bodyParser: false },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Tizimga kirish talab qilinadi' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({
      error: 'Cloudinary sozlanmagan. .env faylida CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY va CLOUDINARY_API_SECRET ni kiriting.',
    });
  }

  const form = formidable({ maxFileSize: 5 * 1024 * 1024 }); // 5MB

  form.parse(req, async (err, _fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Fayl o\'qishda xatolik: ' + err.message });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: 'Fayl topilmadi' });
    }

    try {
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: 'ecommerce-products',
        resource_type: 'image',
      });
      fs.unlinkSync(file.filepath);
      res.status(200).json({ success: true, url: result.secure_url });
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      res.status(500).json({ error: 'Rasm yuklashda xatolik: ' + uploadError.message });
    }
  });
}
