import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { getStatusColor } from "@/lib/orderStatus";

// Written out in full because Tailwind scans source for complete class names —
// an interpolated `bg-${color}-50` would be purged from the build.
const CARD_STYLES = {
  blue: { box: 'bg-blue-50 border-blue-200', label: 'text-blue-600', value: 'text-blue-900', icon: 'text-blue-600' },
  green: { box: 'bg-green-50 border-green-200', label: 'text-green-600', value: 'text-green-900', icon: 'text-green-600' },
  purple: { box: 'bg-purple-50 border-purple-200', label: 'text-purple-600', value: 'text-purple-900', icon: 'text-purple-600' },
  red: { box: 'bg-red-50 border-red-200', label: 'text-red-600', value: 'text-red-900', icon: 'text-red-600' },
};

function StatCard({ label, value, hint, color, children }) {
  const style = CARD_STYLES[color] || CARD_STYLES.blue;
  return (
    <div className={`${style.box} p-6 rounded-lg border`}>
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <p className={`${style.label} text-sm font-semibold`}>{label}</p>
          <p className={`${style.value} text-2xl font-bold mt-2 break-words`}>{value}</p>
          {hint && <p className={`${style.label} text-xs mt-1`}>{hint}</p>}
        </div>
        <svg
          className={`${style.icon} w-10 h-10 shrink-0`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {children}
        </svg>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") fetchStats();
    else if (status === "unauthenticated") setIsLoading(false);
  }, [status]);

  async function fetchStats() {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/stats");
      setStats(response.data.data);
      setError("");
    } catch (err) {
      setError("Statistikani yuklashda xatolik yuz berdi");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const currency = stats?.currency || "so'm";

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bosh sahifa</h1>
        <p className="text-gray-600 mt-1">Salom, {session?.user?.name}</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchStats} className="underline text-sm">
            Qayta urinish
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
          <p className="mt-2 text-gray-600">Yuklanmoqda...</p>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Jami mahsulotlar" value={stats.totalProducts} color="blue">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </StatCard>

            <StatCard
              label="Ombor qiymati"
              value={`${stats.totalValue.toLocaleString()} ${currency}`}
              hint={`${stats.totalStock} dona mahsulot`}
              color="green"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </StatCard>

            <StatCard
              label="Buyurtmalar"
              value={stats.totalOrders}
              hint={`${stats.totalRevenue.toLocaleString()} ${currency} savdo`}
              color="purple"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </StatCard>

            <StatCard
              label="Kam qolgan"
              value={stats.lowStockProducts}
              hint={
                stats.outOfStockProducts > 0
                  ? `${stats.outOfStockProducts} ta tugagan · < ${stats.lowStockThreshold} dona`
                  : `< ${stats.lowStockThreshold} dona`
              }
              color="red"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </StatCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Recent Orders */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Oxirgi buyurtmalar</h2>
                <Link href="/orders" className="text-blue-600 text-sm hover:underline">
                  Barchasini ko'rish
                </Link>
              </div>
              {stats.recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Hali buyurtmalar yo'q</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500 truncate">{order.customerName}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="font-bold text-blue-900">
                          {(order.totalAmount || 0).toLocaleString()} {currency}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Products */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Oxirgi mahsulotlar</h2>
                <Link href="/products" className="text-blue-600 text-sm hover:underline">
                  Barchasini ko'rish
                </Link>
              </div>
              {stats.recentProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Hali mahsulotlar yo'q</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{product.title}</p>
                        <p className="text-sm text-gray-500">
                          {product.createdAt
                            ? new Date(product.createdAt).toLocaleDateString("uz-UZ")
                            : "-"}
                        </p>
                      </div>
                      <p className="font-bold text-blue-900 shrink-0 ml-2">
                        {(product.price || 0).toLocaleString()} {currency}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Kategoriyalar</h2>
            {stats.categories.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Hali kategoriyalar yo'q</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.categories.map((category) => (
                  <span
                    key={category.name}
                    className="bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1.5 rounded-lg text-sm"
                  >
                    {category.name}
                    <span className="ml-2 bg-blue-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {category.count}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </Layout>
  );
}
