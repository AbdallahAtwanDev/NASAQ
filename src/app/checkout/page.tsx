"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { getShippingRate } from "@/actions/checkout";
import { EGYPTIAN_GOVERNORATES, formatEGP } from "@/lib/constants";
import Image from "next/image";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [shippingCost, setShippingCost] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(30 * 60);

  const [form, setForm] = useState({
    governorate: "القاهرة",
    shippingAddress: "",
    phone: "",
    paymentMethod: "Vodafone Cash",
    giftMessage: "",
    hasGift: false,
    receipt: null as File | null,
  });

  useEffect(() => {
    getShippingRate(form.governorate).then(setShippingCost);
  }, [form.governorate]);

  useEffect(() => {
    if (orderResult && countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [orderResult, countdown]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  async function handleSubmit() {
    if (!form.receipt) {
      setError("يرجى رفع صورة الإيصال");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { createOrderAction } = await import("@/actions/checkout");
      const result = await createOrderAction(
        {
          governorate: form.governorate,
          shippingAddress: form.shippingAddress,
          phone: form.phone,
          paymentMethod: form.paymentMethod,
          giftMessage: form.hasGift ? form.giftMessage : undefined,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        },
        form.receipt
      );

      if (result.error) {
        setError(result.error);
      } else if (result.orderId && result.orderNumber) {
        clearCart();
        setOrderResult({ orderId: result.orderId, orderNumber: result.orderNumber });
        setStep(5);
      }
    } catch {
      setError("يجب تسجيل الدخول أولاً");
      router.push("/login?redirect=/checkout");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0 && !orderResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="section-title mb-4">السلة فارغة</h1>
        <button onClick={() => router.push("/products")} className="btn-primary">
          تصفح المنتجات
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="section-title mb-8">إتمام الطلب</h1>

      {/* Steps indicator */}
      <div className="flex items-center justify-between mb-10">
        {["العنوان", "هدية", "الدفع", "الإيصال", "تأكيد"].map((label, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-ui ${
                step > i + 1
                  ? "bg-mustard text-ivory"
                  : step === i + 1
                    ? "bg-olive text-ivory"
                    : "bg-olive/10 text-olive/40"
              }`}
            >
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span className="text-xs font-arabic mt-1 text-charcoal/50 hidden sm:block">
              {label}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 mb-6 bg-burgundy/10 border border-burgundy/20 rounded text-burgundy font-arabic text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Address */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block font-arabic text-olive mb-2">المحافظة</label>
            <select
              value={form.governorate}
              onChange={(e) =>
                setForm({ ...form, governorate: e.target.value })
              }
              className="input-field"
            >
              {EGYPTIAN_GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <p className="text-sm text-mustard font-arabic mt-1">
              تكلفة الشحن: {formatEGP(shippingCost)}
            </p>
          </div>
          <div>
            <label className="block font-arabic text-olive mb-2">
              عنوان الشحن
            </label>
            <textarea
              value={form.shippingAddress}
              onChange={(e) =>
                setForm({ ...form, shippingAddress: e.target.value })
              }
              className="input-field resize-none"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block font-arabic text-olive mb-2">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <button
            onClick={() => {
              if (!form.shippingAddress || !form.phone) {
                setError("يرجى ملء جميع الحقول");
                return;
              }
              setError("");
              setStep(2);
            }}
            className="btn-primary w-full"
          >
            التالي
          </button>
        </div>
      )}

      {/* Step 2: Gift */}
      {step === 2 && (
        <div className="space-y-4">
          <label className="flex items-center gap-3 font-arabic cursor-pointer">
            <input
              type="checkbox"
              checked={form.hasGift}
              onChange={(e) => setForm({ ...form, hasGift: e.target.checked })}
              className="w-5 h-5 accent-olive"
            />
            <span>إضافة بطاقة هدية مجانية</span>
          </label>
          {form.hasGift && (
            <textarea
              value={form.giftMessage}
              onChange={(e) =>
                setForm({ ...form, giftMessage: e.target.value })
              }
              className="input-field resize-none"
              rows={4}
              placeholder="اكتب رسالتك هنا..."
            />
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-outline flex-1">
              السابق
            </button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1">
              التالي
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="p-6 bg-olive/5 rounded border border-brown/15">
            <h3 className="font-arabic text-olive font-bold mb-4">
              طرق الدفع المتاحة
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 font-arabic cursor-pointer p-3 border border-brown/15 rounded hover:bg-olive/5">
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === "Vodafone Cash"}
                  onChange={() =>
                    setForm({ ...form, paymentMethod: "Vodafone Cash" })
                  }
                />
                <div>
                  <p className="font-medium">فودافون كاش</p>
                  <p className="text-sm text-charcoal/50 font-ui">
                    {process.env.NEXT_PUBLIC_VODAFONE_CASH_NUMBER || "01000000000"}
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 font-arabic cursor-pointer p-3 border border-brown/15 rounded hover:bg-olive/5">
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === "InstaPay"}
                  onChange={() =>
                    setForm({ ...form, paymentMethod: "InstaPay" })
                  }
                />
                <div>
                  <p className="font-medium">إنستاباي</p>
                  <p className="text-sm text-charcoal/50 font-ui">
                    {process.env.NEXT_PUBLIC_INSTAPAY_HANDLE || "@nasaq"}
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="p-4 bg-mustard/10 rounded">
            <p className="font-arabic text-olive">
              المجموع:{" "}
              <span className="font-ui font-bold text-mustard">
                {formatEGP(total + shippingCost)}
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-outline flex-1">
              السابق
            </button>
            <button onClick={() => setStep(4)} className="btn-primary flex-1">
              التالي
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Receipt Upload */}
      {step === 4 && (
        <div className="space-y-4">
          <p className="font-arabic text-charcoal/70">
            قم بتحويل المبلغ ثم ارفع صورة الإيصال
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setForm({
                ...form,
                receipt: e.target.files?.[0] || null,
              })
            }
            className="input-field"
          />
          {form.receipt && (
            <p className="text-sm text-mustard font-arabic">
              ✓ {form.receipt.name}
            </p>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="btn-outline flex-1">
              السابق
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "جاري الإرسال..." : "تأكيد الطلب"}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Confirmation */}
      {step === 5 && orderResult && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4 text-mustard">✓</div>
          <h2 className="text-2xl font-arabic text-olive font-bold">
            تم إرسال طلبك!
          </h2>
          <p className="font-ui text-mustard mt-2 text-lg">
            {orderResult.orderNumber}
          </p>
          <div className="mt-6 p-6 bg-olive/5 rounded border border-brown/15 inline-block">
            <p className="font-arabic text-olive text-sm">
              الوقت المتبقي للتحقق من الإيصال
            </p>
            <p className="text-3xl font-ui font-bold text-burgundy mt-2">
              {formatTime(countdown)}
            </p>
          </div>
          <p className="text-charcoal/50 font-arabic text-sm mt-6 max-w-md mx-auto">
            سيتم مراجعة إيصال الدفع خلال 30 دقيقة. ستتلقى تأكيداً عند الموافقة.
          </p>
        </div>
      )}

      {/* Order summary sidebar */}
      {step < 5 && items.length > 0 && (
        <div className="mt-10 p-6 bg-olive/5 rounded border border-brown/15">
          <h3 className="font-arabic text-olive font-bold mb-4">ملخص الطلب</h3>
          {items.map((item) => (
            <div key={item.productId} className="flex gap-3 mb-3">
              {item.image && (
                <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="font-arabic text-sm text-olive">{item.title}</p>
                <p className="text-xs text-charcoal/50 font-ui">
                  {item.quantity} × {formatEGP(item.price)}
                </p>
              </div>
            </div>
          ))}
          <div className="border-t border-brown/15 pt-3 mt-3 space-y-1">
            <div className="flex justify-between font-arabic text-sm">
              <span>المجموع الفرعي</span>
              <span className="font-ui">{formatEGP(total)}</span>
            </div>
            <div className="flex justify-between font-arabic text-sm">
              <span>الشحن</span>
              <span className="font-ui">{formatEGP(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-arabic font-bold">
              <span>الإجمالي</span>
              <span className="font-ui text-mustard">
                {formatEGP(total + shippingCost)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
