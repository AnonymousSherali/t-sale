import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import { categories } from '@/lib/categories';
import ImageUpload from './ImageUpload';

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  category: existingCategory,
  images: existingImages,
  stock: existingStock,
  sku: existingSku,
}) {
  const [title, setTitle] = useState(existingTitle || '');
  const [description, setDescription] = useState(existingDescription || '');
  const [price, setPrice] = useState(existingPrice || '');
  const [category, setCategory] = useState(existingCategory || '');
  const [images, setImages] = useState(existingImages || []);
  const [stock, setStock] = useState(existingStock || 0);
  const [sku, setSku] = useState(existingSku || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function saveProduct(e) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const data = { title, description, price, category, images, stock, sku };
    const loadingToast = toast.loading(_id ? "Yangilanmoqda..." : "Saqlanmoqda...");

    try {
      if (_id) {
        // Update existing product
        await axios.put(`/api/products/${_id}`, data);
        toast.success("Mahsulot muvaffaqiyatli yangilandi!", { id: loadingToast });
      } else {
        // Create new product
        await axios.post('/api/products', data);
        toast.success("Mahsulot muvaffaqiyatli qo'shildi!", { id: loadingToast });
      }
      router.push('/products');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.';
      toast.error(errorMsg, { id: loadingToast });
      setError(errorMsg);
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={saveProduct}>
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Mahsulot nomi *
        </label>
        <input
          type="text"
          placeholder="Mahsulot nomi"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Kategoriya
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Kategoriyani tanlang</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Tavsif
        </label>
        <textarea
          placeholder="Mahsulot tavsifi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Narxi (so'm) *
          </label>
          <input
            type="number"
            placeholder="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Miqdor
          </label>
          <input
            type="number"
            placeholder="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            SKU
          </label>
          <input
            type="text"
            placeholder="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <ImageUpload images={images} setImages={setImages} />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/products')}
          disabled={isLoading}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  );
}
