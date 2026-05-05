import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";

import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { authOptions } from "@/lib/auth";
import { getCasaBankDetails } from "@/lib/bankDetails";

export const metadata: Metadata = {
  title: "Checkout — Casa Kilicé",
  description: "Complete your Casa Kilicé order.",
};

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  const bank = getCasaBankDetails();

  return <CheckoutClient bank={bank} defaultEmail={session?.user?.email ?? ""} />;
}
