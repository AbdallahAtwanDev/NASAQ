export const dynamic = "force-dynamic";

import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductById } from "@/data/products";
import { formatEGP } from "@/lib/constants";
import AddToCartButton from "@/components/AddToCartButton";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="relative aspect-square rounded overflow-hidden border border-brown/15">
            <Image
              src={product.images[0] || "/assets/placeholder-product.svg"}
              alt={product.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.images.slice(1).map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded overflow-hidden border border-brown/15"
                >
                  <Image
                    src={img}
                    alt={`${product.title} ${i + 2}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex gap-2 mb-4">
            {product.isUniquePiece && (
              <span className="badge-mustard">قطعة واحدة فقط</span>
            )}
            <span className="badge-mustard bg-olive/10 text-olive">صنع يدوياً</span>
          </div>

          <h1 className="text-3xl font-arabic font-bold text-olive">
            {product.title}
          </h1>

          {product.maker && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-olive/5 rounded border border-brown/10">
              <div className="w-10 h-10 rounded-full bg-mustard/20 flex items-center justify-center">
                <span className="text-mustard font-arabic font-bold">
                  {product.maker.brandName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-arabic text-olive font-medium">
                  {product.maker.brandName}
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-mustard text-xs">
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <p className="text-3xl font-ui font-semibold text-mustard mt-6">
            {formatEGP(product.price)}
          </p>

          <p className="text-sm text-charcoal/50 font-arabic mt-2">
            المتوفر: {product.stock} قطعة
          </p>

          {product.category === "CRAFT_SUPPLIES" && (
            <div className="mt-4 p-3 bg-mustard/10 rounded border border-mustard/20">
              <p className="text-sm font-arabic text-olive">
                خصم بالجملة: اطلب 5+ قطع واحصل على خصم 10%
              </p>
            </div>
          )}

          <AddToCartButton
            productId={product.id}
            title={product.title}
            price={product.price}
            image={product.images[0] || ""}
            stock={product.stock}
            category={product.category}
          />

          <div className="mt-10 border-t border-brown/15 pt-8">
            <h2 className="text-xl font-arabic font-bold text-olive mb-4">
              قصة القطعة
            </h2>
            <p className="text-charcoal/70 font-arabic leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
