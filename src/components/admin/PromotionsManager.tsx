"use client";

import { useState } from "react";
import { createPromotionAction, deletePromotionAction } from "@/actions/admin-promotions";
import DeleteButton from "@/components/admin/DeleteButton";
import Image from "next/image";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  discountPercent: number | null;
  isActive: boolean;
  sortOrder: number;
}

export default function PromotionsManager({ promotions }: { promotions: Promotion[] }) {
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await createPromotionAction(new FormData(e.currentTarget));
    window.location.reload();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="card p-6 space-y-4 max-w-xl">
        <h2 className="font-arabic font-bold text-olive">إضافة عرض جديد</h2>
        <input name="title" placeholder="عنوان العرض" required className="input-field" />
        <textarea name="description" placeholder="وصف العرض" rows={3} className="input-field resize-none" />
        <input name="linkUrl" placeholder="رابط (اختياري)" className="input-field" />
        <input name="discountPercent" type="number" placeholder="نسبة الخصم %" className="input-field" />
        <input name="image" type="file" accept="image/*" className="input-field text-sm" />
        <div className="grid grid-cols-2 gap-4">
          <input name="startsAt" type="date" className="input-field" />
          <input name="endsAt" type="date" className="input-field" />
        </div>
        <label className="flex items-center gap-2 font-arabic text-sm cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked className="accent-olive" />
          نشط
        </label>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "..." : "إضافة العرض"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map((promo) => (
          <div key={promo.id} className="card p-4 flex gap-4">
            {promo.imageUrl && (
              <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                <Image src={promo.imageUrl} alt="" fill className="object-cover" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-arabic font-bold text-olive">{promo.title}</h3>
              {promo.discountPercent && (
                <span className="badge-mustard">خصم {promo.discountPercent}%</span>
              )}
              <div className="mt-2">
                <DeleteButton id={promo.id} action={deletePromotionAction} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
