export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAdminStats } from "@/actions/admin";
import { getAdminProducts } from "@/actions/admin-products";
import { getAdminCategories } from "@/actions/admin-categories";
import { getAdminPromotions } from "@/actions/admin-promotions";

export default async function AdminDashboard() {
  const [stats, products, categories, promotions] = await Promise.all([
    getAdminStats(),
    getAdminProducts(),
    getAdminCategories(),
    getAdminPromotions(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-arabic font-bold text-olive mb-8">
        مرحباً بك في لوحة التحكم
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "المنتجات", value: products.length, href: "/admin/products" },
          { label: "الأقسام", value: categories.length, href: "/admin/categories" },
          { label: "العروض", value: promotions.length, href: "/admin/promotions" },
          { label: "طلبات معلقة", value: stats.pendingPayments, href: "/admin/orders" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className="card p-6 hover:border-mustard/30 transition-colors">
            <p className="text-3xl font-ui font-bold text-mustard">{stat.value}</p>
            <p className="text-sm font-arabic text-charcoal/60 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-arabic font-bold text-olive mb-4">إجراءات سريعة</h2>
          <div className="space-y-2">
            <Link href="/admin/products/new" className="btn-primary block text-center">
              + إضافة منتج جديد
            </Link>
            <Link href="/admin/categories" className="btn-outline block text-center">
              إدارة الأقسام
            </Link>
            <Link href="/admin/settings" className="btn-outline block text-center">
              إعدادات التواصل والدفع
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-arabic font-bold text-olive mb-4">آخر المنتجات</h2>
          <div className="space-y-3">
            {products.slice(0, 5).map((p) => (
              <div key={p.id} className="flex justify-between items-center text-sm font-arabic">
                <span className="text-olive truncate">{p.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${p.isPublished ? "bg-mustard/15 text-mustard" : "bg-charcoal/10 text-charcoal/50"}`}>
                  {p.isPublished ? "منشور" : "مسودة"}
                </span>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-charcoal/50 text-sm">لا توجد منتجات بعد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
