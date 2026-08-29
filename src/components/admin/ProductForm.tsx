"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/actions/admin-products";

interface Category {
  id: string;
  slug: string;
  labelAr: string;
}

export default function ProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createProductAction(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/admin/products");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 bg-burgundy/10 text-burgundy rounded text-sm font-arabic">{error}</div>
      )}

      <div>
        <label className="block font-arabic text-olive mb-2">اسم المنتج *</label>
        <input name="title" required className="input-field" />
      </div>

      <div>
        <label className="block font-arabic text-olive mb-2">الوصف *</label>
        <textarea name="description" required rows={5} className="input-field resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-arabic text-olive mb-2">السعر (ج.م) *</label>
          <input name="price" type="number" min="0" step="0.01" required className="input-field" />
        </div>
        <div>
          <label className="block font-arabic text-olive mb-2">سعر العرض (اختياري)</label>
          <input name="salePrice" type="number" min="0" step="0.01" className="input-field" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-arabic text-olive mb-2">النوع</label>
          <select name="category" className="input-field">
            <option value="HANDMADE">صنع يدوي</option>
            <option value="CRAFT_SUPPLIES">مستلزمات حرفية</option>
          </select>
        </div>
        <div>
          <label className="block font-arabic text-olive mb-2">القسم</label>
          <select name="categoryId" className="input-field">
            <option value="">بدون قسم</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.labelAr}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-arabic text-olive mb-2">الكمية المتوفرة</label>
        <input name="stock" type="number" min="0" defaultValue="1" className="input-field" />
      </div>

      <div>
        <label className="block font-arabic text-olive mb-2">صور المنتج (حتى 5)</label>
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <input key={i} name={`image${i}`} type="file" accept="image/*" className="input-field text-sm" />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 font-arabic text-sm cursor-pointer">
          <input type="checkbox" name="isUniquePiece" className="accent-olive" />
          قطعة واحدة فقط
        </label>
        <label className="flex items-center gap-2 font-arabic text-sm cursor-pointer">
          <input type="checkbox" name="isFeatured" className="accent-olive" />
          منتج مميز
        </label>
        <label className="flex items-center gap-2 font-arabic text-sm cursor-pointer">
          <input type="checkbox" name="isPublished" defaultChecked className="accent-olive" />
          نشر المنتج
        </label>
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري الحفظ..." : "حفظ المنتج"}
      </button>
    </form>
  );
}
