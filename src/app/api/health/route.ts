import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hasDbUrl = Boolean(process.env.DATABASE_URL);
    const hasDirectUrl = Boolean(process.env.DIRECT_URL);
    const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

    const productCount = await prisma.product.count();

    return NextResponse.json({
      ok: true,
      env: { hasDbUrl, hasDirectUrl, hasSupabaseUrl },
      productCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        env: {
          hasDbUrl: Boolean(process.env.DATABASE_URL),
          hasDirectUrl: Boolean(process.env.DIRECT_URL),
          hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        },
        error: message,
      },
      { status: 500 }
    );
  }
}
