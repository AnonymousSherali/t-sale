import Layout from "@/components/Layout";
import ProductForm from "@/components/ProductForm";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  async function fetchProduct() {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data.data);
      setError("");
    } catch (error) {
      setError("Mahsulotni yuklashda xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

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
        <ProductForm {...product} />
      ) : (
        <div className="text-center py-8 text-red-600">
          Mahsulot topilmadi
        </div>
      )}
    </Layout>
  );
}
