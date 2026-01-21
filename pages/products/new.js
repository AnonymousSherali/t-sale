import Layout from "@/components/Layout";
import ProductForm from "@/components/ProductForm";

export default function NewProduct() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Yangi mahsulot qo'shish</h1>
      <ProductForm />
    </Layout>
  );
}