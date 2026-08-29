"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/admin", label: "الرئيسية", icon: "◈" },
  { href: "/admin/products", label: "المنتجات", icon: "◆" },
  { href: "/admin/categories", label: "الأقسام", icon: "◇" },
  { href: "/admin/promotions", label: "العروض", icon: "★" },
  { href: "/admin/orders", label: "الطلبات", icon: "◎" },
  { href: "/admin/settings", label: "الإعدادات", icon: "⚙" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-olive text-ivory min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <Link href="/admin" className="text-2xl font-arabic font-bold">
          نَسَق
        </Link>
        <p className="text-ivory/50 text-sm font-arabic mt-1">لوحة التحكم</p>
      </div>

      <nav className="space-y-1 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded font-arabic text-sm transition-colors ${
              pathname === link.href || pathname.startsWith(link.href + "/")
                ? "bg-mustard/20 text-mustard"
                : "text-ivory/70 hover:bg-ivory/10 hover:text-ivory"
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-ivory/10 pt-4 space-y-2">
        <Link
          href="/"
          className="block px-4 py-2 text-ivory/60 hover:text-ivory font-arabic text-sm"
        >
          ← عرض الموقع
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-right px-4 py-2 text-burgundy/80 hover:text-burgundy font-arabic text-sm cursor-pointer"
        >
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
