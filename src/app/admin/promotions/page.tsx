export const dynamic = "force-dynamic";

import { getAdminPromotions } from "@/actions/admin-promotions";
import PromotionsManager from "@/components/admin/PromotionsManager";

export default async function AdminPromotionsPage() {
  const promotions = await getAdminPromotions();
  return (
    <div>
      <h1 className="text-2xl font-arabic font-bold text-olive mb-8">إدارة العروض</h1>
      <PromotionsManager promotions={promotions} />
    </div>
  );
}
