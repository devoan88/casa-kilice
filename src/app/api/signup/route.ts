import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { passwordPolicySchema } from "@/lib/security/passwordPolicy";
import { sanitizeEmail, sanitizePlainText } from "@/lib/security/sanitize";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  password: passwordPolicySchema,
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const name = sanitizePlainText(parsed.data.name, 80);
  const email = sanitizeEmail(parsed.data.email);
  const password = parsed.data.password;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "Email already in use" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return NextResponse.json({ ok: true });
}

