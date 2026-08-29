import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-arabic">جاري التحميل...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
