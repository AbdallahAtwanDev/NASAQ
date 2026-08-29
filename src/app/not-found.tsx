import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-arabic text-olive font-bold mb-4">404</h1>
      <p className="font-arabic text-charcoal/60 mb-8">الصفحة غير موجودة</p>
      <Link href="/" className="btn-primary">
        العودة للرئيسية
      </Link>
    </div>
  );
}
