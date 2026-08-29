export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { getAdminProducts, deleteProductAction } from "@/actions/admin-products";
import { formatEGP } from "@/lib/constants";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-arabic font-bold text-olive">المنتجات</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + إضافة منتج
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm font-arabic">
          <thead className="bg-olive/5 border-b border-brown/15">
            <tr>
              <th className="text-right p-4 text-olive">الصورة</th>
              <th className="text-right p-4 text-olive">الاسم</th>
              <th className="text-right p-4 text-olive">السعر</th>
              <th className="text-right p-4 text-olive">المخزون</th>
              <th className="text-right p-4 text-olive">الحالة</th>
              <th className="text-right p-4 text-olive">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-brown/10 hover:bg-olive/5">
                <td className="p-4">
                  <div className="relative w-12 h-12 rounded overflow-hidden">
                    <Image
                      src={product.images[0] || "/assets/placeholder-product.svg"}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="p-4 text-olive font-medium">{product.title}</td>
                <td className="p-4 font-ui text-mustard">
                  {product.salePrice ? (
                    <>
                      <span className="line-through text-charcoal/40 mr-1">
                        {formatEGP(product.price)}
                      </span>
                      {formatEGP(product.salePrice)}
                    </>
                  ) : (
                    formatEGP(product.price)
                  )}
                </td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded ${product.isPublished ? "bg-mustard/15 text-mustard" : "bg-charcoal/10"}`}>
                    {product.isPublished ? "منشور" : "مسودة"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-olive hover:text-mustard text-sm"
                    >
                      تعديل
                    </Link>
                    <DeleteButton
                      id={product.id}
                      action={deleteProductAction}
                      label="حذف"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center py-12 text-charcoal/50">لا توجد منتجات — أضف أول منتج</p>
        )}
      </div>
    </div>
  );
}
