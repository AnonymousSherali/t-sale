import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ORDER_STATUSES, getStatusColor } from "@/lib/orderStatus";

export default function Orders() {
  const { status: authStatus } = useSession();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    if (authStatus === "authenticated") fetchOrders();
    else if (authStatus === "unauthenticated") setIsLoading(false);
  }, [authStatus]);

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
      const msg = error.response?.data?.error || "Yangilashda xatolik yuz berdi";
      toast.error(msg, { id: loadingToast });
    }
  }

  async function deleteOrder() {
    const { _id, orderNumber } = pendingDelete;
    setPendingDelete(null);
    const loadingToast = toast.loading("O'chirilmoqda...");
    try {
      await axios.delete(`/api/orders/${_id}`);
      toast.success(`${orderNumber} o'chirildi`, { id: loadingToast });
      fetchOrders();
    } catch (error) {
      const msg = error.response?.data?.error || "O'chirishda xatolik yuz berdi";
      toast.error(msg, { id: loadingToast });
    }
  }

  const visibleOrders = filterStatus
    ? orders.filter((o) => o.status === filterStatus)
    : orders;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buyurtmalar</h1>
        <Link
          href="/orders/new"
          className="bg-blue-900 text-white rounded-lg py-2 px-4 hover:bg-blue-800 transition-colors"
        >
          Yangi buyurtma
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <label className="text-sm text-gray-600">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Barchasi ({orders.length})</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s} ({orders.filter((o) => o.status === s).length})
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
          <p className="mt-2 text-gray-600">Yuklanmoqda...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          Hali buyurtmalar yo'q. Birinchi buyurtmani qo'shing!
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          Bu statusda buyurtma yo'q
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleOrders.map((order) => (
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
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("uz-UZ")
                      : "-"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold border-0 ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setPendingDelete(order)}
                    title="Buyurtmani o'chirish"
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    O'chirish
                  </button>
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
                    <span className="font-semibold">Telefon:</span>{" "}
                    <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:underline">
                      {order.customerPhone}
                    </a>
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
                    Mahsulotlar ({order.items?.length || 0})
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {(order.items || []).map((item, index) => (
                      <li key={index}>
                        {item.title} × {item.quantity} ={" "}
                        {((item.price || 0) * (item.quantity || 0)).toLocaleString()} so'm
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {order.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Izoh:</h4>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-lg font-bold text-gray-800 text-right">
                  Jami: {(order.totalAmount || 0).toLocaleString()} so'm
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Buyurtmani o'chirish"
        message={`${pendingDelete?.orderNumber} buyurtmasini o'chirmoqchimisiz? Mahsulotlar omborga qaytariladi.`}
        confirmLabel="O'chirish"
        onConfirm={deleteOrder}
        onCancel={() => setPendingDelete(null)}
      />
    </Layout>
  );
}
