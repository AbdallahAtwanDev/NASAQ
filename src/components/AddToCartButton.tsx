"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: string;
  title: string;
  price: number;
  image: string;
  stock: number;
  category: string;
}

export default function AddToCartButton({
  productId,
  title,
  price,
  image,
  stock,
  category,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ productId, title, price, image, stock, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-8 space-y-4">
      {category === "CRAFT_SUPPLIES" && stock > 1 && (
        <div className="flex items-center gap-4">
          <label className="font-arabic text-olive text-sm">الكمية:</label>
          <div className="flex items-center border border-brown/15 rounded">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 text-olive hover:bg-olive/5 cursor-pointer"
            >
              −
            </button>
            <span className="px-4 font-ui">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(stock, quantity + 1))}
              className="px-3 py-2 text-olive hover:bg-olive/5 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          disabled={stock === 0}
          className="btn-primary flex-1"
        >
          {stock === 0 ? "نفذت الكمية" : added ? "✓ تمت الإضافة" : "أضف للسلة"}
        </button>
        <button onClick={() => router.push("/checkout")} className="btn-outline">
          الذهاب للسلة
        </button>
      </div>
    </div>
  );
}
