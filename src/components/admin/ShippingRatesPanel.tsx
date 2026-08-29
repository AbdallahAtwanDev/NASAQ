"use client";

import { useState } from "react";
import { upsertShippingRate, deleteShippingRate } from "@/actions/admin";

interface ShippingRate {
  id: string;
  governorate: string;
  cost: number;
}

export default function ShippingRatesPanel({
  rates,
}: {
  rates: ShippingRate[];
}) {
  const [governorate, setGovernorate] = useState("");
  const [cost, setCost] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!governorate || !cost) return;
    setLoading(true);
    await upsertShippingRate(governorate, parseFloat(cost));
    setGovernorate("");
    setCost("");
    setLoading(false);
    window.location.reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد؟")) return;
    await deleteShippingRate(id);
    window.location.reload();
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-3 mb-6">
        <input
          value={governorate}
          onChange={(e) => setGovernorate(e.target.value)}
          placeholder="المحافظة"
          className="input-field flex-1"
          required
        />
        <input
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="التكلفة"
          type="number"
          min="0"
          className="input-field w-32"
          required
        />
        <button type="submit" disabled={loading} className="btn-primary">
          إضافة
        </button>
      </form>

      <div className="space-y-2">
        {rates.map((rate) => (
          <div
            key={rate.id}
            className="flex items-center justify-between p-3 border border-brown/15 rounded"
          >
            <span className="font-arabic text-olive">{rate.governorate}</span>
            <div className="flex items-center gap-4">
              <span className="font-ui text-mustard">{rate.cost} ج.م</span>
              <button
                onClick={() => handleDelete(rate.id)}
                className="text-burgundy text-sm font-arabic hover:underline cursor-pointer"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
