export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminCategories } from "@/actions/admin-categories";
import ProductEditForm from "@/components/admin/ProductEditForm";
import { requireAdmin } from "@/lib/auth";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    getAdminCategories(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-arabic font-bold text-olive mb-8">تعديل المنتج</h1>
      <ProductEditForm product={product} categories={categories} />
    </div>
  );
}
