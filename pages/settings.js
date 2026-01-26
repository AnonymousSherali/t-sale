import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";

export default function Settings() {
  const { data: session } = useSession();

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sozlamalar</h1>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Profil</h2>
          <div className="flex items-center gap-4 mb-4">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name}
                className="w-20 h-20 rounded-full"
              />
            )}
            <div>
              <p className="font-bold text-gray-800">{session?.user?.name}</p>
              <p className="text-sm text-gray-600">{session?.user?.email}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Google orqali tizimga kirilgan
          </p>
        </div>

        {/* Shop Info Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Do'kon ma'lumotlari
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Do'kon nomi
              </label>
              <input
                type="text"
                placeholder="Do'kon nomini kiriting"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Telefon raqami
              </label>
              <input
                type="tel"
                placeholder="+998 XX XXX XX XX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Manzil
              </label>
              <textarea
                placeholder="Do'kon manzilini kiriting"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              ></textarea>
            </div>
            <p className="text-sm text-gray-500 italic">
              Ushbu funksiyalar keyingi yangilanishda qo'shiladi
            </p>
          </div>
        </div>

        {/* System Info Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Tizim ma'lumotlari
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span className="font-semibold">Versiya:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Framework:</span>
              <span>Next.js 13.4</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Ma'lumotlar bazasi:</span>
              <span>MongoDB</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Autentifikatsiya:</span>
              <span>NextAuth.js (Google OAuth)</span>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-2">
            E-commerce Admin Panel
          </h2>
          <p className="text-sm text-blue-800 mb-4">
            To'liq funksional admin panel mahsulotlar, buyurtmalar va
            statistikalarni boshqarish uchun.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
              Product CRUD
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
              Order Management
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
              Dashboard Stats
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
              Image Upload
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
              Search & Filter
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
              Pagination
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
