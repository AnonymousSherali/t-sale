import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import { categories } from "@/lib/categories";
import ProductThumbnail from "@/components/ProductThumbnail";
import ConfirmDialog from "@/components/ConfirmDialog";
import ImportProducts from "@/components/ImportProducts";

export default function Products() {
  const { status } = useSession();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Only hit the API once NextAuth confirms a session, otherwise every page
  // load while signed out fires a request that comes back 401.
  useEffect(() => {
    if (status === "authenticated") fetchProducts();
    else if (status === "unauthenticated") setIsLoading(false);
  }, [status]);

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

  async function deleteProduct() {
    const { _id, title } = pendingDelete;
    setPendingDelete(null);
    const loadingToast = toast.loading("O'chirilmoqda...");
    try {
      await axios.delete(`/api/products/${_id}`);
      toast.success(`"${title}" o'chirildi`, { id: loadingToast });
      fetchProducts();
    } catch (error) {
      const msg = error.response?.data?.error || "O'chirishda xatolik yuz berdi";
      toast.error(msg, { id: loadingToast });
    }
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = (product.title || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        !filterCategory || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "name-az":
          return (a.title || "").localeCompare(b.title || "");
        case "name-za":
          return (b.title || "").localeCompare(a.title || "");
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  // Clamp the page so deleting the last row of the last page doesn't strand the
  // user on an empty page.
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, sortBy, itemsPerPage]);

  return (
    <Layout>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">Mahsulotlar</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsImportOpen(true)}
            className="border border-blue-900 text-blue-900 rounded-lg py-2 px-4 hover:bg-blue-50 transition-colors"
          >
            Excel'dan import
          </button>
          <Link
            className="bg-blue-900 text-white rounded-lg py-2 px-4 hover:bg-blue-800 transition-colors"
            href={"/products/new"}
          >
            Yangi mahsulot qo'shish
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Search, Filter, Sort */}
      {!isLoading && products.length > 0 && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Barcha kategoriyalar</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Yangilar</option>
              <option value="oldest">Eskilar</option>
              <option value="price-low">Narx: Kamdan ko'pga</option>
              <option value="price-high">Narx: Ko'pdan kamga</option>
              <option value="name-az">Nom: A-Z</option>
              <option value="name-za">Nom: Z-A</option>
            </select>
          </div>
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
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          Qidiruv natijalari topilmadi
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="mb-2 text-sm text-gray-600">
            {filteredProducts.length} ta mahsulot topildi
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-center w-20">
                  Rasm
                </th>
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
              {paginatedProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <ProductThumbnail product={product} />
                  </td>
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
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-semibold ${
                        (product.stock ?? 0) <= 0
                          ? 'bg-red-100 text-red-800'
                          : product.stock < 10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {product.stock ?? 0}
                    </span>
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
                        onClick={() => setPendingDelete(product)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">
                  Sahifada:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={safePage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage(safePage - 1)}
                  disabled={safePage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (safePage <= 3) {
                      pageNum = i + 1;
                    } else if (safePage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = safePage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 border rounded-lg ${
                          safePage === pageNum
                            ? 'bg-blue-900 text-white border-blue-900'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safePage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  »
                </button>
              </div>

              <div className="text-sm text-gray-600">
                {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} / {filteredProducts.length}
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Mahsulotni o'chirish"
        message={`"${pendingDelete?.title}" mahsulotini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
        confirmLabel="O'chirish"
        onConfirm={deleteProduct}
        onCancel={() => setPendingDelete(null)}
      />

      <ImportProducts
        open={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImported={fetchProducts}
      />
    </Layout>
  );
}