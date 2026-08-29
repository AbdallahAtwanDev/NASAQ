import { NextRequest, NextResponse } from "next/server";
import { calculateMakerCommissions } from "@/lib/commission";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await calculateMakerCommissions();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Commission cron error:", error);
    return NextResponse.json(
      { error: "Failed to calculate commissions" },
      { status: 500 }
    );
  }
}
