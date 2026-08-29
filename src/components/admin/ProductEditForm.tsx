"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateProductAction } from "@/actions/admin-products";

interface Category {
  id: string;
  slug: string;
  labelAr: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice: number | null;
  category: string;
  categoryId: string | null;
  images: string[];
  stock: number;
  isUniquePiece: boolean;
  isPublished: boolean;
  isFeatured: boolean;
}

export default function ProductEditForm({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keepImages, setKeepImages] = useState(product.images);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("keepImages", keepImages.join(","));
    const result = await updateProductAction(product.id, formData);

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
        <input name="title" defaultValue={product.title} required className="input-field" />
      </div>

      <div>
        <label className="block font-arabic text-olive mb-2">الوصف *</label>
        <textarea name="description" defaultValue={product.description} required rows={5} className="input-field resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-arabic text-olive mb-2">السعر (ج.م)</label>
          <input name="price" type="number" defaultValue={product.price} required className="input-field" />
        </div>
        <div>
          <label className="block font-arabic text-olive mb-2">سعر العرض</label>
          <input name="salePrice" type="number" defaultValue={product.salePrice ?? ""} className="input-field" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-arabic text-olive mb-2">النوع</label>
          <select name="category" defaultValue={product.category} className="input-field">
            <option value="HANDMADE">صنع يدوي</option>
            <option value="CRAFT_SUPPLIES">مستلزمات حرفية</option>
          </select>
        </div>
        <div>
          <label className="block font-arabic text-olive mb-2">القسم</label>
          <select name="categoryId" defaultValue={product.categoryId ?? ""} className="input-field">
            <option value="">بدون قسم</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.labelAr}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-arabic text-olive mb-2">الكمية</label>
        <input name="stock" type="number" defaultValue={product.stock} className="input-field" />
      </div>

      {keepImages.length > 0 && (
        <div>
          <label className="block font-arabic text-olive mb-2">الصور الحالية</label>
          <div className="flex gap-2 flex-wrap">
            {keepImages.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded overflow-hidden group">
                <Image src={img} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setKeepImages(keepImages.filter((_, j) => j !== i))}
                  className="absolute inset-0 bg-burgundy/60 text-ivory opacity-0 group-hover:opacity-100 text-xs cursor-pointer"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block font-arabic text-olive mb-2">إضافة صور جديدة</label>
        {[0, 1, 2].map((i) => (
          <input key={i} name={`image${i}`} type="file" accept="image/*" className="input-field text-sm mb-2" />
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 font-arabic text-sm cursor-pointer">
          <input type="checkbox" name="isUniquePiece" defaultChecked={product.isUniquePiece} className="accent-olive" />
          قطعة واحدة فقط
        </label>
        <label className="flex items-center gap-2 font-arabic text-sm cursor-pointer">
          <input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} className="accent-olive" />
          منتج مميز
        </label>
        <label className="flex items-center gap-2 font-arabic text-sm cursor-pointer">
          <input type="checkbox" name="isPublished" defaultChecked={product.isPublished} className="accent-olive" />
          منشور
        </label>
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
      </button>
    </form>
  );
}
