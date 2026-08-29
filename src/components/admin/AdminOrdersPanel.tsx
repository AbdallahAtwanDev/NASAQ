"use client";

import { useState } from "react";
import Image from "next/image";
import { verifyPaymentAction, updateOrderStatusAction } from "@/actions/admin";
import { formatEGP } from "@/lib/constants";
import type { PaymentStatus, OrderStatus } from "@prisma/client";

interface OrderWithRelations {
  id: string;
  orderNumber: string;
  totalAmount: number;
  shippingCost: number;
  governorate: string;
  shippingAddress: string;
  phone: string;
  paymentMethod: string;
  receiptImageUrl: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  rejectionReason: string | null;
  giftMessage: string | null;
  createdAt: Date;
  customer: { name: string; email: string; phone?: string };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: { title: string };
  }>;
}

export default function AdminOrdersPanel({
  pendingOrders,
  allOrders,
}: {
  pendingOrders: OrderWithRelations[];
  allOrders: OrderWithRelations[];
}) {
  const [selected, setSelected] = useState<OrderWithRelations | null>(
    pendingOrders[0] || null
  );
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [tab, setTab] = useState<"pending" | "all">("pending");

  const orders = tab === "pending" ? pendingOrders : allOrders;

  async function handleVerify(action: "approve" | "reject") {
    if (!selected) return;
    setLoading(true);
    await verifyPaymentAction(
      selected.id,
      action,
      action === "reject" ? rejectReason : undefined
    );
    setLoading(false);
    window.location.reload();
  }

  async function handleStatusChange(status: OrderStatus) {
    if (!selected) return;
    setLoading(true);
    await updateOrderStatusAction(selected.id, status);
    setLoading(false);
    window.location.reload();
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded font-arabic text-sm ${
            tab === "pending" ? "bg-olive text-ivory" : "bg-olive/10 text-olive"
          }`}
        >
          بانتظار التحقق ({pendingOrders.length})
        </button>
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 rounded font-arabic text-sm ${
            tab === "all" ? "bg-olive text-ivory" : "bg-olive/10 text-olive"
          }`}
        >
          جميع الطلبات
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelected(order)}
              className={`w-full text-right p-4 rounded border transition-colors cursor-pointer ${
                selected?.id === order.id
                  ? "border-olive bg-olive/5"
                  : "border-brown/15 hover:bg-olive/5"
              }`}
            >
              <p className="font-ui text-mustard text-sm">{order.orderNumber}</p>
              <p className="font-arabic text-olive">{order.customer.name}</p>
              <p className="text-xs text-charcoal/50 font-ui">
                {formatEGP(order.totalAmount)}
              </p>
            </button>
          ))}
          {orders.length === 0 && (
            <p className="text-center text-charcoal/50 font-arabic py-8">
              لا توجد طلبات
            </p>
          )}
        </div>

        {selected && (
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative aspect-[3/4] rounded overflow-hidden border border-brown/15">
                <Image
                  src={selected.receiptImageUrl}
                  alt="إيصال الدفع"
                  fill
                  className="object-contain bg-white"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-arabic text-olive font-bold text-lg">
                  تفاصيل الطلب {selected.orderNumber}
                </h3>
                <div className="space-y-2 text-sm font-arabic">
                  <p>
                    <span className="text-charcoal/50">العميل:</span>{" "}
                    {selected.customer.name}
                  </p>
                  <p>
                    <span className="text-charcoal/50">الهاتف:</span>{" "}
                    {selected.phone}
                  </p>
                  <p>
                    <span className="text-charcoal/50">المحافظة:</span>{" "}
                    {selected.governorate}
                  </p>
                  <p>
                    <span className="text-charcoal/50">العنوان:</span>{" "}
                    {selected.shippingAddress}
                  </p>
                  <p>
                    <span className="text-charcoal/50">الدفع:</span>{" "}
                    {selected.paymentMethod}
                  </p>
                  <p>
                    <span className="text-charcoal/50">المجموع:</span>{" "}
                    <span className="font-ui text-mustard">
                      {formatEGP(selected.totalAmount)}
                    </span>
                  </p>
                  {selected.giftMessage && (
                    <p>
                      <span className="text-charcoal/50">رسالة الهدية:</span>{" "}
                      {selected.giftMessage}
                    </p>
                  )}
                </div>

                <div className="border-t border-brown/15 pt-3">
                  {selected.items.map((item) => (
                    <p key={item.id} className="text-sm font-arabic">
                      {item.product.title} × {item.quantity} —{" "}
                      {formatEGP(item.price * item.quantity)}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {selected.paymentStatus === "PENDING" && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleVerify("approve")}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  الموافقة على الدفع
                </button>
                <button
                  onClick={() => handleVerify("reject")}
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded bg-burgundy text-ivory font-arabic hover:bg-burgundy/90 transition-colors cursor-pointer"
                >
                  رفض الدفع
                </button>
              </div>
            )}

            {selected.paymentStatus === "PENDING" && (
              <input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="سبب الرفض (اختياري)"
                className="input-field"
              />
            )}

            {selected.paymentStatus === "APPROVED" && (
              <div className="flex gap-2">
                {(["PREPARING", "SHIPPED", "DELIVERED"] as OrderStatus[]).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={loading || selected.orderStatus === status}
                      className={`px-4 py-2 rounded text-sm font-arabic cursor-pointer ${
                        selected.orderStatus === status
                          ? "bg-mustard text-ivory"
                          : "bg-olive/10 text-olive hover:bg-olive/20"
                      }`}
                    >
                      {status === "PREPARING"
                        ? "قيد التحضير"
                        : status === "SHIPPED"
                          ? "تم الشحن"
                          : "تم التسليم"}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
