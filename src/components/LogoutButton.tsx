"use client";

import { logoutAction } from "@/actions/auth";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logoutAction();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-ivory/60 hover:text-ivory text-sm font-arabic transition-colors cursor-pointer"
    >
      خروج
    </button>
  );
}
