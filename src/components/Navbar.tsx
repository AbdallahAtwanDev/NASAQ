import Link from "next/link";
import { Logo } from "./GridPattern";
import { getSession } from "@/lib/auth";
import CartButton from "./CartButton";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const session = await getSession();

  return (
    <nav className="bg-olive sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-ivory/80 hover:text-ivory font-arabic transition-colors"
            >
              الرئيسية
            </Link>
            <Link
              href="/products"
              className="text-ivory/80 hover:text-ivory font-arabic transition-colors"
            >
              المنتجات
            </Link>
            <Link
              href="/custom-order"
              className="text-ivory/80 hover:text-ivory font-arabic transition-colors"
            >
              طلب مخصص
            </Link>
            {session?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-mustard hover:text-mustard/80 font-arabic transition-colors"
              >
                لوحة التحكم
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <CartButton />
            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-ivory/70 text-sm font-arabic hidden sm:inline">
                  {session.name}
                </span>
                <LogoutButton />
              </div>
            ) : (
              <Link href="/login" className="btn-secondary text-sm py-2 px-4">
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
