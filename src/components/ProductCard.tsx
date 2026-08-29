"use client";

import Image from "next/image";
import Link from "next/link";
import { formatEGP } from "@/lib/constants";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  images: string[];
  isUniquePiece: boolean;
  makerName?: string;
  category?: string;
}

export default function ProductCard({
  id,
  title,
  price,
  images,
  isUniquePiece,
  makerName,
}: ProductCardProps) {
  const mainImage = images[0] || "/assets/placeholder-product.svg";
  const hoverImage = images[1] || mainImage;

  return (
    <Link href={`/products/${id}`} className="card group cursor-pointer">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={mainImage}
          alt={title}
          fill
          className="object-cover transition-opacity duration-500 group-hover:opacity-0"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <Image
          src={hoverImage}
          alt={title}
          fill
          className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {isUniquePiece && (
          <span className="absolute top-3 right-3 badge-mustard">
            قطعة واحدة فقط
          </span>
        )}
        <span className="absolute top-3 left-3 badge-mustard bg-olive/10 text-olive">
          صنع يدوياً
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-arabic text-olive font-medium truncate">{title}</h3>
        {makerName && (
          <p className="text-sm text-charcoal/50 font-arabic mt-1">{makerName}</p>
        )}
        <p className="text-mustard font-ui font-semibold mt-2">{formatEGP(price)}</p>
      </div>
    </Link>
  );
}
