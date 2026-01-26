import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/orders");
      setOrders(response.data.data);
      setError("");
    } catch (error) {
      setError("Buyurtmalarni yuklashda xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    const loadingToast = toast.loading("Yangilanmoqda...");
    try {
      await axios.put(`/api/orders/${orderId}`, { status: newStatus });
      toast.success("Status yangilandi!", { id: loadingToast });
      fetchOrders();
    } catch (error) {
      toast.error("Yangilashda xatolik yuz berdi", { id: loadingToast });
      console.error(error);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'Kutilmoqda':
        return 'bg-yellow-100 text-yellow-800';
      case 'Tasdiqlandi':
        return 'bg-blue-100 text-blue-800';
      case 'Yetkazilmoqda':
        return 'bg-purple-100 text-purple-800';
      case 'Yetkazildi':
        return 'bg-green-100 text-green-800';
      case 'Bekor qilindi':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Buyurtmalar</h1>
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
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          Hali buyurtmalar yo'q
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleString('uz-UZ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <option value="Kutilmoqda">Kutilmoqda</option>
                    <option value="Tasdiqlandi">Tasdiqlandi</option>
                    <option value="Yetkazilmoqda">Yetkazilmoqda</option>
                    <option value="Yetkazildi">Yetkazildi</option>
                    <option value="Bekor qilindi">Bekor qilindi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Mijoz ma'lumotlari
                  </h4>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Ismi:</span> {order.customerName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Telefon:</span> {order.customerPhone}
                  </p>
                  {order.customerEmail && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Email:</span> {order.customerEmail}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Manzil:</span> {order.customerAddress}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Mahsulotlar ({order.items.length})
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.title} × {item.quantity} = {(item.price * item.quantity).toLocaleString()} so'm
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {order.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    Izoh:
                  </h4>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-lg font-bold text-gray-800 text-right">
                  Jami: {order.totalAmount.toLocaleString()} so'm
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
