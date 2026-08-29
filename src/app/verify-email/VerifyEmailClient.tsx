"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmailAction } from "@/actions/auth";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const [verifiedEmail, setVerifiedEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("رابط غير صالح");
      return;
    }

    verifyEmailAction(token).then((result) => {
      if (result.success) {
        setStatus("success");
        if (result.email) setVerifiedEmail(result.email);
      } else {
        setStatus("error");
        setMessage(result.error || "حدث خطأ");
      }
    });
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <p className="font-arabic text-charcoal/60">جاري التحقق...</p>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-mustard/15 flex items-center justify-center mb-4">
              <span className="text-2xl text-mustard">✓</span>
            </div>
            <h1 className="font-arabic font-bold text-olive text-xl mb-2">
              تم تأكيد بريدك الإلكتروني
            </h1>
            <p className="font-arabic text-sm text-charcoal/60 mb-6">
              يمكنك الآن إدخال كود تأكيد الهاتف ثم تسجيل الدخول
            </p>
            <Link
              href={
                verifiedEmail
                  ? `/verify-phone?email=${encodeURIComponent(verifiedEmail)}`
                  : "/verify-phone"
              }
              className="btn-primary inline-block"
            >
              إدخال كود الهاتف
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-burgundy/10 flex items-center justify-center mb-4">
              <span className="text-2xl text-burgundy">✕</span>
            </div>
            <h1 className="font-arabic font-bold text-burgundy text-xl mb-2">فشل التأكيد</h1>
            <p className="font-arabic text-sm text-charcoal/60 mb-6">{message}</p>
            <Link href="/login" className="btn-primary inline-block">
              العودة لتسجيل الدخول
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
