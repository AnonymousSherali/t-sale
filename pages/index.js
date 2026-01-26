import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Stats yuklashda xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Salom, {session?.user?.name}</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
          <p className="mt-2 text-gray-600">Yuklanmoqda...</p>
        </div>
      ) : stats ? (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-600 text-sm font-semibold">
                    Jami mahsulotlar
                  </p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">
                    {stats.totalProducts}
                  </p>
                </div>
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-600 text-sm font-semibold">
                    Umumiy qiymat
                  </p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    {stats.totalValue.toLocaleString()} so'm
                  </p>
                </div>
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-600 text-sm font-semibold">
                    Jami miqdor
                  </p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">
                    {stats.totalStock}
                  </p>
                </div>
                <svg
                  className="w-10 h-10 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-red-600 text-sm font-semibold">
                    Kam miqdordagi
                  </p>
                  <p className="text-3xl font-bold text-red-900 mt-2">
                    {stats.lowStockProducts}
                  </p>
                  <p className="text-xs text-red-600 mt-1">&lt; 10 dona</p>
                </div>
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Products */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Oxirgi mahsulotlar
                </h2>
                <Link
                  href="/products"
                  className="text-blue-600 text-sm hover:underline"
                >
                  Barchasini ko'rish
                </Link>
              </div>
              {stats.recentProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Hali mahsulotlar yo'q
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.recentProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex justify-between items-center border-b border-gray-100 pb-3"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {product.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(product.createdAt).toLocaleDateString('uz-UZ')}
                        </p>
                      </div>
                      <p className="font-bold text-blue-900">
                        {product.price?.toLocaleString()} so'm
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Kategoriyalar
              </h2>
              {stats.categories.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Hali kategoriyalar yo'q
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.categories.map((category, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border-b border-gray-100 pb-3"
                    >
                      <p className="font-semibold text-gray-800">
                        {category.name}
                      </p>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {category.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-red-600">
          Statistika yuklanmadi
        </div>
      )}
    </Layout>
  );
}
