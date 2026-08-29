import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import CustomOrderForm from "@/components/CustomOrderForm";
import GridPattern from "@/components/GridPattern";

export default async function CustomOrderPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?redirect=/custom-order");

  return (
    <div className="bg-burgundy relative overflow-hidden">
      <GridPattern />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-arabic font-bold text-ivory">
            طلب مخصص
          </h1>
          <p className="text-ivory/70 font-arabic mt-3">
            صف لنا فكرتك وسنحوّلها إلى قطعة فريدة
          </p>
        </div>

        <div className="bg-ivory rounded p-8 border border-brown/15">
          <CustomOrderForm />
        </div>
      </div>
    </div>
  );
}
