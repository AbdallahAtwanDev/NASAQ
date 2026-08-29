export const dynamic = "force-dynamic";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/data/products";
import { getActiveCategories } from "@/data/categories";
import { CATEGORIES } from "@/lib/constants";

interface ProductsPageProps {
  searchParams: Promise<{ subCategory?: string; category?: string; categoryId?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [products, dbCategories] = await Promise.all([
    getProducts({
      subCategory: params.subCategory,
      category: params.category,
      categoryId: params.categoryId,
    }),
    getActiveCategories(),
  ]);

  const categories = dbCategories.length > 0
    ? dbCategories
    : CATEGORIES.map((c, i) => ({ id: c.slug, slug: c.slug, labelAr: c.labelAr, labelEn: c.labelEn, sortOrder: i }));

  const activeCategory = categories.find(
    (c) => c.slug === params.subCategory || c.id === params.categoryId
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="section-title mb-2">
        {activeCategory ? activeCategory.labelAr : "جميع المنتجات"}
      </h1>
      <p className="text-brown/60 font-editorial mb-8">
        {activeCategory ? ("labelEn" in activeCategory ? activeCategory.labelEn : "") : "All Products"}
      </p>

      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/products"
          className={`px-4 py-2 rounded text-sm font-arabic border transition-colors ${
            !params.subCategory && !params.categoryId
              ? "bg-olive text-ivory border-olive"
              : "border-brown/15 text-olive hover:bg-olive/5"
          }`}
        >
          الكل
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?categoryId=${cat.id}&subCategory=${cat.slug}`}
            className={`px-4 py-2 rounded text-sm font-arabic border transition-colors ${
              params.subCategory === cat.slug || params.categoryId === cat.id
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
              price={product.salePrice ?? product.price}
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
