"use client";

import { useState } from "react";
import Image from "next/image";
import { updateCustomOrderAction } from "@/actions/admin";
import { formatEGP } from "@/lib/constants";

interface CustomOrderItem {
  id: string;
  description: string;
  referenceImages: string[];
  estimatedBudget: number | null;
  targetDate: Date | null;
  status: string;
  quotedPrice: number | null;
  adminNotes: string | null;
  createdAt: Date;
  customer: { name: string; email: string; phone: string };
}

const STATUS_LABELS: Record<string, string> = {
  UNDER_REVIEW: "قيد المراجعة",
  PRICED: "تم التسعير",
  PAID: "مدفوع",
  IN_PRODUCTION: "قيد التنفيذ",
  COMPLETED: "مكتمل",
};

export default function CustomOrdersPanel({
  orders,
}: {
  orders: CustomOrderItem[];
}) {
  const [selected, setSelected] = useState<CustomOrderItem | null>(
    orders[0] || null
  );
  const [quotedPrice, setQuotedPrice] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdate(status?: string) {
    if (!selected) return;
    setLoading(true);
    await updateCustomOrderAction(selected.id, {
      status,
      quotedPrice: quotedPrice ? parseFloat(quotedPrice) : undefined,
      adminNotes: adminNotes || undefined,
    });
    setLoading(false);
    window.location.reload();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {orders.map((order) => (
          <button
            key={order.id}
            onClick={() => {
              setSelected(order);
              setQuotedPrice(order.quotedPrice?.toString() || "");
              setAdminNotes(order.adminNotes || "");
            }}
            className={`w-full text-right p-4 rounded border transition-colors cursor-pointer ${
              selected?.id === order.id
                ? "border-olive bg-olive/5"
                : "border-brown/15 hover:bg-olive/5"
            }`}
          >
            <p className="font-arabic text-olive truncate">
              {order.customer.name}
            </p>
            <span className="badge-mustard text-xs">
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-arabic text-olive font-bold">
            طلب من {selected.customer.name}
          </h3>
          <p className="font-arabic text-charcoal/70 whitespace-pre-line">
            {selected.description}
          </p>

          {selected.estimatedBudget && (
            <p className="font-arabic text-sm">
              الميزانية: {formatEGP(selected.estimatedBudget)}
            </p>
          )}

          {selected.referenceImages.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {selected.referenceImages.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded overflow-hidden border border-brown/15">
                  <Image
                    src={img}
                    alt={`مرجع ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              ))}
            </div>
          )}

          <input
            value={quotedPrice}
            onChange={(e) => setQuotedPrice(e.target.value)}
            placeholder="السعر المقترح (ج.م)"
            type="number"
            className="input-field"
          />
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="ملاحظات الإدارة"
            className="input-field resize-none"
            rows={3}
          />

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleUpdate("PRICED")}
              disabled={loading}
              className="btn-primary"
            >
              إرسال السعر
            </button>
            <button
              onClick={() => handleUpdate("IN_PRODUCTION")}
              disabled={loading}
              className="btn-secondary"
            >
              بدء التنفيذ
            </button>
            <button
              onClick={() => handleUpdate("COMPLETED")}
              disabled={loading}
              className="btn-outline"
            >
              مكتمل
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
