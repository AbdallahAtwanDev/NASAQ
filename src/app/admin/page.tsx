export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getPendingOrders,
  getAllOrders,
  getShippingRatesAdmin,
  getCustomOrders,
  getAdminStats,
} from "@/actions/admin";
import AdminOrdersPanel from "@/components/admin/AdminOrdersPanel";
import ShippingRatesPanel from "@/components/admin/ShippingRatesPanel";
import CustomOrdersPanel from "@/components/admin/CustomOrdersPanel";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const [stats, pendingOrders, allOrders, shippingRates, customOrders] =
    await Promise.all([
      getAdminStats(),
      getPendingOrders(),
      getAllOrders(),
      getShippingRatesAdmin(),
      getCustomOrders(),
    ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="section-title mb-8">لوحة التحكم</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "بانتظار الدفع", value: stats.pendingPayments },
          { label: "إجمالي الطلبات", value: stats.totalOrders },
          { label: "المنتجات", value: stats.totalProducts },
          { label: "طلبات مخصصة", value: stats.customOrders },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <p className="text-2xl font-ui font-bold text-mustard">
              {stat.value}
            </p>
            <p className="text-sm font-arabic text-charcoal/60">{stat.label}</p>
          </div>
        ))}
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-arabic font-bold text-olive mb-6">
          إدارة الطلبات
        </h2>
        <AdminOrdersPanel
          pendingOrders={pendingOrders}
          allOrders={allOrders}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-arabic font-bold text-olive mb-6">
          الطلبات المخصصة
        </h2>
        <CustomOrdersPanel orders={customOrders} />
      </section>

      <section>
        <h2 className="text-xl font-arabic font-bold text-olive mb-6">
          أسعار الشحن
        </h2>
        <ShippingRatesPanel rates={shippingRates} />
      </section>
    </div>
  );
}
