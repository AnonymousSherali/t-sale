import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function NewOrder() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState([{ productId: '', title: '', price: 0, quantity: 1 }]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    axios.get('/api/products')
      .then(res => setProducts(res.data.data))
      .catch(err => console.error(err));
  }, []);

  function handleProductChange(index, productId) {
    const product = products.find(p => p._id === productId);
    const updated = [...orderItems];
    updated[index] = {
      productId,
      title: product?.title || '',
      price: product?.price || 0,
      quantity: updated[index].quantity,
    };
    setOrderItems(updated);
  }

  function handleQuantityChange(index, qty) {
    const updated = [...orderItems];
    updated[index].quantity = Math.max(1, Number(qty));
    setOrderItems(updated);
  }

  function addItem() {
    setOrderItems([...orderItems, { productId: '', title: '', price: 0, quantity: 1 }]);
  }

  function removeItem(index) {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handleSubmit(e) {
    e.preventDefault();
    const validItems = orderItems.filter(i => i.productId);
    if (validItems.length === 0) {
      toast.error("Kamida bitta mahsulot tanlang");
      return;
    }

    setIsSaving(true);
    const loadingToast = toast.loading("Saqlanmoqda...");
    try {
      const items = validItems.map(i => ({
        product: i.productId,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
      }));
      await axios.post('/api/orders', {
        customerName, customerPhone, customerEmail, customerAddress, notes,
        items,
        totalAmount,
      });
      toast.success("Buyurtma yaratildi!", { id: loadingToast });
      await router.push('/orders');
    } catch (error) {
      const msg = error.response?.data?.error || "Xatolik yuz berdi";
      toast.error(msg, { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Yangi buyurtma</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Mijoz ma'lumotlari</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ism Familiya *</label>
              <input
                type="text" required value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Ism Familiya"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon *</label>
              <input
                type="tel" required value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="+998 XX XXX XX XX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email" value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Manzil *</label>
              <input
                type="text" required value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value)}
                placeholder="Yetkazib berish manzili"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Mahsulotlar</h2>
          <div className="space-y-3">
            {orderItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-6">
                  {index === 0 && <label className="block text-sm font-semibold text-gray-700 mb-1">Mahsulot</label>}
                  <select
                    value={item.productId}
                    onChange={e => handleProductChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— Tanlang —</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.title} ({p.price?.toLocaleString()} so'm)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  {index === 0 && <label className="block text-sm font-semibold text-gray-700 mb-1">Soni</label>}
                  <input
                    type="number" min="1"
                    value={item.quantity}
                    onChange={e => handleQuantityChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-3">
                  {index === 0 && <label className="block text-sm font-semibold text-gray-700 mb-1">Summa</label>}
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                    {(item.price * item.quantity).toLocaleString()} so'm
                  </div>
                </div>
                <div className="col-span-1">
                  {index === 0 && <div className="mb-1 h-5" />}
                  <button
                    type="button" onClick={() => removeItem(index)}
                    disabled={orderItems.length === 1}
                    className="w-full py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addItem}
            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-semibold">
            + Mahsulot qo'shish
          </button>

          <div className="mt-4 pt-4 border-t border-gray-200 text-right">
            <span className="text-lg font-bold text-gray-800">
              Jami: {totalAmount.toLocaleString()} so'm
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Izoh (ixtiyoriy)</label>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            rows="2" placeholder="Qo'shimcha ma'lumot..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={isSaving}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
            {isSaving ? 'Saqlanmoqda...' : 'Buyurtmani saqlash'}
          </button>
          <button type="button" onClick={() => router.push('/orders')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors">
            Bekor qilish
          </button>
        </div>
      </form>
    </Layout>
  );
}
