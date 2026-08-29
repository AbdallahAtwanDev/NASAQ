import { Suspense } from "react";
import LoginPage from "./LoginClient";

export default function Login() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-arabic">جاري التحميل...</div>}>
      <LoginPage />
    </Suspense>
  );
}
