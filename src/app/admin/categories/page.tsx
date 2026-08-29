export const dynamic = "force-dynamic";

import { getAdminCategories } from "@/actions/admin-categories";
import CategoriesManager from "@/components/admin/CategoriesManager";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return (
    <div>
      <h1 className="text-2xl font-arabic font-bold text-olive mb-8">إدارة الأقسام</h1>
      <CategoriesManager categories={categories} />
    </div>
  );
}
