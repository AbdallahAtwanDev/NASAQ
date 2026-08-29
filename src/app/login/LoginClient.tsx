"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/actions/auth";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register" | "verify">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

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
      if (result.error === "EMAIL_NOT_VERIFIED") {
        setPendingEmail(email);
        setMode("verify");
        setError("يرجى تأكيد بريدك الإلكتروني أولاً");
      } else if (result.error === "PHONE_NOT_VERIFIED") {
        setPendingEmail(email);
        router.push(`/verify-phone?email=${encodeURIComponent(email)}`);
      } else {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
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

    setPendingEmail((formData.get("email") as string).toLowerCase());
    setMode("verify");
    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-arabic font-bold text-olive">نَسَق</h1>
          </Link>
          <p className="text-charcoal/50 font-arabic text-sm mt-2">
            {mode === "login" && "مرحباً بعودتك"}
            {mode === "register" && "انضم إلى عائلة نَسَق"}
            {mode === "verify" && "تأكيد حسابك"}
          </p>
        </div>

        <div className="card p-8 shadow-sm">
          {error && (
            <div className="p-3 mb-5 bg-burgundy/10 border border-burgundy/20 rounded text-burgundy font-arabic text-sm text-center">
              {error}
            </div>
          )}

          {mode === "verify" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-mustard/15 flex items-center justify-center">
                <span className="text-2xl">✉</span>
              </div>
              <h2 className="font-arabic font-bold text-olive text-lg">
                تحقق من بريدك الإلكتروني
              </h2>
              <p className="font-arabic text-sm text-charcoal/60 leading-relaxed">
                أرسلنا رابط تأكيد وكود الهاتف إلى بريدك.
                <br />
                بعد تأكيد البريد، أدخل كود الهاتف.
              </p>
              <Link
                href={`/verify-phone?email=${encodeURIComponent(pendingEmail)}`}
                className="btn-primary block text-center"
              >
                إدخال كود الهاتف
              </Link>
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className="text-sm text-mustard font-arabic hover:underline cursor-pointer"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          )}

          {mode === "login" && (
            <>
              {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" && (
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: redirect })}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-brown/15 rounded font-arabic text-sm hover:bg-olive/5 transition-colors cursor-pointer"
                  >
                    الدخول بحساب Google
                  </button>
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 border-t border-brown/15" />
                    <span className="text-charcoal/40 text-xs font-arabic">أو</span>
                    <div className="flex-1 border-t border-brown/15" />
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block font-arabic text-sm text-olive mb-1.5">
                    البريد الإلكتروني
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="input-field"
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label className="block font-arabic text-sm text-olive mb-1.5">
                    كلمة المرور
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? "جاري الدخول..." : "تسجيل الدخول"}
                </button>
              </form>
            </>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block font-arabic text-sm text-olive mb-1.5">الاسم الكامل</label>
                <input name="name" type="text" required className="input-field" placeholder="اسمك" />
              </div>
              <div>
                <label className="block font-arabic text-sm text-olive mb-1.5">رقم الهاتف</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="input-field"
                  placeholder="01012345678"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block font-arabic text-sm text-olive mb-1.5">البريد الإلكتروني</label>
                <input name="email" type="email" required className="input-field" placeholder="example@email.com" />
              </div>
              <div>
                <label className="block font-arabic text-sm text-olive mb-1.5">كلمة المرور</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="input-field"
                  placeholder="6 أحرف على الأقل"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
              </button>
            </form>
          )}

          {mode !== "verify" && (
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
        </div>
      </div>
    </div>
  );
}
