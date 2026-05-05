import { NextResponse } from "next/server";

import { getCommerceRates } from "@/lib/siteCommerce";

export async function GET() {
  try {
    const rates = await getCommerceRates();
    return NextResponse.json({ ok: true as const, rates });
  } catch {
    return NextResponse.json({ ok: false as const, error: "unavailable" }, { status: 503 });
  }
}
