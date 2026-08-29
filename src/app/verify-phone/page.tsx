import { Suspense } from "react";
import VerifyPhoneClient from "./VerifyPhoneClient";

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-arabic">جاري التحميل...</div>}>
      <VerifyPhoneClient />
    </Suspense>
  );
}
