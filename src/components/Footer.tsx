import Link from "next/link";
import GridPattern from "./GridPattern";

export default function Footer() {
  return (
    <footer className="bg-olive text-ivory relative overflow-hidden mt-20">
      <GridPattern />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-arabic font-bold text-ivory mb-2">
              نَسَق
            </h3>
            <p className="text-ivory/60 font-editorial">
              Handmade Art & Craft Supplies
            </p>
            <p className="text-ivory/50 text-sm mt-4 font-arabic">
              منصة للفن اليدوي ومستلزمات الحرف في مصر
            </p>
          </div>

          <div>
            <h4 className="font-arabic font-bold text-ivory mb-4">روابط سريعة</h4>
            <ul className="space-y-2 font-arabic text-ivory/70">
              <li>
                <Link href="/products" className="hover:text-mustard transition-colors">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className="hover:text-mustard transition-colors">
                  طلب مخصص
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-mustard transition-colors">
                  تسجيل الدخول
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-arabic font-bold text-ivory mb-4">تواصل معنا</h4>
            <p className="text-ivory/70 font-arabic text-sm">
              فودافون كاش: {process.env.NEXT_PUBLIC_VODAFONE_CASH_NUMBER || "01000000000"}
            </p>
            <p className="text-ivory/70 font-arabic text-sm mt-1">
              إنستاباي: {process.env.NEXT_PUBLIC_INSTAPAY_HANDLE || "@nasaq"}
            </p>
          </div>
        </div>

        <div className="border-t border-ivory/10 mt-8 pt-6 text-center">
          <p className="text-ivory/40 text-sm font-arabic">
            © {new Date().getFullYear()} نَسَق NASAQ — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}
