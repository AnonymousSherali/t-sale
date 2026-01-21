import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/products");
      setProducts(response.data.data);
      setError("");
    } catch (error) {
      setError("Mahsulotlarni yuklashda xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteProduct(id, title) {
    if (confirm(`"${title}" mahsulotini o'chirmoqchimisiz?`)) {
      try {
        await axios.delete(`/api/products/${id}`);
        fetchProducts(); // Refresh list
      } catch (error) {
        alert("O'chirishda xatolik yuz berdi");
        console.error(error);
      }
    }
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Mahsulotlar</h1>
        <Link
          className="bg-blue-900 text-white rounded-lg py-2 px-4 hover:bg-blue-800 transition-colors"
          href={"/products/new"}
        >
          Yangi mahsulot qo'shish
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
          <p className="mt-2 text-gray-600">Yuklanmoqda...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          Hali mahsulotlar yo'q. Birinchi mahsulotni qo'shing!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Mahsulot nomi
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Kategoriya
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  Narxi
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Miqdor
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {product.title}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {product.category || "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {product.price ? `${product.price.toLocaleString()} so'm` : "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {product.stock}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <div className="flex gap-2 justify-center">
                      <Link
                        href={`/products/edit/${product._id}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        Tahrirlash
                      </Link>
                      <button
                        onClick={() => deleteProduct(product._id, product.title)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                      >
                        O'chirish
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}