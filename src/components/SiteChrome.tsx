"use client";

import { usePathname } from "next/navigation";
import SplashScreen from "@/components/SplashScreen";

interface SiteChromeProps {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
}

export default function SiteChrome({ children, navbar, footer }: SiteChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SplashScreen />
      {navbar}
      <main className="flex-1">{children}</main>
      {footer}
    </>
  );
}
