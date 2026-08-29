export const dynamic = "force-dynamic";

import { getAdminCategories } from "@/actions/admin-categories";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <h1 className="text-2xl font-arabic font-bold text-olive mb-8">إضافة منتج جديد</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
