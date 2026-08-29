"use client";

import { useState } from "react";

export default function DeleteButton({
  id,
  action,
  label = "حذف",
}: {
  id: string;
  action: (id: string) => Promise<{ success?: boolean }>;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    setLoading(true);
    await action(id);
    window.location.reload();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-burgundy hover:text-burgundy/80 text-sm cursor-pointer disabled:opacity-50"
    >
      {loading ? "..." : label}
    </button>
  );
}
