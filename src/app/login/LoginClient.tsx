"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { registerAction } from "@/actions/auth";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get("redirect") || "/";

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      console.error("Login error:", result.error);
      setError(
        result.error === "Configuration"
          ? "خطأ في إعدادات السيرفر — تأكد من NEXTAUTH_SECRET على Vercel"
          : "بيانات الدخول غير صحيحة — جرّب: admin@nasaq.eg / admin123"
      );
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await signIn("credentials", { email, password, redirect: false });
    router.push(redirect);
    router.refresh();
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

      {!isRegister && (
        <div className="space-y-3 mb-6">
          {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" && (
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: redirect })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-brown/15 rounded font-arabic text-sm hover:bg-olive/5 transition-colors cursor-pointer"
            >
              <span className="text-lg">G</span>
              الدخول بحساب Google
            </button>
          )}
          {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" && (
            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-brown/15" />
              <span className="text-charcoal/40 text-sm font-arabic">أو</span>
              <div className="flex-1 border-t border-brown/15" />
            </div>
          )}
        </div>
      )}

      <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
        {isRegister && (
          <>
            <input name="name" type="text" required placeholder="الاسم الكامل" className="input-field" />
            <input name="phone" type="tel" placeholder="رقم الهاتف (اختياري)" className="input-field" />
          </>
        )}

        <input name="email" type="email" required placeholder="البريد الإلكتروني" className="input-field" />
        <input name="password" type="password" required placeholder="كلمة المرور" className="input-field" minLength={6} />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "جاري..." : isRegister ? "إنشاء حساب" : "دخول"}
        </button>
      </form>

      <p className="text-center mt-6 font-arabic text-sm text-charcoal/60">
        {isRegister ? "لديك حساب؟" : "ليس لديك حساب؟"}{" "}
        <button
          type="button"
          onClick={() => { setIsRegister(!isRegister); setError(""); }}
          className="text-mustard hover:underline cursor-pointer"
        >
          {isRegister ? "تسجيل الدخول" : "إنشاء حساب"}
        </button>
      </p>

      <p className="text-center mt-4 font-arabic text-xs text-charcoal/40">
        دخول الإدارة: استخدم بيانات الأدمن المخصصة فقط
      </p>
    </div>
  );
}
