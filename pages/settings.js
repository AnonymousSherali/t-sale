import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Settings() {
  const { data: session } = useSession();

  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState("so'm");
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    axios.get('/api/settings')
      .then(res => {
        const d = res.data.data;
        if (d) {
          setShopName(d.shopName || '');
          setPhone(d.phone || '');
          setAddress(d.address || '');
          setEmail(d.email || '');
          setCurrency(d.currency || "so'm");
          setLowStockThreshold(d.lowStockThreshold ?? 10);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  async function saveSettings(e) {
    e.preventDefault();
    setIsSaving(true);
    const loadingToast = toast.loading("Saqlanmoqda...");
    try {
      await axios.put('/api/settings', { shopName, phone, address, email, currency, lowStockThreshold });
      toast.success("Sozlamalar saqlandi!", { id: loadingToast });
    } catch (error) {
      toast.error("Saqlashda xatolik yuz berdi", { id: loadingToast });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Sozlamalar</h1>

      <div className="grid gap-6">
        {/* Profile */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Profil</h2>
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              <img src={session.user.image} alt={session.user.name} className="w-16 h-16 rounded-full" />
            )}
            <div>
              <p className="font-bold text-gray-800">{session?.user?.name}</p>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
              <p className="text-xs text-gray-400 mt-1">Google orqali tizimga kirilgan</p>
            </div>
          </div>
        </div>

        {/* Shop Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Do'kon sozlamalari</h2>
          <form onSubmit={saveSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Do'kon nomi</label>
              <input
                type="text"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                placeholder="Do'kon nomini kiriting"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon raqami</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+998 XX XXX XX XX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="shop@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Manzil</label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Do'kon manzilini kiriting"
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Valyuta</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="so'm">so'm (UZS)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="₽">₽ (RUB)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Kam miqdor ogohlantirish (dona)
                </label>
                <input
                  type="number"
                  min="1"
                  value={lowStockThreshold}
                  onChange={e => setLowStockThreshold(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </form>
        </div>

        {/* System Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tizim ma'lumotlari</h2>
          <div className="space-y-2 text-sm text-gray-600">
            {[
              ['Versiya', '1.0.0'],
              ['Framework', 'Next.js 13.4'],
              ["Ma'lumotlar bazasi", 'MongoDB + Mongoose'],
              ['Autentifikatsiya', 'NextAuth.js (Google OAuth)'],
              ['Rasm yuklash', 'Cloudinary'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                <span className="font-semibold">{label}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
