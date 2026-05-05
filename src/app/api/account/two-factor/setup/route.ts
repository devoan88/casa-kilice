import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { buildTotpKeyUri, generateTotpSecret } from "@/lib/twoFactor/otp";

export const runtime = "nodejs";

export async function POST() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secret = generateTotpSecret();
  const otpauth = buildTotpKeyUri(email, secret);
  const qrDataUrl = await QRCode.toDataURL(otpauth, {
    width: 220,
    margin: 1,
    color: { dark: "#2a1810", light: "#faf6f0" },
  });

  return NextResponse.json({ secret, otpauthUrl: otpauth, qrDataUrl });
}
