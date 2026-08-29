"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction, registerAction } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [isMaker, setIsMaker] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = isRegister
        ? await registerAction(formData)
        : await loginAction(formData);

      if (result.error) {
        setError(result.error);
      } else {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "/";
        router.push(redirect);
        router.refresh();
      }
    } catch {
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="section-title text-center mb-8">
        {isRegister ? "إنشاء حساب" : "تسجيل الدخول"}
      </h1>

      {error && (
        <div className="p-4 mb-6 bg-burgundy/10 border border-burgundy/20 rounded text-burgundy font-arabic text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <>
            <input
              name="name"
              type="text"
              required
              placeholder="الاسم الكامل"
              className="input-field"
            />
            <input
              name="phone"
              type="tel"
              required
              placeholder="رقم الهاتف"
              className="input-field"
            />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 font-arabic text-sm cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="CUSTOMER"
                  defaultChecked
                  onChange={() => setIsMaker(false)}
                />
                عميل
              </label>
              <label className="flex items-center gap-2 font-arabic text-sm cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="MAKER"
                  onChange={() => setIsMaker(true)}
                />
                حرفي
              </label>
            </div>
            {isMaker && (
              <input
                name="brandName"
                type="text"
                required
                placeholder="اسم العلامة التجارية"
                className="input-field"
              />
            )}
          </>
        )}

        <input
          name="email"
          type="email"
          required
          placeholder="البريد الإلكتروني"
          className="input-field"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="كلمة المرور"
          className="input-field"
          minLength={6}
        />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "جاري..." : isRegister ? "إنشاء حساب" : "دخول"}
        </button>
      </form>

      <p className="text-center mt-6 font-arabic text-sm text-charcoal/60">
        {isRegister ? "لديك حساب؟" : "ليس لديك حساب؟"}{" "}
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
          }}
          className="text-mustard hover:underline cursor-pointer"
        >
          {isRegister ? "تسجيل الدخول" : "إنشاء حساب"}
        </button>
      </p>
    </div>
  );
}
