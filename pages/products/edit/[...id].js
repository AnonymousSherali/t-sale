import Layout from "@/components/Layout";
import ProductForm from "@/components/ProductForm";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function EditProduct() {
  const router = useRouter();
  const { status } = useSession();
  // [...id] returns array, e.g. ['68abc123'] — take first element
  const { id: idParam } = router.query;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || status !== 'authenticated') return;

    // Ignore a response that lands after the user has moved to another product.
    let cancelled = false;

    async function fetchProduct() {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/products/${id}`);
        if (cancelled) return;
        setProduct(response.data.data);
        setError("");
      } catch (err) {
        if (cancelled) return;
        // A 404 is reported by the "not found" state below, not as an error.
        if (err.response?.status !== 404) {
          setError(err.response?.data?.error || "Mahsulotni yuklashda xatolik yuz berdi");
        }
        setProduct(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id, status]);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Mahsulotni tahrirlash</h1>

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
      ) : product ? (
        // Keyed by id: the form seeds its state once, so switching products
        // without a remount would keep showing the previous product's values.
        <ProductForm key={product._id} {...product} />
      ) : (
        <div className="text-center py-8 text-red-600">
          Mahsulot topilmadi
        </div>
      )}
    </Layout>
  );
}
