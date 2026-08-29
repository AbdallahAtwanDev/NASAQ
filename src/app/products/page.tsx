export const dynamic = "force-dynamic";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/data/products";
import { CATEGORIES } from "@/lib/constants";

interface ProductsPageProps {
  searchParams: Promise<{ subCategory?: string; category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const products = await getProducts({
    subCategory: params.subCategory,
    category: params.category,
  });

  const activeCategory = CATEGORIES.find((c) => c.slug === params.subCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="section-title mb-2">
        {activeCategory ? activeCategory.labelAr : "جميع المنتجات"}
      </h1>
      <p className="text-brown/60 font-editorial mb-8">
        {activeCategory ? activeCategory.labelEn : "All Products"}
      </p>

      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/products"
          className={`px-4 py-2 rounded text-sm font-arabic border transition-colors ${
            !params.subCategory
              ? "bg-olive text-ivory border-olive"
              : "border-brown/15 text-olive hover:bg-olive/5"
          }`}
        >
          الكل
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/products?subCategory=${cat.slug}`}
            className={`px-4 py-2 rounded text-sm font-arabic border transition-colors ${
              params.subCategory === cat.slug
                ? "bg-olive text-ivory border-olive"
                : "border-brown/15 text-olive hover:bg-olive/5"
            }`}
          >
            {cat.labelAr}
          </Link>
        ))}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
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
        <p className="text-center text-charcoal/50 font-arabic py-20">
          لا توجد منتجات في هذا التصنيف حالياً
        </p>
      )}
    </div>
  );
}
