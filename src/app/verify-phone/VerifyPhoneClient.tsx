"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyPhoneAction, resendOtpAction } from "@/actions/auth";

export default function VerifyPhoneClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) {
      setError("رقم الهاتف مطلوب");
      return;
    }
    setLoading(true);
    setError("");

    const result = await verifyPhoneAction(phone, code);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/login?verified=1");
  }

  async function handleResend() {
    if (!phone) return;
    setResent(false);
    setError("");
    const result = await resendOtpAction(phone);
    if (result.error) {
      setError(result.error);
      return;
    }
    setResent(true);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-mustard/15 flex items-center justify-center mb-4">
            <span className="text-2xl">📱</span>
          </div>
          <h1 className="font-arabic font-bold text-olive text-xl">تأكيد رقم الهاتف</h1>
          <p className="font-arabic text-sm text-charcoal/60 mt-2">
            أدخل الكود المُرسل في رسالة SMS إلى
          </p>
          {phone && (
            <p className="font-mono text-olive font-bold mt-1" dir="ltr">{phone}</p>
          )}
        </div>

        {error && (
          <div className="p-3 mb-4 bg-burgundy/10 border border-burgundy/20 rounded text-burgundy font-arabic text-sm text-center">
            {error}
          </div>
        )}

        {resent && (
          <div className="p-3 mb-4 bg-mustard/15 rounded text-mustard font-arabic text-sm text-center">
            تم إرسال كود جديد
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-arabic text-sm text-olive mb-1.5">كود التأكيد</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              className="input-field text-center text-2xl tracking-[0.5em] font-mono"
              placeholder="000000"
              dir="ltr"
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "جاري التحقق..." : "تأكيد"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-mustard font-arabic hover:underline cursor-pointer"
          >
            إعادة إرسال الكود
          </button>
          <br />
          <Link href="/login" className="text-sm text-charcoal/50 font-arabic hover:underline">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
