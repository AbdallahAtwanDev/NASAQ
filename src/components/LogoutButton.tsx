"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-ivory/60 hover:text-ivory text-sm font-arabic transition-colors cursor-pointer"
    >
      خروج
    </button>
  );
}
