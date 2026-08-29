"use client";

import { useState } from "react";
import Image from "next/image";
import { saveSettingsAction } from "@/actions/admin-settings";

interface SettingsFormProps {
  settings: Record<string, string>;
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    await saveSettingsAction(new FormData(e.currentTarget));
    setLoading(false);
    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {success && (
        <div className="p-3 bg-mustard/15 text-mustard rounded font-arabic text-sm">
          تم حفظ الإعدادات بنجاح
        </div>
      )}

      <section className="card p-6 space-y-4">
        <h2 className="font-arabic font-bold text-olive text-lg">معلومات الدفع</h2>
        <div>
          <label className="block font-arabic text-sm text-olive mb-1">فودافون كاش</label>
          <input name="vodafone_cash" defaultValue={settings.vodafone_cash} className="input-field" />
        </div>
        <div>
          <label className="block font-arabic text-sm text-olive mb-1">إنستاباي</label>
          <input name="instapay_handle" defaultValue={settings.instapay_handle} className="input-field" />
        </div>
        <div>
          <label className="block font-arabic text-sm text-olive mb-1">QR إنستاباي</label>
          {settings.instapay_qr_url && (
            <div className="relative w-32 h-32 mb-2 rounded overflow-hidden border border-brown/15">
              <Image src={settings.instapay_qr_url} alt="QR" fill className="object-contain" />
            </div>
          )}
          <input type="hidden" name="current_instapay_qr" value={settings.instapay_qr_url || ""} />
          <input name="instapay_qr" type="file" accept="image/*" className="input-field text-sm" />
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-arabic font-bold text-olive text-lg">معلومات التواصل (التذييل)</h2>
        <p className="font-arabic text-sm text-charcoal/50">
          تظهر هذه الروابط في أسفل الموقع
        </p>
        <div>
          <label className="block font-arabic text-sm text-olive mb-1">رقم الهاتف</label>
          <input
            name="contact_phone"
            defaultValue={settings.contact_phone}
            className="input-field"
            placeholder="01012345678"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block font-arabic text-sm text-olive mb-1">رابط واتساب</label>
          <input
            name="contact_whatsapp"
            defaultValue={settings.contact_whatsapp}
            className="input-field"
            placeholder="https://wa.me/201012345678"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block font-arabic text-sm text-olive mb-1">رابط فيسبوك</label>
          <input
            name="facebook_url"
            defaultValue={settings.facebook_url}
            className="input-field"
            placeholder="https://facebook.com/nasaq"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block font-arabic text-sm text-olive mb-1">رابط إنستجرام</label>
          <input
            name="instagram_url"
            defaultValue={settings.instagram_url}
            className="input-field"
            placeholder="https://instagram.com/nasaq"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block font-arabic text-sm text-olive mb-1">البريد الإلكتروني (للعرض الداخلي)</label>
          <input name="contact_email" defaultValue={settings.contact_email} className="input-field" />
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-arabic font-bold text-olive text-lg">إشعارات الإدارة</h2>
        <p className="font-arabic text-sm text-charcoal/50">
          البريد الذي يستقبل إشعارات الطلبات المخصصة والتواصل
        </p>
        <div>
          <label className="block font-arabic text-sm text-olive mb-1">بريد الإشعارات</label>
          <input
            name="admin_notification_email"
            type="email"
            defaultValue={settings.admin_notification_email}
            className="input-field"
            placeholder="admin@nasaq.eg"
          />
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-arabic font-bold text-olive text-lg">الصفحة الرئيسية</h2>
        <div>
          <label className="block font-arabic text-sm text-olive mb-1">عنوان البانر</label>
          <input name="hero_title" defaultValue={settings.hero_title} className="input-field" />
        </div>
        <div>
          <label className="block font-arabic text-sm text-olive mb-1">وصف البانر</label>
          <textarea name="hero_subtitle" defaultValue={settings.hero_subtitle} rows={3} className="input-field resize-none" />
        </div>
      </section>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </button>
    </form>
  );
}
