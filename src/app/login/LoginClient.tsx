"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/actions/auth";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "1";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get("redirect") || "/";

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    const result = await signIn(
      "credentials",
      isAdmin
        ? { email: formData.get("email") as string, password, redirect: false }
        : { phone: formData.get("phone") as string, password, redirect: false }
    );

    if (result.error) {
      setError(isAdmin ? "بيانات الدخول غير صحيحة" : "رقم الهاتف أو كلمة المرور غير صحيحة");
      setLoading(false);
      return;
    }

    router.push(isAdmin ? "/admin" : redirect);
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

    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    const login = await signIn("credentials", { phone, password, redirect: false });
    if (login?.error) {
      setError("تم إنشاء الحساب — سجّل الدخول يدوياً");
      setMode("login");
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-arabic font-bold text-olive">نَسَق</h1>
          </Link>
          <p className="text-charcoal/50 font-arabic text-sm mt-2">
            {isAdmin
              ? "دخول الإدارة"
              : mode === "login"
                ? "مرحباً بعودتك"
                : "إنشاء حساب جديد"}
          </p>
        </div>

        <div className="card p-8 shadow-sm">
          {error && (
            <div className="p-3 mb-5 bg-burgundy/10 border border-burgundy/20 rounded text-burgundy font-arabic text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block font-arabic text-sm text-olive mb-1.5">الاسم</label>
                <input name="name" type="text" required className="input-field" placeholder="اسمك" />
              </div>
            )}

            {isAdmin ? (
              <div>
                <label className="block font-arabic text-sm text-olive mb-1.5">البريد الإلكتروني</label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="input-field"
                  placeholder="admin@nasaq.eg"
                />
              </div>
            ) : (
              <div>
                <label className="block font-arabic text-sm text-olive mb-1.5">رقم الهاتف</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  className="input-field"
                  placeholder="01012345678"
                  dir="ltr"
                />
              </div>
            )}

            <div>
              <label className="block font-arabic text-sm text-olive mb-1.5">كلمة المرور</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading
                ? "جاري..."
                : mode === "login"
                  ? "تسجيل الدخول"
                  : "إنشاء حساب"}
            </button>
          </form>

          {!isAdmin && (
            <p className="text-center mt-6 font-arabic text-sm text-charcoal/50">
              {mode === "login" ? "ليس لديك حساب؟" : "لديك حساب؟"}{" "}
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                className="text-mustard hover:underline cursor-pointer font-medium"
              >
                {mode === "login" ? "إنشاء حساب" : "تسجيل الدخول"}
              </button>
            </p>
          )}

          <p className="text-center mt-4">
            <Link
              href={isAdmin ? "/login" : "/login?admin=1"}
              className="text-xs text-charcoal/40 font-arabic hover:text-mustard"
            >
              {isAdmin ? "دخول العملاء" : "دخول الإدارة"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
