"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitCustomOrderAction } from "@/actions/products";
export default function CustomOrderForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await submitCustomOrderAction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/"), 3000);
      }
    } catch {
      setError("يجب تسجيل الدخول أولاً");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-arabic text-olive font-bold">
          تم إرسال طلبك بنجاح!
        </h2>
        <p className="text-charcoal/60 font-arabic mt-2">
          سيتواصل معك فريقنا قريباً بعرض السعر
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-burgundy/10 border border-burgundy/20 rounded text-burgundy font-arabic text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block font-arabic text-olive mb-2">
          وصف الطلب بالتفصيل *
        </label>
        <textarea
          name="description"
          required
          rows={6}
          className="input-field resize-none"
          placeholder="الأبعاد، الألوان، المواد، المناسبة..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-arabic text-olive mb-2">
            الميزانية المتوقعة (ج.م)
          </label>
          <input
            type="number"
            name="estimatedBudget"
            className="input-field"
            placeholder="500"
            min="0"
          />
        </div>
        <div>
          <label className="block font-arabic text-olive mb-2">
            تاريخ المناسبة
          </label>
          <input type="date" name="targetDate" className="input-field" />
        </div>
      </div>

      <div>
        <label className="block font-arabic text-olive mb-2">
          صور مرجعية (حتى 3 صور)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              type="file"
              name={`image${i}`}
              accept="image/*"
              className="input-field text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-olive file:text-ivory file:font-arabic file:cursor-pointer"
            />
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "جاري الإرسال..." : "إرسال الطلب"}
      </button>
    </form>
  );
}
