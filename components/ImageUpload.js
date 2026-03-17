import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ImageUpload({ images, setImages }) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setIsUploading(true);
      const uploadedUrls = [];

      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await axios.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          uploadedUrls.push(response.data.url);
          toast.success(`${file.name} yuklandi`);
        } catch (error) {
          const msg = error.response?.data?.error || `${file.name} yuklanmadi`;
          toast.error(msg);
          console.error('Upload error:', error);
        }
      }

      if (uploadedUrls.length > 0) {
        setImages([...images, ...uploadedUrls]);
      }
      setIsUploading(false);
    },
    [images, setImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  function removeImage(index) {
    setImages(images.filter((_, i) => i !== index));
    toast.success("Rasm o'chirildi");
  }

  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-semibold mb-2">Rasmlar</label>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} disabled={isUploading} />
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-2"></div>
            <p className="text-gray-600">Yuklanmoqda...</p>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-600">Rasmlarni bu yerga tashlang...</p>
        ) : (
          <div>
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600 mb-2">Rasmlarni bu yerga torting yoki bosing</p>
            <p className="text-sm text-gray-500">PNG, JPG, GIF, WEBP (max 5MB)</p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Rasm ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
                onError={(e) => { e.target.src = '/placeholder-image.svg'; }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500 mt-2">
        Cloudinary sozlash uchun <code className="bg-gray-100 px-1 rounded">.env</code> faylida{' '}
        <code className="bg-gray-100 px-1 rounded">CLOUDINARY_CLOUD_NAME</code>,{' '}
        <code className="bg-gray-100 px-1 rounded">CLOUDINARY_API_KEY</code>,{' '}
        <code className="bg-gray-100 px-1 rounded">CLOUDINARY_API_SECRET</code> ni kiriting.
      </p>
    </div>
  );
}
