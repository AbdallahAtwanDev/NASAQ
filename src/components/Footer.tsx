import Link from "next/link";
import GridPattern from "./GridPattern";
import { getAllSettings } from "@/lib/settings";

function phoneHref(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

function whatsappHref(value: string) {
  if (value.startsWith("http")) return value;
  const digits = value.replace(/\D/g, "");
  const intl = digits.startsWith("20") ? digits : `20${digits.replace(/^0/, "")}`;
  return `https://wa.me/${intl}`;
}

function externalHref(url: string) {
  if (url.startsWith("http")) return url;
  return `https://${url}`;
}

export default async function Footer() {
  let settings: Record<string, string> = {};
  try {
    settings = await getAllSettings();
  } catch (error) {
    console.error("Footer settings error:", error);
  }

  const contacts = [
    settings.contact_phone && {
      label: settings.contact_phone,
      href: phoneHref(settings.contact_phone),
      external: false,
    },
    settings.contact_whatsapp && {
      label: "واتساب",
      href: whatsappHref(settings.contact_whatsapp),
      external: true,
    },
    settings.facebook_url && {
      label: "فيسبوك",
      href: externalHref(settings.facebook_url),
      external: true,
    },
    settings.instagram_url && {
      label: "إنستجرام",
      href: externalHref(settings.instagram_url),
      external: true,
    },
  ].filter(Boolean) as { label: string; href: string; external: boolean }[];

  return (
    <footer className="bg-olive text-ivory relative overflow-hidden mt-20">
      <GridPattern />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-arabic font-bold text-ivory mb-2">نَسَق</h3>
            <p className="text-ivory/60 font-editorial">Handmade Art & Craft Supplies</p>
          </div>

          <div>
            <h4 className="font-arabic font-bold text-ivory mb-4">روابط سريعة</h4>
            <ul className="space-y-2 font-arabic text-ivory/70">
              <li><Link href="/products" className="hover:text-mustard transition-colors">المنتجات</Link></li>
              <li><Link href="/custom-order" className="hover:text-mustard transition-colors">طلب مخصص</Link></li>
              <li><Link href="/login" className="hover:text-mustard transition-colors">تسجيل الدخول</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-arabic font-bold text-ivory mb-4">تواصل معنا</h4>
            {contacts.length > 0 ? (
              <ul className="space-y-2 font-arabic text-ivory/70">
                {contacts.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="hover:text-mustard transition-colors"
                      dir={item.label.match(/^\d/) ? "ltr" : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ivory/50 font-arabic text-sm">أضف روابط التواصل من لوحة التحكم</p>
            )}
          </div>
        </div>

        <div className="border-t border-ivory/10 mt-8 pt-6 text-center">
          <p className="text-ivory/40 text-sm font-arabic">
            © {new Date().getFullYear()} نَسَق NASAQ — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}
