export const dynamic = "force-dynamic";

import Link from "next/link";
import GridPattern from "@/components/GridPattern";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/constants";
import { getFeaturedProducts, getCraftSupplies } from "@/actions/products";

export default async function HomePage() {
  const [featured, craftSupplies] = await Promise.all([
    getFeaturedProducts(),
    getCraftSupplies(),
  ]);

  return (
    <>
      <section className="relative bg-ivory overflow-hidden">
        <GridPattern />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-2xl">
            <p className="font-editorial text-mustard text-lg mb-2">
              Handmade with Love
            </p>
            <h1 className="text-4xl md:text-6xl font-arabic font-bold text-olive leading-tight">
              إبداعات يدوية
              <br />
              <span className="text-burgundy">بنَسَق فريد</span>
            </h1>
            <p className="mt-6 text-charcoal/70 font-arabic text-lg leading-relaxed">
              اكتشف قطعاً فريدة صنعها حرفيون مصريون، أو اطلب قطعة مخصصة تنفّذ
              فكرتك بأيدٍ ماهرة.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/products" className="btn-primary">
                تصفح المنتجات
              </Link>
              <Link href="/custom-order" className="btn-outline">
                طلب مخصص
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="section-title text-center mb-2">إبداعاتنا</h2>
        <p className="text-center text-brown/60 font-editorial mb-10">
          Our Creations
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?subCategory=${cat.slug}`}
              className="card p-6 text-center hover:border-mustard/30 transition-colors group"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-olive/5 flex items-center justify-center group-hover:bg-mustard/10 transition-colors">
                <span className="text-olive text-xl">✦</span>
              </div>
              <h3 className="font-arabic text-olive text-sm font-medium">
                {cat.labelAr}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="section-title mb-10">منتجات مميزة</h2>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                images={product.images}
                isUniquePiece={product.isUniquePiece}
                makerName={product.maker?.brandName}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-charcoal/50 font-arabic py-12">
            لا توجد منتجات حالياً — سيتم إضافتها قريباً
          </p>
        )}
      </section>

      <section className="bg-burgundy relative overflow-hidden">
        <GridPattern />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-arabic font-bold text-ivory mb-4">
            نفّذ فكرتك الخاصة بأيدي حرفيينا
          </h2>
          <p className="text-ivory/70 font-arabic max-w-xl mx-auto mb-8">
            صف لنا ما تتخيله وسنحوّله إلى قطعة فريدة مصنوعة يدوياً
          </p>
          <Link
            href="/custom-order"
            className="inline-block bg-ivory text-burgundy px-8 py-3 rounded font-arabic font-medium hover:bg-ivory/90 transition-colors"
          >
            اطلب الآن
          </Link>
        </div>
      </section>

      {craftSupplies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-10">
            <h2 className="section-title">خيوط وأدوات</h2>
            <span className="badge-mustard">شراء بالجملة</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {craftSupplies.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                images={product.images}
                isUniquePiece={product.isUniquePiece}
                makerName={product.maker?.brandName}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
