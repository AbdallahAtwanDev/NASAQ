"use client";

import { useState } from "react";
import { createCategoryAction } from "@/actions/admin-categories";
import { deleteCategoryAction } from "@/actions/admin-categories";
import DeleteButton from "@/components/admin/DeleteButton";
import Image from "next/image";

interface Category {
  id: string;
  slug: string;
  labelAr: string;
  labelEn: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function CategoriesManager({ categories }: { categories: Category[] }) {
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await createCategoryAction(formData);
    window.location.reload();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="card p-6 space-y-4 max-w-xl">
        <h2 className="font-arabic font-bold text-olive">إضافة قسم جديد</h2>
        <div className="grid grid-cols-2 gap-4">
          <input name="slug" placeholder="bags" required className="input-field" />
          <input name="labelAr" placeholder="حقائب" required className="input-field" />
          <input name="labelEn" placeholder="Bags" required className="input-field" />
          <input name="sortOrder" type="number" defaultValue="0" className="input-field" />
        </div>
        <input name="image" type="file" accept="image/*" className="input-field text-sm" />
        <label className="flex items-center gap-2 font-arabic text-sm cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked className="accent-olive" />
          نشط
        </label>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "..." : "إضافة القسم"}
        </button>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm font-arabic">
          <thead className="bg-olive/5">
            <tr>
              <th className="p-4 text-right text-olive">الصورة</th>
              <th className="p-4 text-right text-olive">الاسم</th>
              <th className="p-4 text-right text-olive">Slug</th>
              <th className="p-4 text-right text-olive">الترتيب</th>
              <th className="p-4 text-right text-olive">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t border-brown/10">
                <td className="p-4">
                  {cat.imageUrl && (
                    <div className="relative w-10 h-10 rounded overflow-hidden">
                      <Image src={cat.imageUrl} alt="" fill className="object-cover" />
                    </div>
                  )}
                </td>
                <td className="p-4">{cat.labelAr}</td>
                <td className="p-4 font-ui text-charcoal/50">{cat.slug}</td>
                <td className="p-4">{cat.sortOrder}</td>
                <td className="p-4">
                  <DeleteButton id={cat.id} action={deleteCategoryAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
