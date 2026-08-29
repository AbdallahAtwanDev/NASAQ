export const dynamic = "force-dynamic";

import {
  getPendingOrders,
  getAllOrders,
  getShippingRatesAdmin,
  getCustomOrders,
} from "@/actions/admin";
import AdminOrdersPanel from "@/components/admin/AdminOrdersPanel";
import ShippingRatesPanel from "@/components/admin/ShippingRatesPanel";
import CustomOrdersPanel from "@/components/admin/CustomOrdersPanel";

export default async function AdminOrdersPage() {
  const [pendingOrders, allOrders, shippingRates, customOrders] =
    await Promise.all([
      getPendingOrders(),
      getAllOrders(),
      getShippingRatesAdmin(),
      getCustomOrders(),
    ]);

  return (
    <div className="space-y-12">
      <h1 className="text-2xl font-arabic font-bold text-olive">إدارة الطلبات</h1>

      <section>
        <h2 className="text-lg font-arabic font-bold text-olive mb-6">الطلبات والإيصالات</h2>
        <AdminOrdersPanel pendingOrders={pendingOrders} allOrders={allOrders} />
      </section>

      <section>
        <h2 className="text-lg font-arabic font-bold text-olive mb-6">الطلبات المخصصة</h2>
        <CustomOrdersPanel orders={customOrders} />
      </section>

      <section>
        <h2 className="text-lg font-arabic font-bold text-olive mb-6">أسعار الشحن</h2>
        <ShippingRatesPanel rates={shippingRates} />
      </section>
    </div>
  );
}
