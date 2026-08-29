export const dynamic = "force-dynamic";

import { getAdminSettings } from "@/actions/admin-settings";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();
  return (
    <div>
      <h1 className="text-2xl font-arabic font-bold text-olive mb-2">إعدادات الموقع</h1>
      <p className="text-charcoal/50 font-arabic text-sm mb-8">
        تحكم في معلومات الدفع والتواصل — التغييرات تُحفظ في قاعدة البيانات ولن تُفقد عند تحديث الكود
      </p>
      <SettingsForm settings={settings} />
    </div>
  );
}
