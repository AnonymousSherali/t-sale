import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Tizimga kirish talab qilinadi' });
  }

  if (req.method === 'POST') {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({ error: 'Rasm topilmadi' });
      }

      // Upload to Cloudinary using unsigned upload
      // Using a public cloudinary cloud for demo purposes
      // In production, you should use your own Cloudinary account
      const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/demo/image/upload';

      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', 'docs_upload_example_us_preset'); // Demo preset

      const uploadResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const data = await uploadResponse.json();

      res.status(200).json({
        success: true,
        url: data.secure_url,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Rasm yuklashda xatolik yuz berdi',
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
